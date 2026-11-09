"""Evaluación de la Semana 12: error por rango de precio y coherencia de la app de punta a punta.

No reentrena nada. Usa el código y los modelos de deliveries/week10 tal como están desplegados.

1. Error por rango de precio. Junta las predicciones de la prueba de septiembre y de las validaciones de
   octubre y noviembre, y mide por rango de precio pedido: MAE, MAPE, sesgo y cobertura del rango calibrado,
   frente al baseline de la mediana distrital.
2. Coherencia de punta a punta. Toma 300 departamentos del mercado actual (semilla 42), los pasa por
   POST /api/analizar como lo haría la app, y comprueba reglas que siempre deben cumplirse:
   JSON válido, precio igual al del modelo, tres escenarios ordenados y dentro del rango, una sola sugerencia,
   8 comparables sin repetir, perfil y nivel de accesibilidad asignados, y mide el tiempo de respuesta.

Uso, desde deliveries/week12/code:
    ..\\..\\..\\.venv\\Scripts\\python.exe evaluar_producto.py
Escribe deliveries/week12/resultados/ (sin ids, direcciones, textos ni enlaces de anuncios).
"""
import json
import math
import sys
import time
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

AQUI = Path(__file__).resolve().parent
WEEK10 = AQUI.parents[1] / "week10"
sys.path.insert(0, str(WEEK10 / "code"))
warnings.filterwarnings("ignore")

from fastapi.testclient import TestClient  # noqa: E402

import api  # noqa: E402
from modelo import predecir  # noqa: E402

SALIDA = AQUI.parent / "resultados"
SEMILLA = 42
MUESTRA = 300
RANGOS = [0, 1500, 2500, 4000, 7000, math.inf]
ETIQUETAS = ["< 1,500", "1,500 – 2,499", "2,500 – 3,999", "4,000 – 6,999", "≥ 7,000"]
CORTES = {
    "septiembre (prueba, 14-sep)": WEEK10 / "resultados/predicciones_prueba.csv",
    "octubre (23-oct)": WEEK10 / "resultados/validacion_octubre/predicciones.csv",
    "noviembre (9-nov)": WEEK10 / "resultados/validacion_noviembre/predicciones.csv",
}
VIVIENDA = ["distrito_norm", "area_total", "dormitorios", "banos", "estacionamientos", "antiguedad", "mantenimiento",
            "ascensor", "balcon", "terraza", "piscina", "gimnasio", "pet_friendly"]


def error_por_rango():
    radio = api.MODELO_PRECIO["metricas"]["intervalo"]["radio_soles"]
    filas = []
    for corte, archivo in CORTES.items():
        d = pd.read_csv(archivo)
        error = (d["real_soles"] - d["prediccion_soles"]).abs()
        d = d.assign(error=error, ape=100 * error / d["real_soles"], cubierto=error <= radio,
                     error_base=(d["real_soles"] - d["baseline_distrital_soles"]).abs(),
                     residuo=d["real_soles"] - d["prediccion_soles"],
                     rango=pd.cut(d["real_soles"], RANGOS, labels=ETIQUETAS, right=False))
        for rango, g in d.groupby("rango", observed=True):
            filas.append({"corte": corte, "rango_precio_soles": rango, "anuncios": len(g),
                          "MAE_modelo": round(g["error"].mean(), 1), "MAE_mediana_distrital": round(g["error_base"].mean(), 1),
                          "MAPE_modelo": round(g["ape"].mean(), 1), "sesgo_mediano_real_menos_estimado": round(g["residuo"].median(), 1),
                          "cobertura_rango": round(g["cubierto"].mean(), 3)})
        filas.append({"corte": corte, "rango_precio_soles": "Todos", "anuncios": len(d),
                      "MAE_modelo": round(d["error"].mean(), 1), "MAE_mediana_distrital": round(d["error_base"].mean(), 1),
                      "MAPE_modelo": round(d["ape"].mean(), 1), "sesgo_mediano_real_menos_estimado": round(d["residuo"].median(), 1),
                      "cobertura_rango": round(d["cubierto"].mean(), 3)})
    tabla = pd.DataFrame(filas)
    tabla.to_csv(SALIDA / "error_por_rango_precio.csv", index=False, encoding="utf-8")
    return tabla


def _vivienda(fila):
    datos = {}
    for k in VIVIENDA:
        v = fila[k]
        if k == "distrito_norm":
            datos[k] = str(v)
        elif pd.isna(v):
            datos[k] = None
        else:
            datos[k] = int(v) if float(v).is_integer() else float(v)
    return datos


