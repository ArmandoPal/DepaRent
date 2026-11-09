"""Evaluación offline del modelo 7 (recomendación según el perfil del inquilino).

No hay historial de clics, así que se usan 60 perfiles de prueba (5 tipos de hogar × 3 presupuestos ×
2 opciones de distritos × 2 variantes: sin prioridades ni lugar / con prioridades y lugar de trabajo).
Cada perfil tiene una LISTA DE REQUISITOS escrita como la diría una persona ("3 dormitorios o más, 80 m² o más,
con seguridad, juegos o áreas verdes"). Es más estricta y distinta de los pesos del recomendador: el
recomendador no sabe qué requisitos tiene cada perfil, solo recibe el cuestionario.

Sobre los mismos candidatos (los que cumplen presupuesto, distritos, dormitorios mínimos y mascotas) se
compara el recomendador con tres órdenes del buscador actual y con un orden al azar:
  - precio: menor precio primero ("Precio: menor primero" en Buscar)
  - oportunidad: más barato frente al estimado primero ("Más barato que el estimado" en Buscar)
  - area: mayor área primero ("Mayor área" en Buscar)
  - azar: promedio de 30 órdenes aleatorios

Métricas en los 12 primeros (lo que muestra la pantalla):
  - precision@12: proporción que cumple TODOS los requisitos del perfil
  - cumplimiento@12: proporción media de requisitos cumplidos (relevancia graduada)
  - nDCG@12: calidad del orden con la relevancia graduada
  - acierto@12: proporción de perfiles con al menos un departamento que cumple todo
  - distritos@12: distritos distintos en la lista (diversidad)
  - cobertura: anuncios distintos que llegan a recomendarse sumando los 60 perfiles
Además se comprueba que cada motivo de "Tiene:" sea verdad en los datos del anuncio.

Uso, desde deliveries/week12/code:
    ..\\..\\..\\.venv\\Scripts\\python.exe evaluar_recomendador.py
Escribe deliveries/week12/resultados/recomendador_*.{json,csv} (sin ids, direcciones ni textos de anuncios).
"""
import itertools
import json
import re
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[1] / "week10" / "code"))
warnings.filterwarnings("ignore")

import api  # noqa: E402
from recomendador import AMENIDADES, NOMBRES_AMENIDAD, _km, candidatos, recomendar, validar_perfil  # noqa: E402

SALIDA = AQUI.parent / "resultados"
K = 12
SEMILLAS_AZAR = 30
LUGAR_TRABAJO = {"latitud": -12.0915, "longitud": -77.0230}   # entre San Isidro y Lince: zona de oficinas

PRESUPUESTOS = {
    "familia": [2500, 3500, 5000], "pareja": [1800, 2500, 3500], "estudiante": [1200, 1800, 2500],
    "mascota": [2000, 3000, 4500], "mayor": [1800, 2500, 3500],
}
DISTRITOS = {
    "familia": ["surco", "san borja", "la molina", "jesus maria"], "pareja": ["barranco", "miraflores", "san isidro"],
    "estudiante": ["lince", "jesus maria", "surquillo", "pueblo libre"], "mascota": ["surco", "san borja", "miraflores", "barranco"],
    "mayor": ["miraflores", "san isidro", "san miguel", "jesus maria"],
}
PRIORIDADES = {
    "familia": ["seguridad", "espacio"], "pareja": ["amenidades"], "estudiante": ["precio", "transporte"],
    "mascota": ["espacio"], "mayor": ["transporte", "seguridad"],
}


def _v(fila, col):
    x = fila.get(col)
    return 0.0 if x is None or pd.isna(x) else float(x)


# Lista de requisitos de cada tipo de hogar, como los diría una persona (cada uno es un sí/no).
REQUISITOS_HOGAR = {
    "familia": [("3 dormitorios o más", lambda f: _v(f, "dormitorios") >= 3), ("80 m² o más", lambda f: _v(f, "area_total") >= 80),
                ("seguridad, juegos o áreas verdes", lambda f: max(_v(f, "seguridad_24_7"), _v(f, "juegos_infantiles"), _v(f, "areas_verdes")) >= 1)],
    "pareja": [("1 o 2 dormitorios", lambda f: 1 <= _v(f, "dormitorios") <= 2), ("balcón o terraza", lambda f: max(_v(f, "balcon"), _v(f, "terraza")) >= 1),
               ("45 m² o más", lambda f: _v(f, "area_total") >= 45)],
    "estudiante": [("paradero a 300 m o menos", lambda f: 0 < _v(f, "dist_paradero_min_m") <= 300), ("2 dormitorios o menos", lambda f: _v(f, "dormitorios") <= 2)],
    "mascota": [("admite mascotas", lambda f: _v(f, "pet_friendly") >= 1), ("terraza o áreas verdes", lambda f: max(_v(f, "terraza"), _v(f, "areas_verdes")) >= 1)],
    "mayor": [("ascensor", lambda f: _v(f, "ascensor") >= 1), ("paradero a 400 m o menos", lambda f: 0 < _v(f, "dist_paradero_min_m") <= 400)],
}
REQUISITOS_PRIORIDAD = {
    "precio": ("no pide más que el estimado", lambda f: f["precio_soles"] <= f["precio_estimado"]),
    "transporte": ("paradero a 300 m o menos", lambda f: 0 < _v(f, "dist_paradero_min_m") <= 300),
    "seguridad": ("seguridad 24/7", lambda f: _v(f, "seguridad_24_7") >= 1),
    "espacio": ("30 m² o más por dormitorio", lambda f: _v(f, "area_total") / max(_v(f, "dormitorios"), 1) >= 30),
    "amenidades": ("3 amenidades o más", lambda f: sum(_v(f, a) >= 1 for a in AMENIDADES) >= 3),
}


