# Evaluación, baselines y casos de estudio

El informe completo es `deliveries/week12/EvaluationReport.md`. Antes de la entrega hay que agregarle los
resultados de las pruebas con usuarios (`deliveries/week12/GuionPruebasUsuarios.md`) y, si se hace, el rango
de precio proporcional.

| Tema | Archivo |
|---|---|
| Métricas de prueba y baselines (MAE, RMSE, MAPE, R²) | `deliveries/week10/resultados/metricas.json` |
| Validación temporal | `deliveries/week10/resultados/validacion_octubre/`, `validacion_noviembre/` |
| Error por rango de precio | `deliveries/week12/resultados/error_por_rango_precio.csv` |
| Error por distrito | `deliveries/week10/resultados/error_por_distrito.csv`, `validacion_*/error_por_distrito.csv` |
| Perfil competitivo | `deliveries/week10/resultados/metricas_perfil.json` |
| Tendencia (SARIMA contra baselines naive) | `deliveries/week10/resultados/tendencia_distrital.json` |
| Coherencia de la app de punta a punta | `deliveries/week12/resultados/coherencia_producto.json` |
| Recomendador según el perfil del inquilino (modelo 7) | `deliveries/week12/EvaluationReport.md` §6b · `deliveries/week12/resultados/recomendador_*.{json,csv}` |
| Casos de estudio | `deliveries/week12/EvaluationReport.md` §7 · `deliveries/week12/resultados/casos_estudio.json` |
| Pruebas automáticas (47) | `deliveries/week10/code/test_*.py` |
| Pruebas con usuarios | `deliveries/week12/plantilla_observaciones.csv` (pendiente) |

## Cifras para el informe y la presentación
| | Valor |
|---|---|
| MAE de prueba (septiembre) | S/ 553 · mediana distrital S/ 993 · mediana global S/ 1,216 |
| MAE con anuncios nuevos | S/ 512 (octubre) · S/ 541 (noviembre) |
| R² | 0.76 (prueba) · 0.78 (octubre y noviembre) |
| Cobertura del rango de 90% | 92.2% (prueba) · 93.5% (octubre) · 92.2% (noviembre) · solo 34% desde S/ 7,000 |
| Perfiles | k = 4, silhouette 0.21, ARI 1.00 |
| SARIMA | MAE mediano 2.00 S/ por m² contra 2.54 del naive estacional y 2.40 del naive |
| Coherencia | 297 de 297 análisis cumplen las 13 reglas |
| Recomendador (60 perfiles de prueba) | precision@12 82% contra 18–24% de los órdenes del buscador y 25% al azar · 3,193 motivos verificados, 100% correctos |
