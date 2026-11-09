# Validación temporal: el modelo de septiembre frente a anuncios de noviembre

Repite la validación de `../validacion_octubre/` con la captura diaria del **9 de noviembre de 2026**, ocho semanas
después del entrenamiento. El modelo de precio (`models/modelo_docente.joblib`) sigue congelado: no se reentrena.

Reproducir, desde `deliveries/week10/code` (requiere `data_diaria/`, que no se sube a GitHub):

```powershell
..\..\..\.venv\Scripts\python.exe validar_octubre.py --captura 2026-11-09
```

El script escribe en `resultados/validacion_octubre/`; para conservar ambas, se movió la salida a esta carpeta.
Dentro de `metricas.json` y `error_por_distrito.csv` las claves siguen llamándose `octubre` (por ejemplo
`metricas_octubre`, `MAE_octubre_IC95`, `n_octubre`): en esta carpeta se refieren a la captura del 9 de noviembre.

## Cómo se armó la muestra
| Paso | Anuncios |
|---|---:|
| Captura del 9-nov (Adondevivir 3,219 y Urbania 3,369; sin páginas perdidas) | 6,588 |
| Válidos tras el preprocesamiento de la Semana 7 (`preprocesar.py`) | 5,684 |
| Fuera: ya estaban en septiembre (mismo id) | −859 |
| Fuera: posibles duplicados de anuncios de septiembre (heurística de grupos) | −1,219 |
| Fuera: duplicados dentro de la captura (un anuncio por posible inmueble) | −1,580 |
| **Evaluados** | **2,026** |

## Resultados
| Métrica | Prueba de septiembre (629) | Octubre, 23-oct (1,712) | Noviembre, 9-nov (2,026) |
|---|---:|---:|---:|
| MAE | S/ 553.18 | S/ 512.29 (IC 95%: 476 a 551) | **S/ 541.44** (IC 95%: 503 a 580) |
| RMSE | S/ 1,075.56 | S/ 971.73 | **S/ 1,041.32** |
| MAPE | 18.85% | 16.43% | **16.84%** |
| R² | 0.7622 | 0.7852 | **0.7821** |
| Cobertura del rango de 90% (radio S/ 1,356.95) | 92.2% | 93.5% | **92.2%** |
| Baseline mediana distrital, MAE | S/ 993.23 | S/ 948.07 | S/ 1,023.64 |
| Baseline mediana global, MAE | S/ 1,215.82 | S/ 1,121.09 | S/ 1,192.92 |

Los intervalos de confianza de octubre y noviembre se superponen casi por completo: la subida de S/ 29 en el MAE
es variación de la muestra, no una degradación del modelo. El MAE de noviembre sigue 2.1% por debajo del de la
prueba de septiembre.

**Sensibilidad.** Excluyendo solo por id, sin la heurística de duplicados, se evalúan 2,964 anuncios:
MAE S/ 561.59, MAPE 16.52%, R² 0.7733 y cobertura 91.8%. La conclusión no cambia.

**Sesgo.** La mediana de (precio pedido − estimado) es −S/ 44 y el 45.6% de los anuncios pide más que el estimado.
Igual que en octubre, se pide un poco menos de lo que el modelo aprendió en septiembre, pero la diferencia se achicó.

## Por distrito (`error_por_distrito.csv`)
Con 20 o más anuncios en la prueba de septiembre y en noviembre:

| Distrito | MAE sept. | MAE oct. | MAE nov. |
|---|---:|---:|---:|
| Miraflores | S/ 783 | S/ 758 | S/ 728 |
| Surco | S/ 693 | S/ 550 | S/ 637 |
| San Isidro | S/ 643 | S/ 814 | **S/ 855** |
| San Miguel | S/ 263 | S/ 264 | S/ 270 |
| Jesús María | S/ 246 | S/ 256 | S/ 236 |
| Barranco | S/ 487 | S/ 335 | S/ 379 |
| Lince | S/ 285 | S/ 268 | S/ 307 |
| Surquillo | S/ 244 | S/ 262 | S/ 210 |
| Pueblo Libre | S/ 316 | S/ 283 | S/ 294 |
| Magdalena | S/ 239 | S/ 457 | **S/ 448** |
| Otros | S/ 925 | S/ 856 | S/ 1,108 |

**San Isidro y Magdalena siguen por encima de su error de septiembre en las dos validaciones**: son los distritos a
vigilar si se reentrena. "Otros" agrupa distritos distintos y su error es inestable. El resto tiene menos de 20
anuncios en alguna muestra (por ejemplo Comas, con 13 en noviembre y MAE de S/ 1,413): su error no es fiable.

## Lectura
Ocho semanas después del entrenamiento el modelo **sigue sin degradarse**: error dentro del intervalo de la
validación de octubre, cobertura igual a la de la prueba original y cerca de la mitad del error del mejor baseline.
**No hace falta reentrenar por ahora.** La app usa el mercado del 9 de noviembre (`data/mercado.csv`) con el
modelo de septiembre.

## Límites
- Precios pedidos en anuncios, no de contrato.
- Dos cortes (23-oct y 9-nov): miden desfases cortos, no estacionalidad.
- Las muestras de octubre y noviembre comparten anuncios que siguen publicados; no son independientes.
- La heurística de duplicados puede omitir republicaciones con otro texto o unir viviendas distintas (por eso la sensibilidad).
- `predicciones.csv` guarda solo distrito y precios; no incluye ids, direcciones ni textos de los anuncios.