def perfiles():
    salida = []
    for hogar in REQUISITOS_HOGAR:
        for presupuesto, con_distritos, variante in itertools.product(PRESUPUESTOS[hogar], (False, True), ("simple", "completo")):
            perfil = {"hogar": hogar, "presupuesto_max": presupuesto, "distritos": DISTRITOS[hogar] if con_distritos else [],
                      "prioridades": PRIORIDADES[hogar] if variante == "completo" else [],
                      "lugar": LUGAR_TRABAJO if variante == "completo" else None}
            salida.append(perfil)
    return salida


def requisitos(perfil, centros):
    lista = list(REQUISITOS_HOGAR[perfil["hogar"]])
    lista += [REQUISITOS_PRIORIDAD[p] for p in perfil["prioridades"] if REQUISITOS_PRIORIDAD[p][0] not in {n for n, _ in lista}]
    if perfil.get("lugar"):
        lugar = perfil["lugar"]
        lista.append(("distrito a 6 km o menos del trabajo", lambda f: (c := centros.get(f["distrito_norm"])) is not None
                      and _km(lugar["latitud"], lugar["longitud"], *c) <= 6))
    return lista


def relevancia(fila, reqs):
    cumplidos = [bool(fn(fila)) for _, fn in reqs]
    return float(np.mean(cumplidos)), all(cumplidos)


def metricas(filas, reqs):
    if not filas:
        return None
    graduada, completa = zip(*(relevancia(f, reqs) for f in filas))
    ideal = sorted(graduada, reverse=True)
    descuento = 1 / np.log2(np.arange(2, len(filas) + 2))
    ndcg = float(np.sum(np.array(graduada) * descuento) / np.sum(np.array(ideal) * descuento)) if sum(ideal) else 0.0
    return {"precision": float(np.mean(completa)), "cumplimiento": float(np.mean(graduada)), "ndcg": ndcg,
            "acierto": float(any(completa)), "distritos": len({f["distrito_norm"] for f in filas})}


def ndcg_contra_ideal(filas, todos, reqs):
    """nDCG@K con el ideal calculado sobre TODOS los candidatos (no solo sobre la lista)."""
    graduada = [relevancia(f, reqs)[0] for f in filas]
    mejores = sorted((relevancia(f, reqs)[0] for f in todos), reverse=True)[:K]
    descuento = 1 / np.log2(np.arange(2, K + 2))
    dcg = float(np.sum(np.array(graduada) * descuento[: len(graduada)]))
    idcg = float(np.sum(np.array(mejores) * descuento[: len(mejores)]))
    return dcg / idcg if idcg else 0.0


# ---------- Veracidad de las explicaciones ("Tiene:") ----------
NOMBRE_A_COLUMNA = {v: k for k, v in NOMBRES_AMENIDAD.items()} | {"cochera": "estacionamientos"}


