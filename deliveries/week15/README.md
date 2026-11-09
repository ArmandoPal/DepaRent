# Semana 15 — Entrega 2: entrega final (DepaRent)

**Fecha:** miércoles 18 de noviembre de 2026 (presentación pública y entrega).
**App desplegada:** https://deparent.onrender.com
**Video demo:** _pendiente_ · **Página del proyecto:** _pendiente_

Esta carpeta junta la entrega final. El código del producto **sigue en `deliveries/week10/`**, porque Render
despliega desde esas rutas; aquí se indexa por etapa (`code/README.md`) para no duplicarlo.

## Lista de entregables (guía del curso, Delivery 2)

Estado: ✅ listo · 🟡 en progreso · ⬜ pendiente. Responsables según `week12/PlanFinal.md`.

| # | Entregable | Dónde | Estado | Responsable |
|---|---|---|---|---|
| 1 | Producto completo y funcionando | https://deparent.onrender.com · `week10/` | ✅ | Luciana / Armando |
| 2 | Todo el código para construir y ejecutar | `week10/code`, `week10/frontend`, `scraper/` · índice en `code/README.md` | ✅ | Armando |
| 3 | Datos finales (CSV/JSON) o instrucciones de adquisición | `data/README.md` | 🟡 revisar al cierre | Adrian |
| 4 | Scripts de preprocesamiento, análisis, entrenamiento, inferencia y evaluación | `code/README.md` | ✅ | Breysi |
| 5 | Modelos y artefactos | `week10/models/` | ✅ | Breysi |
| 6 | `FinalReport.pdf` + fuente editable | `FinalReport.md` → PDF | ⬜ esqueleto listo | Adrian (+ cada uno su sección) |
| 7 | `PresentationFinal.pptx` + PDF | `presentation/` | ⬜ | Breysi |
| 8 | Video demo de 5–7 min (YouTube) | `video/README.md` | ⬜ | Luciana |
| 9 | Data Product Canvas final | `DataProductCanvas.pdf` | ⬜ | Armando |
| 10 | Especificación final de requisitos | `Requirements.md` | ⬜ esqueleto listo | Armando |
| 11 | Diagramas finales de arquitectura y flujo | `architecture/` | ✅ (actualizar si cambia algo) | Adrian |
| 12 | Resultados de evaluación, baselines y casos de estudio | `evaluation/README.md` → `week12/EvaluationReport.md` | 🟡 faltan pruebas con usuarios | Luciana / Breysi |
| 13 | Página del proyecto (descripción, equipo, imagen, video, instrucciones, enlaces) | `project_page/` | ⬜ | Armando |
| 14 | `README.md` raíz completo (instalación, ejecución, dependencias, datos, modelo, despliegue, limitaciones, solución de problemas) | `/README.md` | ⬜ | Adrian |
| 15 | Contribución de cada integrante | `ContributionStatement.md` | ⬜ esqueleto listo | todos |
| 16 | Reflexión sobre el trabajo en equipo (también va a Canvas) | `Reflection.md` | ⬜ esqueleto listo | todos |

## Requisitos de la presentación (guía, sección 3)
- Habla **cada integrante**.
- Estructura sugerida: problema (con entrada y salida), desafíos, trabajo relacionado, enfoque y resultados,
  impacto (aplicabilidad, limitaciones, mejoras futuras) y demostración.
- Se entrega el `.pptx` editable **y** el PDF, en el repositorio y con el enlace en Canvas.

## Antes de entregar
- [ ] Todos los enlaces (app, video, página) funcionan en una ventana de incógnito.
- [ ] Un integrante clona el repositorio desde cero y sigue el README raíz sin ayuda.
- [ ] No hay credenciales, cadenas de conexión ni datos con direcciones en el repositorio.
- [ ] Archivos sueltos de la raíz (`.tex.txt`, guiones, PDF de la guía, indicaciones) fuera del repositorio o en `.gitignore`.
- [ ] Mercado con una captura reciente y validación temporal repetida.

## Estructura
```text
week15/
├── README.md                  esta lista
├── FinalReport.md             informe final (fuente) → FinalReport.pdf
├── Requirements.md            requisitos finales
├── DataProductCanvas.pdf      canvas final (pendiente)
├── ContributionStatement.md   quién hizo qué
├── Reflection.md              reflexión del equipo
├── architecture/              diagramas finales (.png y .dot)
├── code/README.md             índice de scripts por etapa
├── data/README.md             datos finales y cómo obtenerlos
├── evaluation/README.md       índice de resultados de evaluación
├── presentation/              PresentationFinal.pptx y .pdf
├── video/README.md            enlace al video demo
└── project_page/              página del proyecto
```
