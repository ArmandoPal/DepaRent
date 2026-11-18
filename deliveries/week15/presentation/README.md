# Presentación final

| Archivo | Qué es |
|---|---|
| `PresentationFinal.pptx` | Presentación editable: 17 diapositivas y 4 de respaldo, con notas del orador |
| `PresentationFinal.pdf` | La misma presentación exportada con PowerPoint |
| `Guion_Presentacion_Final.md` | Qué dice cada integrante, tiempos, transiciones y qué no explicar salvo pregunta |
| `capturas/` | Capturas reales de la app del 17-nov-2026 (versión publicada) |
| `crear_presentacion.js` | Genera el `.pptx` (pptxgenjs + sharp) |
| `notas.js` | Notas del orador de cada diapositiva; el guion usa el mismo texto |
| `exportar_pdf.ps1` | Limpia el `.pptx` y exporta el PDF con PowerPoint |

**Pitch de unos 20 minutos** para un público que no sabe machine learning, en cuatro bloques:

| Bloque | Quién | Diapositivas |
|---|---|---|
| 1. Inicio: la problemática y la solución | Breysi | 1–5 |
| 2. Demostración: casos y demo en vivo | Adrian | 6–8 |
| 3. Parte técnica: interfaz, pruebas con usuarios, panel y métricas | Luciana | 9–12 |
| 4. Valor, limitaciones y conclusiones | Armando | 13–17 |

El estilo sigue la presentación de la Semana 10 (`../../week10/PresentationWeek10.pptx`): naranja del cartel, tinta,
durazno y café. Las cifras salen de `../../week12/EvaluationReport.md`, `../../week10/resultados/` y
`../../week12/pruebas_usuarios/`. La diapositiva 14 separa lo medido de las hipótesis de negocio, que no están
validadas. En la diapositiva 11, las cifras de uso del panel son de la base de demostración con 300 cuentas simuladas.

## Regenerar
```powershell
npm install pptxgenjs sharp          # en una carpeta aparte, fuera del repositorio
$env:NODE_PATH = "<esa carpeta>\node_modules"
node crear_presentacion.js
powershell -ExecutionPolicy Bypass -File exportar_pdf.ps1
```
