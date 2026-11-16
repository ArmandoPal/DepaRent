"""Consultas de sensibilidad al modelo congelado; sin entrenamiento."""
import copy
import csv
import hashlib
import io
import json
from modelo import ROOT, FEATURES, predecir, validar_entrada

HASHES_MODELO = {
    "models/modelo_docente.joblib": "8d3273080c639867e958d91fa7c0e1c42c37af443f55f37c4a5c7d916fc88512",
    "code/modelo.py": "bc97edac8e8a635e96f402dc81c150566137e6c2dd5237d40db9b367817c3d99",
    "code/entrenar.py": "8f3c466e3e59c272372c53b473afeb215c21bddff327334b3753dd5fcc0ff42b",
    "resultados/metricas.json": "f842ff0e50df832c7692506c7cf5f3115491ea09ea29cfbebca65c855d6fe659",
}
ADVERTENCIA = "Sensibilidad predictiva con entradas hipotéticas. No es un efecto causal, precio observado, rentabilidad ni recomendación de remodelación."
CAMBIABLES = {"area_total", "mantenimiento", "balcon", "gimnasio"}

def verificar_modelo_congelado():
    for relative, expected in HASHES_MODELO.items():
        data = (ROOT / relative).read_bytes()
        if not relative.endswith(".joblib"):
            data = data.replace(b"\r\n", b"\n")  # git puede convertir finales de línea al clonar
        actual = hashlib.sha256(data).hexdigest()
        if actual != expected:
            raise ValueError(f"Cambió un artefacto del modelo: {relative}. Regenerar y documentar una nueva versión antes de simular.")

def comparar(base, cambios, artifact):
    if not isinstance(cambios, dict) or set(cambios) - CAMBIABLES:
        raise ValueError("Solo se comparan área, mantenimiento, balcón y gimnasio.")
    alternate = copy.deepcopy(base)
    alternate.update(cambios)
    validar_entrada(base, artifact)
    validar_entrada(alternate, artifact)
    before, after = predecir(base, artifact), predecir(alternate, artifact)
    difference = round(after["precio_estimado_soles"] - before["precio_estimado_soles"], 2)
    percentage = round(100 * difference / before["precio_estimado_soles"], 2) if before["precio_estimado_soles"] else None
    return {"tipo": "CONSULTA_MODELO_ENTRENADO_ENTRADAS_HIPOTETICAS", "base_entrada": copy.deepcopy(base),
            "alternativa_entrada": alternate, "base_resultado": before, "alternativa_resultado": after,
            "cambios": {key: {"base": base.get(key), "alternativa": alternate[key]} for key in sorted(cambios) if base.get(key) != alternate[key]},
            "diferencia_soles": difference, "diferencia_porcentaje": percentage,
            "advertencia": ADVERTENCIA,
            "interpretacion_intervalos": "Rangos de precio individuales calibrados; no constituyen un intervalo estadístico para la diferencia.",
            "soporte": "El conteo distrital no prueba que la combinación concreta de atributos tenga soporte suficiente."}

def csv_comparacion(comparison):
    stream = io.StringIO(newline="")
    columns = ["escenario"] + FEATURES + ["precio_estimado_soles", "limite_inferior_soles", "limite_superior_soles", "baseline_distrital_soles", "anuncios_entrenamiento_distrito", "naturaleza", "advertencias"]
    writer = csv.DictWriter(stream, fieldnames=columns)
    writer.writeheader()
    for name, source, result in [("base", "base_entrada", "base_resultado"), ("alternativa", "alternativa_entrada", "alternativa_resultado")]:
        row = {"escenario": name, **comparison[source], **comparison[result], "naturaleza": "HIPOTETICO_PREDICCION_MODELO"}
        row["advertencias"] = " | ".join(row["advertencias"])
        writer.writerow(row)
    return stream.getvalue()

def json_comparacion(comparison):
    return json.dumps(comparison, ensure_ascii=False, indent=2, allow_nan=False)
