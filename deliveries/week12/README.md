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

## Actualización al 16 de noviembre
- **Revisión del profesor (14-nov) integrada en `main`:** rango de precio proporcional al estimado, panel de análisis con
  gráficos, ayuda integrada, comparador de hasta 3 anuncios, recomendaciones sin cuenta y demo local de 300 cuentas
  (`/REVISION_DepaRent_13-11-2026.md`).
- **Pruebas con usuarios:** 2 sesiones con inquilinos (P2 y P3) y 2 con propietarios (P5 y P6) en `pruebas_usuarios/` y resumen en
  `EvaluationReport.md` §6c.
- **Ajustes de interfaz según esas pruebas:** etiqueta «No es el plano real» en el esquema, motivos de cada
  recomendación como lista, distritos cercanos cuando no hay resultados, explicación del rango, nota «¿Qué es esto?» en
  la tendencia y el motivo del precio sugerido junto a los tres escenarios.
- **Datos (17-nov):** mercado de la app actualizado con la captura del 17 de noviembre (6,345 anuncios descargados,
  2,998 únicos). Se volvieron a correr los perfiles, los casos de estudio, la coherencia, el recomendador y la
  validación temporal (`week10/resultados/validacion_2026_11_17/`: MAE S/ 534, cobertura 93.8%).

## Contenido

| Archivo | Qué es |
|---|---|
| `EvaluationReport.md` | Métricas, estrategia de validación, comparación con baselines, análisis de errores, coherencia del producto, casos de estudio y limitaciones |
| `GuionPruebasUsuarios.md` | Guion para las pruebas con 5 usuarios (tareas, preguntas, cuestionario) |
| `plantilla_observaciones.csv` | Plantilla anónima para anotar cada sesión |
| `PlanFinal.md` | Tareas y responsables hasta la Semana 15 |
| `pruebas_usuarios/` | Sesiones P2 y P3 (Word y Excel), P5 y P6 (Word), `observaciones.csv` consolidado y resumen |
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
..\..\..\.venv\Scripts\python.exe -m unittest discover -p "test_*.py"     # 77 pruebas
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
