# Datos finales de DepaRent

Los datos están en las carpetas donde los usa el código. Este índice dice cuáles son los finales y cómo
obtenerlos de nuevo. **Revisar al cierre** (antes del 18-nov) que el mercado tenga una captura reciente.

## Datos crudos (fuentes)
| Archivo | Fuente | Fecha | Cómo obtenerlo |
|---|---|---|---|
| `deliveries/week04/data/departamentos_alquiler_lima.csv` | Adondevivir y Urbania (anuncios públicos) | 14-sep-2026 | `deliveries/week04/acquisition.md` |
| `deliveries/week04/data/dataset_alquileres_trimestre_bcrp.csv` | BCRP, series trimestrales de precio y PER | 2013-T3 a 2026-T1 | `deliveries/week04/acquisition.md` |
| `deliveries/week04/data/paraderos.csv` | ATU, inventario de paraderos | mayo de 2021 | `deliveries/week04/acquisition.md` |
| `data_diaria/snapshots/AAAA-MM-DD.csv.gz` | Descarga diaria de los mismos portales | desde el 20-oct-2026 | `scraper/descarga_diaria.py` · **no se sube** (tiene direcciones) |

## Datos procesados
| Archivo | Uso |
|---|---|
| `deliveries/week07/data/departamentos_procesados.csv` | Entrenamiento de los modelos de precio y de perfiles (3,128 anuncios) |
| `deliveries/week07/data/paraderos_procesado.csv` | Accesibilidad |
| `deliveries/week07/data/bcrp_procesado.csv`, `bcrp_serie_completa.csv` | Tendencia distrital |
| `deliveries/week10/data/mercado.csv` (+ `mercado.json`) | Mercado que muestra la app: captura del 9-nov-2026, 3,074 anuncios únicos |
| `deliveries/week07/data_dictionary.csv` | Diccionario de datos |

## Particiones y resultados
| Archivo | Contenido |
|---|---|
| `deliveries/week10/resultados/particiones.csv` | Partición de cada anuncio de septiembre (entrenamiento, calibración, prueba) |
| `deliveries/week10/resultados/predicciones_prueba.csv` | Predicciones en la prueba |
| `deliveries/week10/resultados/validacion_*/` | Validación temporal (octubre, noviembre) |
| `deliveries/week12/resultados/` | Error por rango de precio, coherencia y casos de estudio |

## Privacidad
Ningún archivo del repositorio tiene direcciones, coordenadas exactas, teléfonos ni correos de anunciantes. El
mercado guarda el enlace al anuncio original solo para la ficha. Las capturas diarias crudas se quedan fuera de git.
