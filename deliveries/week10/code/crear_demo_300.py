"""Crea una base SQLite de demostración con 300 cuentas ficticias y actividad coherente.

La base operativa de DepaRent no se modifica. Los anuncios de prueba alimentan
solo el tablero: la API los excluye de la búsqueda y de las recomendaciones.
"""
import argparse
import csv
import hashlib
import json
import random
import time
from datetime import datetime, timedelta
from pathlib import Path

import cuentas
from modelo import ROOT

SEMILLA = 20261114
TOTAL = 300
CORREO_ANALISTA = "demo-analista@ejemplo.invalid"
BASE_DEMO = ROOT / "data/deparent_demo_300.sqlite"
CSV_DEMO = ROOT / "resultados/simulacion_300_usuarios/usuarios_300.csv"
DISTRITOS = ("lince", "miraflores", "san miguel", "surco", "jesus maria")


def _fecha(i, rng, ahora):
    hoy = datetime.fromtimestamp(ahora, cuentas.HORA_LIMA).date()
    dia = hoy - timedelta(days=29 - rng.choices(range(30), weights=range(1, 31), k=1)[0])
    instante = datetime(dia.year, dia.month, dia.day, rng.randrange(8, 22),
                        rng.randrange(60), tzinfo=cuentas.HORA_LIMA).timestamp()
    return min(instante, ahora - 1)