def motivo_verdadero(m, f, perfil, centros):
    if (r := re.fullmatch(r"(\d+) dormitorios?", m)):
        return int(r[1]) == int(_v(f, "dormitorios"))
    if (r := re.fullmatch(r"(\d+) m² por dormitorio", m)):
        return int(r[1]) == round(_v(f, "area_total") / max(_v(f, "dormitorios"), 1))
    if (r := re.fullmatch(r"(\d+) m²", m)):
        return int(r[1]) == round(_v(f, "area_total"))
    if (r := re.fullmatch(r"paradero a (\d+) m", m)):
        return int(r[1]) == round(_v(f, "dist_paradero_min_m"))
    if (r := re.fullmatch(r"(\d+)% por debajo del estimado", m)):
        return int(r[1]) == round(100 * (1 - f["precio_soles"] / f["precio_estimado"]))
    if (r := re.fullmatch(r"(\d+) amenidades", m)):
        return int(r[1]) == sum(_v(f, a) >= 1 for a in AMENIDADES)
    if (r := re.fullmatch(r"distrito a ([\d.]+) km de tu trabajo o estudio", m)):
        c = centros.get(f["distrito_norm"])
        return c is not None and abs(float(r[1]) - _km(perfil["lugar"]["latitud"], perfil["lugar"]["longitud"], *c)) < 0.06
    if m == "balcón o terraza":
        return max(_v(f, "balcon"), _v(f, "terraza")) >= 1
    if m in NOMBRE_A_COLUMNA:
        return _v(f, NOMBRE_A_COLUMNA[m]) >= 1
    return None   # motivo sin regla de comprobación


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    centros = api.cargar_red()["centros"]
    tabla = api.MERCADO.copy()
    por_fila = tabla.set_index("id")
    filas_resultado, recomendados, motivos = [], set(), {"verdaderos": 0, "falsos": 0, "sin_regla": 0, "ejemplos_falsos": []}
    for n, perfil in enumerate(perfiles(), start=1):
        validado = validar_perfil(perfil)
        cand = candidatos(tabla, validado)
        if not len(cand):
            continue
        reqs = requisitos(perfil, centros)
        todos = cand.to_dict("records")
        ordenes = {
            "recomendador": [por_fila.loc[r["id"]].to_dict() | {"id": r["id"]}
                             for r in recomendar(tabla, perfil, centros, limite=K)["recomendaciones"]],
            "buscador_precio": cand.sort_values(["precio_soles", "id"]).head(K).to_dict("records"),
            "buscador_oportunidad": cand.assign(r=cand["precio_soles"] / cand["precio_estimado"]).sort_values(["r", "id"]).head(K).to_dict("records"),
            "buscador_area": cand.sort_values(["area_total", "id"], ascending=[False, True]).head(K).to_dict("records"),
        }
        for metodo, filas in ordenes.items():
            m = metricas(filas, reqs)
            m["ndcg"] = ndcg_contra_ideal(filas, todos, reqs)
            filas_resultado.append({"perfil": n, "hogar": perfil["hogar"], "presupuesto": perfil["presupuesto_max"],
                                    "con_distritos": bool(perfil["distritos"]), "variante": "completo" if perfil["prioridades"] else "simple",
                                    "candidatos": len(cand), "requisitos": " + ".join(r for r, _ in reqs),
                                    "metodo": metodo, **m})
        azar = []
        for s in range(SEMILLAS_AZAR):
            filas = cand.sample(n=min(K, len(cand)), random_state=s).to_dict("records")
            m = metricas(filas, reqs)
            m["ndcg"] = ndcg_contra_ideal(filas, todos, reqs)
            azar.append(m)
        filas_resultado.append({"perfil": n, "hogar": perfil["hogar"], "presupuesto": perfil["presupuesto_max"],
                                "con_distritos": bool(perfil["distritos"]), "variante": "completo" if perfil["prioridades"] else "simple",
                                "candidatos": len(cand), "requisitos": " + ".join(r for r, _ in reqs), "metodo": "azar",
                                **{k: float(np.mean([a[k] for a in azar])) for k in azar[0]}})
        # Explicaciones y cobertura del recomendador
        for r in recomendar(tabla, perfil, centros, limite=K)["recomendaciones"]:
            recomendados.add(r["id"])
            f = por_fila.loc[r["id"]].to_dict()
            for motivo in r["motivos"]:
                v = motivo_verdadero(motivo, f, validado, centros)
                clave = "sin_regla" if v is None else ("verdaderos" if v else "falsos")
                motivos[clave] += 1
                if v is False and len(motivos["ejemplos_falsos"]) < 10:
                    motivos["ejemplos_falsos"].append(motivo)

    detalle = pd.DataFrame(filas_resultado)
    detalle.round(4).to_csv(SALIDA / "recomendador_por_perfil.csv", index=False, encoding="utf-8")
    columnas = ["precision", "cumplimiento", "ndcg", "acierto", "distritos"]
    resumen = detalle.groupby("metodo")[columnas].mean().round(3)
    por_hogar = detalle.pivot_table(index="hogar", columns="metodo", values="precision", aggfunc="mean").round(3)
    resultado = {
        "perfiles_evaluados": int(detalle["perfil"].nunique()), "K": K, "semillas_azar": SEMILLAS_AZAR,
        "mercado": f"data/mercado.csv, captura del {api.MERCADO_INFO['captura']}",
        "resumen": resumen.to_dict(orient="index"),
        "precision_por_hogar": por_hogar.to_dict(orient="index"),
        "precision_por_variante": detalle.pivot_table(index="variante", columns="metodo", values="precision", aggfunc="mean").round(3).to_dict(orient="index"),
        "cobertura_recomendador": {"anuncios_distintos": len(recomendados), "mercado": int(len(tabla)),
                                   "porcentaje": round(100 * len(recomendados) / len(tabla), 1)},
        "explicaciones": {**motivos, "porcentaje_verdaderos": round(100 * motivos["verdaderos"] / max(motivos["verdaderos"] + motivos["falsos"], 1), 1)},
        "lectura": "Requisitos escritos aparte de los pesos del recomendador, pero sobre los mismos atributos: mide si ordena según "
                   "lo declarado mejor que el buscador, no si a personas reales les gusta (eso va en las pruebas con usuarios).",
    }
    (SALIDA / "recomendador_evaluacion.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")
    print(resumen.to_string())
    print(por_hogar.to_string())
    print(json.dumps({k: resultado[k] for k in ("precision_por_variante", "cobertura_recomendador", "explicaciones")}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