def coherencia():
    mercado = pd.read_csv(WEEK10 / "data/mercado.csv", low_memory=False)
    muestra = mercado.sample(n=MUESTRA, random_state=SEMILLA)
    cliente = TestClient(api.app)
    reglas = {
        "responde_200": 0, "json_estricto": 0, "precio_igual_al_modelo": 0, "tres_escenarios": 0,
        "escenarios_ordenados": 0, "escenarios_dentro_del_rango": 0, "equilibrado_igual_al_esperado": 0,
        "una_sola_sugerencia": 0, "ocho_comparables": 0, "comparables_sin_repetir": 0,
        "perfil_asignado": 0, "nivel_accesibilidad": 0, "tendencia_valida": 0,
    }
    rechazadas, tiempos, en_distrito, similitud, sugeridos, perfiles, niveles = [], [], [], [], {}, {}, {}
    for _, fila in muestra.iterrows():
        vivienda = _vivienda(fila)
        inicio = time.perf_counter()
        r = cliente.post("/api/analizar", json={"vivienda": vivienda})
        tiempos.append(1000 * (time.perf_counter() - inicio))
        if r.status_code != 200:
            rechazadas.append({"status": r.status_code, "detalle": str(r.json().get("detail"))[:160]})
            continue
        reglas["responde_200"] += 1
        try:
            d = json.loads(r.text, parse_constant=lambda c: (_ for _ in ()).throw(ValueError(c)))
            reglas["json_estricto"] += 1
        except ValueError:
            d = r.json()
        precio = d["precio"]
        esperado = predecir(api._vivienda(api.Vivienda(**vivienda)), api.MODELO_PRECIO)
        reglas["precio_igual_al_modelo"] += precio == esperado
        esc = {e["escenario"]: e for e in d["publicacion"]["escenarios"]}
        if set(esc) == {"Competitivo", "Equilibrado", "Renta superior"}:
            reglas["tres_escenarios"] += 1
            c, e, s = (esc[k]["precio_soles"] for k in ("Competitivo", "Equilibrado", "Renta superior"))
            reglas["escenarios_ordenados"] += c < e < s
            lo, hi = precio["limite_inferior_soles"], precio["limite_superior_soles"]
            reglas["escenarios_dentro_del_rango"] += all(lo - 10 <= x <= hi + 10 for x in (c, e, s))
            reglas["equilibrado_igual_al_esperado"] += abs(e - precio["precio_estimado_soles"]) <= 5
        marcados = [k for k, v in esc.items() if v["sugerido"]]
        reglas["una_sola_sugerencia"] += len(marcados) == 1 and marcados[0] == d["publicacion"]["sugerido"]
        sugeridos[d["publicacion"]["sugerido"]] = sugeridos.get(d["publicacion"]["sugerido"], 0) + 1
        comp = d["perfil"]["comparables"]
        reglas["ocho_comparables"] += len(comp) == 8
        reglas["comparables_sin_repetir"] += len({x["anuncio_id"] for x in comp}) == len(comp)
        en_distrito.append(d["perfil"]["en_mismo_distrito"] / max(len(comp), 1))
        similitud.extend(x["Similitud"] for x in comp)
        nombre = d["perfil"]["perfil"]["perfil"]
        reglas["perfil_asignado"] += bool(nombre)
        perfiles[nombre] = perfiles.get(nombre, 0) + 1
        nivel = d["accesibilidad"].get("nivel")
        reglas["nivel_accesibilidad"] += bool(nivel)
        niveles[nivel] = niveles.get(nivel, 0) + 1
        reglas["tendencia_valida"] += d["tendencia"]["tendencia"] in {"Al alza", "Estable", "A la baja"}
    resultado = {
        "fecha": time.strftime("%Y-%m-%d"),
        "mercado": f"data/mercado.csv, captura del {api.MERCADO_INFO['captura']}",
        "muestra": MUESTRA, "semilla": SEMILLA,
        "reglas_cumplidas": reglas,
        "analizadas": reglas["responde_200"],
        "reglas_cumplidas_porcentaje": {k: round(100 * v / max(reglas["responde_200"], 1), 1) for k, v in reglas.items()},
        "rechazadas_por_validacion": {"anuncios": len(rechazadas), "detalle": rechazadas,
                                      "nota": "Anuncios del mercado sin dormitorios o baños: la API los rechaza con 422 y un mensaje, "
                                              "como debe (el formulario los exige). Los porcentajes se calculan sobre las analizadas."},
        "comparables": {"porcentaje_en_el_mismo_distrito_medio": round(100 * float(np.mean(en_distrito)), 1),
                        "similitud_mediana": round(float(np.median(similitud)), 3)},
        "escenario_sugerido": sugeridos, "perfiles": perfiles, "niveles_accesibilidad": niveles,
        "tiempo_respuesta_ms": {"mediana": round(float(np.median(tiempos)), 1), "p95": round(float(np.percentile(tiempos, 95)), 1),
                                "maximo": round(float(np.max(tiempos)), 1),
                                "nota": "Medido en local con TestClient; no incluye red ni el arranque en frío de Render."},
    }
    (SALIDA / "coherencia_producto.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")
    return resultado


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    tabla = error_por_rango()
    print(tabla.to_string(index=False))
    resultado = coherencia()
    print(json.dumps({k: resultado[k] for k in ("analizadas", "reglas_cumplidas_porcentaje", "comparables", "escenario_sugerido",
                                                 "perfiles", "niveles_accesibilidad", "tiempo_respuesta_ms")}, ensure_ascii=False, indent=2))
    print("Rechazadas por validación:", resultado["rechazadas_por_validacion"]["anuncios"])


if __name__ == "__main__":
    main()
