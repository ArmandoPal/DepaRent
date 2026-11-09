# Semana 12 — Prototipo refinado, evaluación y casos de estudio (DepaRent)

**App desplegada:** https://deparent.onrender.com (comprobación: `/api/salud` → `{"estado":"ok"}`)
**Código del producto:** `deliveries/week10/` (API FastAPI, frontend, modelos, datos y pruebas). Esta carpeta no
duplica el código: agrega la evaluación, los casos de estudio, la documentación actualizada y el plan final.

## Qué cambió desde la Semana 10
- Mercado actualizado con la captura del **9 de noviembre de 2026** (6,588 anuncios descargados, 3,074 únicos en la app).
- Validación temporal del modelo con anuncios de noviembre (`week10/resultados/validacion_noviembre/`).
- La app muestra la validación más reciente sin cambiar el código (`api.py` elige la última `validacion_*`).
- Búsqueda de la dirección del departamento y marcado en el mapa.
- Cuentas y departamentos persistentes en Postgres (Neon) en producción.

## Contenido

| Archivo | Qué es |
|---|---|
| `EvaluationReport.md` | Métricas, estrategia de validación, comparación con baselines, análisis de errores, coherencia del producto, casos de estudio y limitaciones |
| `GuionPruebasUsuarios.md` | Guion para las pruebas con 3–5 usuarios (tareas, preguntas, cuestionario) |
| `plantilla_observaciones.csv` | Plantilla anónima para anotar cada sesión |
| `PlanFinal.md` | Tareas y responsables hasta la Semana 15 |
| `architecture/system_architecture.png` (`.dot`) | Arquitectura actualizada: Render, FastAPI, 6 componentes, Neon, actualización diaria |
| `architecture/product_workflow.png` (`.dot`) | Flujos del propietario y del inquilino |
| `code/evaluar_producto.py` | Error por rango de precio y 13 reglas de coherencia sobre 300 departamentos reales |
| `code/casos_estudio.py` | Los dos casos de estudio, ejecutados con la API |
| `resultados/error_por_rango_precio.csv` | Error y cobertura por rango de precio (septiembre, octubre y noviembre) |
| `resultados/coherencia_producto.json` | Resultado de las reglas de coherencia y tiempos de respuesta |
| `resultados/casos_estudio.json` | Salidas completas de los casos de estudio |

Las capturas de pantalla de la app están en `week10/screenshots/`.

## Reproducir (Windows, desde la raíz del repositorio)

Con el entorno de `week10/README.md` (`.venv` con `week10/code/requirements.txt`):

```powershell
cd deliveries\week10\code
..\..\..\.venv\Scripts\python.exe -m unittest discover -p "test_*.py"     # 47 pruebas
cd ..\..\week12\code
..\..\..\.venv\Scripts\python.exe evaluar_producto.py
..\..\..\.venv\Scripts\python.exe casos_estudio.py
```

Para regenerar los diagramas (requiere Graphviz):
```powershell
cd deliveries\week12\architecture
dot -Tpng -Gdpi=150 system_architecture.dot -o system_architecture.png
dot -Tpng -Gdpi=150 product_workflow.dot -o product_workflow.png
```

## Datos y privacidad
Los resultados guardan solo distrito, atributos y precios: ningún id, dirección, texto ni enlace de anuncio. Las
capturas crudas (`data_diaria/`) tienen direcciones y no se suben a GitHub.