def _exportar_csv(conexion, destino):
    """Exporta solo etapas y fechas; no incluye correos, claves ni mensajes."""
    destino = Path(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    filas = conexion.execute(
        "SELECT u.id, u.creado, "
        "EXISTS(SELECT 1 FROM perfiles_inquilino p WHERE p.usuario_id = u.id) AS perfil, "
        "EXISTS(SELECT 1 FROM guardados g WHERE g.usuario_id = u.id) AS guardado, "
        "EXISTS(SELECT 1 FROM departamentos d WHERE d.usuario_id = u.id) AS departamento, "
        "EXISTS(SELECT 1 FROM departamentos d WHERE d.usuario_id = u.id AND d.precio_publicado IS NOT NULL) AS publicado, "
        "EXISTS(SELECT 1 FROM departamentos d JOIN interesados i ON i.departamento_id = d.id "
        "WHERE d.usuario_id = u.id) AS mensaje "
        "FROM usuarios_simulados s JOIN usuarios u ON u.id = s.usuario_id ORDER BY u.id"
    ).fetchall()
    with destino.open("w", encoding="utf-8-sig", newline="") as archivo:
        salida = csv.writer(archivo)
        salida.writerow(("usuario_demo", "fecha_cuenta_lima", "perfil", "guardado",
                         "departamento", "publicado", "recibio_mensaje"))
        for n, fila in enumerate(filas, 1):
            fecha = datetime.fromtimestamp(fila["creado"], cuentas.HORA_LIMA).date()
            salida.writerow((f"U{n:03}", fecha.isoformat(), *(int(fila[c]) for c in
                            ("perfil", "guardado", "departamento", "publicado", "mensaje"))))
    return destino


def crear_demo_300(archivo=BASE_DEMO, ahora=None, csv_salida=CSV_DEMO):
    """Siembra solo cuentas faltantes; una segunda ejecución conserva registros reales."""
    archivo = Path(archivo).resolve()
    if "demo" not in archivo.stem.lower() or archivo.suffix.lower() != ".sqlite":
        raise ValueError("Usa un archivo .sqlite cuyo nombre incluya «demo»; nunca la base operativa.")
    if archivo == (ROOT / "data/deparent.sqlite").resolve():
        raise ValueError("No se puede usar la base operativa.")
    ahora = time.time() if ahora is None else ahora
    rng = random.Random(SEMILLA)
    conexion = cuentas.conectar(archivo)  # Ruta explícita: DATABASE_URL nunca recibe la simulación.
    try:
        existentes = conexion.execute("SELECT COUNT(*) AS n FROM usuarios").fetchone()["n"]
        marcados = conexion.execute("SELECT COUNT(*) AS n FROM usuarios_simulados").fetchone()["n"]
        if existentes and not marcados:
            raise ValueError("El archivo ya contiene cuentas sin marcar. Elige una base demo nueva.")
        if marcados > TOTAL:
            raise ValueError("La base ya tiene más de 300 cuentas marcadas como simuladas.")
        with conexion:
            for i in range(1, TOTAL + 1):
                creado = _fecha(i, rng, ahora)
                email = CORREO_ANALISTA if i == 1 else f"demo-{i:03}@ejemplo.invalid"
                fila = conexion.execute("SELECT id FROM usuarios WHERE email = ?", (email,)).fetchone()
                if fila is not None:
                    marcado = conexion.execute(
                        "SELECT 1 FROM usuarios_simulados WHERE usuario_id = ?", (fila["id"],)
                    ).fetchone()
                    if marcado is None:
                        raise ValueError(f"Existe una cuenta sin marcar con el identificador demo {i}.")
                    continue
                # Hash sin contraseña utilizable: nadie puede entrar como un usuario ficticio.
                sal = hashlib.sha256(f"sal-demo-{i}".encode()).digest()[:16]
                hash_inutilizable = hashlib.sha256(f"hash-demo-{i}".encode()).digest()
                usuario = conexion.execute(
                    "INSERT INTO usuarios (nombre, email, sal, hash, creado) VALUES (?, ?, ?, ?, ?)",
                    (f"Usuario simulado {i:03}", email, sal, hash_inutilizable, creado)
                ).lastrowid
                conexion.execute("INSERT INTO usuarios_simulados (usuario_id) VALUES (?)", (usuario,))
                distrito = DISTRITOS[(i - 1) % len(DISTRITOS)]
                actividad = min(ahora - 1, creado + 3600)
                if i != 1 and i % 5 != 0:
                    perfil = {"hogar": "pareja", "presupuesto_max": 3000,
                              "distritos": [distrito], "orden": "precio"}
                    conexion.execute(
                        "INSERT INTO perfiles_inquilino (usuario_id, perfil, actualizado) VALUES (?, ?, ?)",
                        (usuario, json.dumps(perfil), actividad))
                    if i % 3 == 0:
                        conexion.execute(
                            "INSERT INTO guardados (usuario_id, anuncio_id, datos, creado) VALUES (?, ?, ?, ?)",
                            (usuario, "m151029022", json.dumps({"simulado": True}), min(ahora - 1, actividad + 600)))
                if i % 6 == 0:
                    vivienda = {"distrito_norm": distrito, "area_total": 45 + ((i // 6) % 5) * 10,
                                "dormitorios": 1 + ((i // 6) % 3), "banos": 1 + ((i // 6) % 2)}
                    publicado = i % 12 == 0
                    fecha_publicacion = min(ahora - 1, actividad + 1200) if publicado else None
                    cursor = conexion.execute(
                        "INSERT INTO departamentos (usuario_id, nombre, vivienda, resumen, precio_publicado, "
                        "escenario_publicado, publicado_en, creado, actualizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (usuario, f"Departamento simulado {i:03}", json.dumps(vivienda), '{}',
                         1800 + (i % 7) * 150 if publicado else None,
                         "Simulación" if publicado else None, fecha_publicacion, actividad, actividad))
                    if publicado and i % 24 == 0:
                        conexion.execute(
                            "INSERT INTO interesados (departamento_id, nombre, email, mensaje, creado) "
                            "VALUES (?, ?, ?, ?, ?)",
                            (cursor.lastrowid, "Consulta simulada", f"consulta-demo-{i:03}@ejemplo.invalid",
                             "Consulta de prueba para el tablero.", min(ahora - 1, fecha_publicacion + 600)))
        total = conexion.execute("SELECT COUNT(*) AS n FROM usuarios_simulados").fetchone()["n"]
        if total != TOTAL:
            raise ValueError(f"Se esperaban {TOTAL} usuarios simulados y hay {total}.")
        csv_path = _exportar_csv(conexion, csv_salida)
        kpis = cuentas.kpis_producto(conexion, ahora=ahora)
        return {"base": str(archivo), "csv": str(csv_path), "usuarios_simulados": total,
                "usuarios_reales": kpis["simulacion"]["usuarios_reales"],
                "perfiles": kpis["perfiles_completados"], "guardados": kpis["guardados"],
                "departamentos": kpis["departamentos"],
                "publicados": kpis["departamentos_publicados"], "mensajes": kpis["mensajes_interesados"]}
    finally:
        conexion.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--archivo", type=Path, default=BASE_DEMO,
                        help="SQLite de prueba; su nombre debe incluir «demo»")
    parser.add_argument("--csv", type=Path, default=CSV_DEMO,
                        help="Resumen anónimo de los 300 casos")
    args = parser.parse_args()
    resultado = crear_demo_300(args.archivo, csv_salida=args.csv)
    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
