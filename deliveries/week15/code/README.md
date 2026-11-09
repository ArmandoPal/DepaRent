# Código de DepaRent por etapa

El código vive donde se ejecuta: el producto en `deliveries/week10/`, porque Render despliega desde ahí. Este
índice responde a lo que pide la guía: scripts de **adquisición, preprocesamiento, análisis, entrenamiento,
inferencia y evaluación**. Las rutas son relativas a la raíz del repositorio.

## 1. Adquisición
| Script | Qué hace |
|---|---|
| `deliveries/week04/acquisition.md` | Cómo se obtuvo la captura de septiembre (Adondevivir, Urbania, BCRP, ATU) |
| `scraper/descarga_diaria.py` | Descarga diaria de anuncios de Adondevivir y Urbania → `data_diaria/` (fuera de git) |
| `scraper/programar_tarea.ps1` | Programa la descarga diaria en Windows |
| `.github/workflows/actualizar-mercado.yml` | La misma descarga diaria en GitHub Actions (hoy bloqueada por los portales, error 403) |

## 2. Preprocesamiento
| Script | Qué hace |
|---|---|
| `deliveries/week07/code/EDA_week07.ipynb` | Limpieza original, integración con ATU y BCRP → `week07/data/*.csv` |
| `deliveries/week10/code/preprocesar.py` | Las mismas reglas del notebook como módulo; lo prueba `test_preprocesar.py` |
| `deliveries/week10/code/preparar_mercado.py` | Prepara el mercado de la app desde la captura más reciente → `week10/data/mercado.csv` |

## 3. Análisis exploratorio
| Script | Qué hace |
|---|---|
| `deliveries/week06/code/EDA_week06_v5.ipynb` | EDA de la Semana 6 (`week06/DataAnalysis.md`) |
| `deliveries/week07/code/EDA_week07.ipynb` | EDA consolidado de la Entrega 1 |

## 4. Entrenamiento
| Script | Modelo | Artefacto |
|---|---|---|
| `deliveries/week10/code/entrenar.py` (+ `modelo.py`) | 3 · Precio esperado (HistGradientBoosting + rango calibrado) | `week10/models/modelo_docente.joblib`, `week10/resultados/metricas.json` |
| `deliveries/week10/code/entrenar_perfil.py` | 1 · Perfil competitivo (K-Means k = 4) | `week10/models/perfil_competitivo.joblib`, `week10/resultados/metricas_perfil.json` |
| `deliveries/week10/code/entrenar_tendencia.py` | 4 · Tendencia distrital (SARIMA) | `week10/resultados/tendencia_distrital.json` |

Los modelos 2 (accesibilidad) y 5 (escenarios de publicación) no se entrenan: son cálculos y reglas explícitas.

## 5. Inferencia (la app)
| Script | Qué hace |
|---|---|
| `deliveries/week10/code/api.py` | API FastAPI; también sirve el frontend |
| `deliveries/week10/code/modelo.py` | Preparación e inferencia del modelo de precio |
| `deliveries/week10/code/perfil_competitivo.py` | Perfil y 8 comparables |
| `deliveries/week10/code/accesibilidad.py` | Paraderos ATU cercanos (cKDTree) |
| `deliveries/week10/code/tendencia.py` | Etiqueta de tendencia del distrito |
| `deliveries/week10/code/escenarios_precio.py` | Tres precios de publicación |
| `deliveries/week10/code/escenarios.py`, `laboratorio_area.py` | Simulador de mejoras y laboratorio de área |
| `deliveries/week10/code/evidencia_distrital.py` | Error del modelo en el distrito, para mostrarlo al usuario |
| `deliveries/week10/code/busqueda.py` | Búsqueda para inquilinos |
| `deliveries/week10/code/cuentas.py` | Cuentas, departamentos e interesados (SQLite o Postgres) |
| `deliveries/week10/code/direcciones.py` | Búsqueda de direcciones (Nominatim) |
| `deliveries/week10/frontend/` | Interfaz web (HTML, CSS y JS en módulos, Leaflet) |
| `deliveries/week10/code/app.py` | Interfaz Streamlit del profesor, conservada como respaldo |

## 6. Evaluación
| Script | Qué mide | Salida |
|---|---|---|
| `deliveries/week10/code/entrenar.py` | Prueba agrupada de septiembre y baselines | `week10/resultados/metricas.json` |
| `deliveries/week10/code/validar_octubre.py --captura AAAA-MM-DD` | Validación temporal con anuncios nuevos | `week10/resultados/validacion_*/` |
| `deliveries/week12/code/evaluar_producto.py` | Error por rango de precio y coherencia de punta a punta | `week12/resultados/` |
| `deliveries/week12/code/casos_estudio.py` | Casos de estudio con la API | `week12/resultados/casos_estudio.json` |
| `deliveries/week10/code/EJERCICIO_FINAL.py` | Ejercicio del profesor: MAE de un distrito | consola |
| `deliveries/week10/code/test_*.py` | 47 pruebas automáticas | `python -m unittest discover -p "test_*.py"` |

## Ejecutar todo (Windows, desde la raíz)
```powershell
py -3.13 -m venv .venv
.venv\Scripts\python.exe -m pip install -r deliveries\week10\code\requirements.txt
cd deliveries\week10\code
..\..\..\.venv\Scripts\python.exe -m unittest discover -p "test_*.py"
..\..\..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000   # abrir http://127.0.0.1:8000
```
