"""Casos de estudio de la Semana 12, ejecutados contra la misma API que usa la app (sin reentrenar).

Caso 1 (propietario): fija el precio de publicación de un departamento de 2 dormitorios en Jesús María.
Caso 2 (inquilino): busca un departamento de 2 dormitorios, hasta S/ 2,500, cerca de un paradero, en
Jesús María, Lince o Surquillo, y revisa primero los que piden menos que el estimado.

Los departamentos del caso 1 son hipotéticos; el caso 2 usa los anuncios reales del mercado actual
(se guardan solo distrito, atributos y precios, sin ids, direcciones, textos ni enlaces).

Uso, desde deliveries/week12/code:
    ..\\..\\..\\.venv\\Scripts\\python.exe casos_estudio.py
Escribe deliveries/week12/resultados/casos_estudio.json.
"""
import json
import sys
import warnings
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parents[1] / "week10" / "code"))
warnings.filterwarnings("ignore")

from fastapi.testclient import TestClient  # noqa: E402

import api  # noqa: E402

SALIDA = AQUI.parent / "resultados"

PROPIETARIO = {"distrito_norm": "jesus maria", "area_total": 70, "dormitorios": 2, "banos": 2, "estacionamientos": 0,
               "antiguedad": 8, "mantenimiento": 250, "ascensor": 1, "balcon": 0, "terraza": 0, "piscina": 0,
               "gimnasio": 0, "pet_friendly": 0}
PRECIO_QUE_PENSABA = 2800   # lo que el propietario pensaba pedir antes de usar la app
INQUILINO = {"distritos": ["jesus maria", "lince", "surquillo"], "precio_max": 2500, "dormitorios_min": 2,
             "paradero_max_m": 300, "orden": "oportunidad", "limite": 60}


def caso_propietario(c):
    analisis = c.post("/api/analizar", json={"vivienda": PROPIETARIO}).json()
    precio, perfil, publ = analisis["precio"], analisis["perfil"], analisis["publicacion"]
    comparables = [{k: x[k] for k in ("Distrito", "Área (m²)", "Dormitorios", "Baños", "Antigüedad", "Precio pedido (S/)", "Similitud")}
                   for x in perfil["comparables"]]
    pensado_vs_comparables = sum(x["Precio pedido (S/)"] < PRECIO_QUE_PENSABA for x in perfil["comparables"])
    balcon = c.post("/api/comparar", json={"vivienda": PROPIETARIO, "cambios": {"balcon": 1}}).json()
    area = c.post("/api/area", json=PROPIETARIO).json()
    return {
        "vivienda": PROPIETARIO, "precio_que_pensaba_pedir": PRECIO_QUE_PENSABA,
        "precio": precio, "evidencia_distrital": analisis["evidencia_distrital"],
        "perfil": perfil["perfil"], "comparables": comparables,
        "comparables_resumen": {k: perfil[k] for k in ("precio_p25_soles", "precio_mediana_soles", "precio_p75_soles", "en_mismo_distrito")},
        "comparables_que_piden_menos_que_lo_pensado": pensado_vs_comparables,
        "accesibilidad": {k: analisis["accesibilidad"][k] for k in ("origen", "dist_paradero_min_m", "paraderos_500m", "nivel",
                                                                     "porcentaje_anuncios_mas_lejos")},
        "tendencia": {k: analisis["tendencia"][k] for k in ("tendencia", "cambio_porcentaje", "serie_propia")},
        "publicacion": {"escenarios": [{k: e[k] for k in ("escenario", "precio_soles", "diferencia_vs_esperado_porcentaje",
                                                           "comparables_mas_baratos_porcentaje", "sugerido")} for e in publ["escenarios"]],
                        "sugerido": publ["sugerido"], "motivo": publ["motivo"]},
        "simulador_balcon": {k: v for k, v in balcon.items() if k != "advertencia"},
        "laboratorio_area": area,
    }


def caso_inquilino(c):
    todos = c.post("/api/buscar", json=INQUILINO).json()
    debajo = c.post("/api/buscar", json={**INQUILINO, "valoracion": "por_debajo"}).json()
    campos = ("distrito", "precio_soles", "precio_estimado_soles", "diferencia_estimado_porcentaje", "valoracion", "area_total", "dormitorios",
              "banos", "dist_paradero_min_m", "perfil")
    primeros = [{k: r.get(k) for k in campos if k in r} for r in debajo["resultados"][:5]]
    return {"filtros": INQUILINO, "total": todos["total"], "conteos": todos["conteos"], "resumen": todos["resumen"],
            "por_debajo_total": debajo["total"], "primeros_por_debajo": primeros, "campos_resultado": sorted(debajo["resultados"][0]) if debajo["resultados"] else [],
            "aviso": todos["aviso"]}


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    c = TestClient(api.app)
    casos = {"mercado": api.MERCADO_INFO["captura_texto"], "propietario": caso_propietario(c), "inquilino": caso_inquilino(c)}
    (SALIDA / "casos_estudio.json").write_text(json.dumps(api.limpiar(casos), ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(api.limpiar(casos), ensure_ascii=False, indent=1)[:9000])


if __name__ == "__main__":
    main()
