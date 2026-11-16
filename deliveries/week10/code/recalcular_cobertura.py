"""Actualiza solo la cobertura del rango en validaciones ya guardadas.

No reentrena ni descarga anuncios. Lee las predicciones de octubre y noviembre,
hechas con el mismo predictor de precio, y aplica el rango actual del artefacto.
"""
import json

import joblib
import numpy as np
import pandas as pd

from modelo import ROOT, radio_prediccion


def main():
    artefacto = joblib.load(ROOT / "models/modelo_docente.joblib")
    for folder in sorted((ROOT / "resultados").glob("validacion_*/")):
        path = folder / "predicciones.csv"
        meta = folder / "metricas.json"
        if not path.exists() or not meta.exists():
            continue
        rows = pd.read_csv(path)
        pred = rows["prediccion_soles"].to_numpy(float)
        real = rows["real_soles"].to_numpy(float)
        radius = np.array([radio_prediccion(p, artefacto) for p in pred])
        before = float(artefacto["radio_calibrado_soles"])
        result = json.loads(meta.read_text(encoding="utf-8"))
        result["modelo"] = "modelo_docente.joblib, versión rango-proporcional-2; predictor de precio congelado"
        result["intervalo"].update({
            "metodo": artefacto["metricas"]["intervalo"]["metodo"],
            "cobertura_fija_v1": float(np.mean(np.abs(real - pred) <= before)),
            "cobertura_octubre": float(np.mean(np.abs(real - pred) <= radius)),
            "cobertura_septiembre_prueba": artefacto["metricas"]["intervalo"]["cobertura_observada_prueba"],
            "ancho_medio_soles": float(np.mean(2 * radius)),
        })
        result["intervalo"].pop("radio_soles", None)
        meta.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(folder.name, f"v1={result['intervalo']['cobertura_fija_v1']:.1%}",
              f"v2={result['intervalo']['cobertura_octubre']:.1%}")


if __name__ == "__main__":
    main()
