"""Recalcula las 54 consultas guardadas con el rango actual.

Conserva intacto el catálogo histórico de la versión anterior. Las entradas
son perfiles hipotéticos: no se presentan como anuncios ni resultados causales.
"""
import csv
import json

import joblib

from escenarios import comparar, verificar_modelo_congelado
from modelo import FEATURES, ROOT


def main():
    verificar_modelo_congelado()
    model = joblib.load(ROOT / "models/modelo_docente.joblib")
    old = json.loads((ROOT / "resultados/simulacion_v2/consultas_54.json").read_text(encoding="utf-8"))
    output = ROOT / "resultados/simulacion_rango_proporcional"
    output.mkdir(parents=True, exist_ok=True)
    rows = []
    for item in old["consultas"]:
        base, alternative = item["base_entrada"], item["alternativa_entrada"]
        changes = {k: v for k, v in alternative.items() if base.get(k) != v}
        result = comparar(base, changes, model)
        rows.append({k: item[k] for k in ("id", "perfil", "etiqueta", "factor_area", "factor_mantenimiento", "amenidades")}
                    | result)
    catalog = {
        "version": model["metricas"]["version"], "n_consultas": len(rows),
        "naturaleza": "Consultas hipotéticas recalculadas; no son nuevas observaciones de mercado",
        "modelo": "Mismo predictor de precio; rango proporcional recalibrado con septiembre",
        "consultas": rows,
    }
    (output / "consultas_54.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    columns = ["id", "perfil", "etiqueta", *FEATURES, "precio_estimado_soles", "limite_inferior_soles",
               "limite_superior_soles", "base_precio_estimado_soles", "diferencia_soles", "diferencia_porcentaje",
               "anuncios_entrenamiento_distrito", "advertencias", "naturaleza"]
    with (output / "consultas_54.csv").open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        for item in rows:
            result = item["alternativa_resultado"]
            writer.writerow({"id": item["id"], "perfil": item["perfil"], "etiqueta": item["etiqueta"],
                             **item["alternativa_entrada"],
                             **{k: result[k] for k in ("precio_estimado_soles", "limite_inferior_soles",
                                                           "limite_superior_soles", "anuncios_entrenamiento_distrito")},
                             "base_precio_estimado_soles": item["base_resultado"]["precio_estimado_soles"],
                             "diferencia_soles": item["diferencia_soles"],
                             "diferencia_porcentaje": item["diferencia_porcentaje"],
                             "advertencias": " | ".join(result["advertencias"]),
                             "naturaleza": "HIPOTETICO_PREDICCION_MODELO"})
    print(f"{len(rows)} consultas guardadas en {output}")


if __name__ == "__main__":
    main()
