"""Resumen agregado de la prueba reservada, sin mostrar anuncios individuales."""
import csv
import math

from modelo import ROOT, normalizar


ARCHIVO = ROOT / "resultados/error_por_distrito.csv"
MINIMO_ORIENTATIVO = 20
# Desde este error porcentual medio la estimación del distrito no sirve como referencia (Los Olivos 57%, Comas 68%,
# San Martín de Porres 106%...). En esos distritos el modelo además suele quedar por encima del precio pedido:
# en la validación de noviembre sobreestimó el 96% de los anuncios de Los Olivos.
UMBRAL_POCO_CONFIABLE = 30.0


def evidencia_distrital(distrito, archivo=ARCHIVO):
    """Devuelve el error histórico del distrito o None si no hubo casos de prueba.

    El umbral de 20 solo sirve para advertir sobre muestras muy pequeñas;
    no convierte el MAE distrital en una garantía para una vivienda nueva.
    """
    buscado = normalizar(distrito)
    with archivo.open(encoding="utf-8-sig", newline="") as fuente:
        for fila in csv.DictReader(fuente):
            if normalizar(fila["distrito"]) != buscado:
                continue
            cantidad = int(fila["n"])
            mae = float(fila["MAE_soles"])
            if cantidad < 1 or not math.isfinite(mae) or mae < 0:
                raise ValueError("El resumen de prueba por distrito tiene valores inválidos.")
            mape = float(fila["MAPE_porcentaje"])
            return {
                "distrito": buscado,
                "anuncios_prueba": cantidad,
                "error_absoluto_medio_soles": mae,
                "error_porcentual_medio": mape,
                "muestra_pequena": cantidad < MINIMO_ORIENTATIVO,
                "poco_confiable": math.isfinite(mape) and mape >= UMBRAL_POCO_CONFIABLE,
            }
    return None
