# Validación temporal con la captura del 17 de noviembre de 2026

Misma validación que `../validacion_noviembre/` (9-nov), con la última captura completa. El modelo de precio sigue
congelado. Las claves de `metricas.json` se llaman `octubre` por herencia del script; aquí se refieren al 17-nov.

```powershell
..\..\..\.venv\Scripts\python.exe validar_octubre.py --captura 2026-11-17
```

| | Valor |
|---|---:|
| Anuncios en la captura · válidos · evaluados (nuevos frente a septiembre, sin duplicados) | 6,345 · 5,478 · 2,063 |
| MAE del modelo (IC 95%) | S/ 534 (497–573) |
| MAPE · R² | 16.4% · 0.797 |
| MAE de la mediana distrital | S/ 1,055 |
| Cobertura del rango proporcional (90% nominal) | 93.8% |
| Cambio de MAE frente a la prueba de septiembre | −3.4% |

Muchos anuncios coinciden con la muestra del 9-nov (siguen publicados), así que las dos validaciones de noviembre no
son independientes. La app muestra la validación más reciente (`api.py` toma la última carpeta `validacion_*`).
