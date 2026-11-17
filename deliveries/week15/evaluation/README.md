# Evaluación, baselines y casos de estudio

El informe completo es `deliveries/week12/EvaluationReport.md`. Antes de la entrega hay que agregarle los
resultados de las pruebas con usuarios (`deliveries/week12/GuionPruebasUsuarios.md`). El rango de precio
proporcional ya está incorporado (ver `REVISION_DepaRent_13-11-2026.md` en la raíz).

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
| Pruebas automáticas (76) | `deliveries/week10/code/test_*.py` |
| Pruebas con usuarios | `deliveries/week12/pruebas_usuarios/` · `EvaluationReport.md` §6c (2 sesiones de 5, inquilinos; faltan propietarios) |

## Cifras para el informe y la presentación
| | Valor |
|---|---|
| MAE de prueba (septiembre) | S/ 553 · mediana distrital S/ 993 · mediana global S/ 1,216 |
| MAE con anuncios nuevos | S/ 512 (octubre) · S/ 541 (noviembre) |
| R² | 0.76 (prueba) · 0.78 (octubre y noviembre) |
| Cobertura del rango de 90% (proporcional) | 92.7% (prueba) · 94.2% (octubre) · 93.5% (noviembre) |
| Cobertura desde S/ 7,000 (antes → ahora) | prueba 58.8% → 79.4% · octubre 37.0% → 60.5% · noviembre 34.2% → 65.8% |
| Cobertura bajo S/ 1,500 (antes → ahora) | prueba 89.1% → 80.4% · octubre 99.1% → 92.2% · noviembre 99.2% → 91.3% |
| Perfiles | k = 4, silhouette 0.21, ARI 1.00 |
| SARIMA | MAE mediano 2.00 S/ por m² contra 2.54 del naive estacional y 2.40 del naive |
| Coherencia | 296 de 296 análisis cumplen las 13 reglas |
| Recomendador (60 perfiles de prueba) | precision@12 82% contra 17–23% de los órdenes del buscador y 25% al azar · 3,127 motivos verificados, 100% correctos |
