# DepaRent — Informe final

**Curso:** DS3022 Desarrollo de Producto de Datos · UTEC · 2026-2
**Equipo:** Adrian Urbina Mendoza, Armando Martinez Palomino, Breysi Salazar Medina, Luciana Yangali Cáceres
**App:** https://deparent.onrender.com · **Repositorio:** https://github.com/Luciana-y/DepaRent · **Video:** _pendiente_
**Fecha:** 18 de noviembre de 2026

<!--
ESQUELETO. Cada sección dice qué escribir (en cursiva), de dónde sacarlo (Fuente) y quién la redacta.
Borrar las notas en cursiva al terminar. La guía pide el informe en Markdown (este archivo) y en PDF con su
fuente editable: exportar a FinalReport.pdf al final (por ejemplo, con pandoc o desde VS Code).
-->

## Resumen
_Un párrafo: problema, solución, datos, resultado principal (MAE S/ 553 contra S/ 993 del baseline) y estado
del producto._ — Redacta: Adrian (al final).

## 1. Problema y motivación
_Qué le pasa a un propietario en Lima al fijar el alquiler; por qué importa; entrada (características del
departamento) y salida (precio esperado, comparables, estrategia de publicación)._
Fuente: `README.md` raíz §1, `week05/ProjectProposal.pdf`, `week07/Delivery1Report.pdf`. — Redacta: Adrian.

## 2. Usuarios y propuesta de valor
_Propietario (principal) e inquilino (secundario): necesidades y qué gana cada uno._
Fuente: `README.md` raíz §2, `week10/PRODUCT.md`, `DataProductCanvas.pdf`. — Redacta: Luciana.

## 3. Trabajo relacionado
_Cómo se resuelve hoy: portales de anuncios (Adondevivir, Urbania), modelos de precios hedónicos, valuadores
automáticos (AVM, como el Zestimate de Zillow), estudios de mercado del BCRP. Qué agrega DepaRent._
Fuente: buscar 3–5 referencias y citarlas. — Redacta: Breysi.

## 4. Datos
### 4.1 Fuentes
_Anuncios (septiembre + capturas diarias), BCRP, ATU: qué contiene cada una, fechas, volumen, licencia/uso._
Fuente: `week04/README.md`, `week04/acquisition.md`, `week15/data/README.md`. — Redacta: Armando.
### 4.2 Preparación
_Limpieza, deduplicación entre portales, valores fuera de rango, integración espacial ATU (cKDTree), series BCRP._
Fuente: `week04/data_quality.md`, `week06/DataAnalysis.md`, `week07/code/EDA_week07.ipynb`. — Redacta: Adrian.
### 4.3 Análisis exploratorio
_3–4 hallazgos con gráfico: distribución de precios, precio por distrito, relación área-precio, sesgos._
Fuente: `week06/DataAnalysis.md`, `week06/imagenes/`. — Redacta: Armando.

## 5. Requisitos
_Resumen de requisitos funcionales y no funcionales y cuáles se cumplieron (tabla de `Requirements.md`)._
Fuente: `week15/Requirements.md`. — Redacta: Armando.

## 6. Enfoque analítico
_Los 6 componentes: qué hace cada uno, por qué ese método, baseline, entrada y salida._
1. Perfil competitivo (K-Means k = 4 + vecinos) · 2. Accesibilidad (ATU) · 3. Precio esperado
(HistGradientBoosting + rango calibrado) · 4. Tendencia (SARIMA) · 5. Escenarios de publicación (reglas) ·
6. Simulador y laboratorio de área.
Fuente: `week06/ModelSelection.md`, `week10/PrototypeReport.md` §2, `week10/models/metadata.md`. — Redacta: Breysi.

## 7. Diseño del producto y arquitectura
_Arquitectura (diagrama), flujos de propietario e inquilino, decisiones de diseño de interfaz, privacidad._
Fuente: `architecture/*.png`, `week10/DESIGN.md`, `week10/PRODUCT.md`, `week10/README.md`. — Redacta: Luciana.

## 8. Proceso de prototipado
_Cómo evolucionó: bocetos y wireframes (Semana 7) → prototipo (Semana 10) → refinado (Semana 12) → final.
Qué cambió por la retroalimentación del profesor y de los usuarios._
Fuente: `week07/design/`, `week10/screenshots/`, historial de git. — Redacta: Luciana.

## 9. Evaluación
_Estrategia, métricas, baselines, validación temporal, error por rango y por distrito, coherencia, pruebas
automáticas y **pruebas con usuarios**._
Fuente: `week12/EvaluationReport.md` §1–6, `week15/evaluation/README.md`. — Redacta: Breysi.

## 10. Casos de estudio
_Propietario de Jesús María y búsqueda del inquilino, con capturas de pantalla de la app final._
Fuente: `week12/EvaluationReport.md` §7. — Redacta: Luciana.

## 11. Limitaciones
Fuente: `week12/EvaluationReport.md` §8. — Redacta: Breysi.

## 12. Conclusiones y trabajo futuro
_Qué se logró, qué aprendimos, qué haríamos con más tiempo (rango proporcional, precios de contrato, más
distritos, reentrenamiento periódico)._ — Redacta: Adrian.

## 13. Contribución del equipo
Ver `ContributionStatement.md` (se copia aquí la tabla final).

## 14. Reflexión sobre el proceso
Ver `Reflection.md` (se copia aquí la versión final).

## Referencias
_Fuentes de datos (BCRP, ATU, portales), librerías (scikit-learn, statsmodels, FastAPI, Leaflet) y trabajos
citados en §3._

## Anexos
- Instrucciones de ejecución: `README.md` raíz.
- Enlaces: app, repositorio, video, página del proyecto, presentación.
