# DepaRent — Estado del proyecto

**Fecha:** 13 de noviembre de 2026 · **App:** https://deparent.onrender.com · **Repositorio:** https://github.com/Luciana-y/DepaRent
**Equipo:** Adrian Urbina Mendoza, Armando Martinez Palomino, Breysi Salazar Medina, Luciana Yangali Cáceres

Dónde está cada archivo (código, datos, modelos, documentos): ver [`README_PROFESOR.md`](../../README_PROFESOR.md) en la raíz del repositorio.

---

## 1. Qué mejoras realizamos

Según el historial de commits, desde la Entrega 1 (Semana 7):

**Semana 10 — prototipo funcional**
- Incorporamos la versión del profesor con el modelo de precio y resolvimos su ejercicio (`week10/code/EJERCICIO_FINAL.py`).
- Pasamos de notebooks a un producto: API en FastAPI + frontend web propio (HTML/CSS/JS, mapa con Leaflet).
- Cuentas de propietarios, registro de departamentos con ubicación en el mapa y búsqueda de direcciones.
- Ficha de cada anuncio con comparables enlazados y contacto con el propietario («Me interesa»).
- Perfil competitivo reentrenado **sin precio** (el propietario no lo conoce antes de publicar).
- Tendencia distrital (SARIMA) y escenarios de precio de publicación.
- Despliegue en Render, base de datos persistente en Postgres (Neon) y actualización diaria del mercado.
- Validación temporal del modelo de septiembre con anuncios de octubre y de noviembre.
- Corrección de la lectura de «no mascotas» cuando el portal pega las palabras (29 anuncios corregidos).

**Semana 12 — evaluación**
- Informe de evaluación, error por rango de precio y por distrito, coherencia de punta a punta, casos de estudio.
- **Recomendador para inquilinos** (modelo 7): cuestionario del hogar → 12 recomendaciones explicadas, con favoritos.
- Cuenta de inquilino con perfil y departamentos guardados.

**Semana 15 — feedback de pruebas con usuarios**
- Ventana de bienvenida: «buscar departamento» o «alquilar el mío».
- Lenguaje cotidiano en lugar de términos estadísticos; el detalle técnico queda plegado.
- El mapa de accesibilidad ya no se mueve al tocar un paradero; el análisis rápido incluye el mapa.
- Editar el departamento y cambiar el precio publicado desde la lista; publicar a un precio propio.
- Orden de las recomendaciones elegido por el usuario.
- Panel de KPIs para el equipo de análisis (uso, modelo, datos y recomendador).
- No se puede enviar un mensaje a un departamento propio; se puede guardar un departamento desde su ficha.

## 2. Qué funciona actualmente

Todo está desplegado y funcionando en https://deparent.onrender.com:

- **Propietario:** registro, agregar departamentos, análisis completo con los 6 componentes, publicación y lista de interesados.
- **Inquilino:** búsqueda con filtros sobre 2,998 anuncios reales (captura del 17-nov), ficha de cada anuncio, recomendaciones según su perfil y favoritos.
- **Prueba rápida** del análisis sin cuenta.
- **Panel de KPIs** para analistas: series diarias, embudo, Pareto por distrito, error y cobertura del modelo, asistente de supervisión; se actualiza cada 10 s.
- **Ayuda integrada**, **comparador de hasta 3 anuncios** en la búsqueda y **recomendaciones sin cuenta** (`#/para-ti-demo`).
- **77 pruebas automáticas** pasan (`deliveries/week10/code/test_*.py`).

## 3. Qué modelo usamos y qué resultados obtuvimos

| # | Componente | Modelo | Resultado principal |
|:-:|---|---|---|
| 3 | **Precio esperado** (modelo central) | HistGradientBoosting con 13 variables + rango proporcional calibrado al 90% | **MAE S/ 553, MAPE 18.9%, R² 0.76** (629 anuncios de prueba) vs. S/ 993 de la mediana distrital. Cobertura del rango 92.7% (79.4% desde S/ 7,000) |
| 3 | Validación temporal | Mismo modelo, sin reentrenar | Octubre: MAE S/ 512, R² 0.79 · Noviembre: MAE S/ 541, R² 0.78 → **no se degradó** |
| 1 | Perfil competitivo | K-Means k=4 sin precio + vecinos cercanos | Silhouette 0.21, estable entre semillas (ARI 1.0); 4 perfiles interpretables |
| 2 | Accesibilidad | Paraderos ATU con cKDTree | Cálculo directo, reproduce el notebook de la Semana 7 |
| 4 | Tendencia distrital | SARIMA por distrito | Supera al naive estacional en 10 de 13 series; se muestra como contexto |
| 5 | Escenarios de publicación | Reglas sobre 1 + 3 + 4 | 100% de coherencia en 296 análisis de punta a punta |
| 6 | Simulador de mejoras | Contrafactual del modelo 3 | 54 consultas verificadas iguales a la inferencia |
| 7 | Recomendador | Puntaje por contenido | **precision@12 81.8%** vs. 25% al azar y 17–23% de los órdenes del buscador (60 perfiles) |

Detalle: `deliveries/week12/EvaluationReport.md` y `deliveries/week10/models/metadata.md`.

## 4. Cómo se conectan los datos, el modelo y la interfaz

```
Portales (Adondevivir, Urbania) ── scraper/descarga_diaria.py ──► data_diaria/ (fuera de git)
                                                                      │ preparar_mercado.py
BCRP ─┐                                                               ▼
ATU ──┼─► week07 (notebook EDA) ─► week07/data/*.csv ─► entrenar*.py ─► week10/models/*.joblib
      │                                                     week10/data/mercado.csv
      ▼                                                               │
Navegador ─► week10/frontend (HTML/JS) ──fetch──► week10/code/api.py (FastAPI)
                                                    ├─ carga modelos y mercado al arrancar
                                                    ├─ /api/analizar → modelos 1–6
                                                    ├─ /api/buscar, /api/recomendaciones → búsqueda y modelo 7
                                                    └─ cuentas.py → Postgres (Neon) / SQLite local
```

El usuario llena un formulario en la interfaz → la API arma las 13 variables → el modelo de precio, el perfil
competitivo, la accesibilidad, la tendencia y las reglas devuelven un JSON → la interfaz lo muestra. Diagramas en
`deliveries/week15/architecture/`.

## 5. Qué simulación podemos mostrar

- **Caso del propietario (Jesús María, 70 m², 2 dorm.):** pensaba pedir S/ 2,800; la app estima S/ 2,528, muestra 8
  comparables (5 piden menos), tendencia estable y sugiere el escenario equilibrado de S/ 2,530.
- **Simulador de mejoras:** agregar un balcón sube solo S/ 24; 14 m² más subirían a S/ 2,728.
- **Caso del inquilino:** 2 dorm. hasta S/ 2,500 en Jesús María, Lince o Surquillo cerca de un paradero → 118
  resultados, 37 por debajo del estimado, ordenados por oportunidad.
- **Recomendador:** una familia o una persona con mascota responde el cuestionario y recibe 12 opciones explicadas.

Casos completos en `deliveries/week12/EvaluationReport.md` §7.

## 6. Qué dificultades tenemos actualmente

- **Mercado fijo:** la descarga de anuncios se hizo del 20-oct al 17-nov-2026 (18 días de descarga, 8 completos con 6,300–6,900 anuncios); la app usa la captura del
  17-nov y no se actualiza sola.
- **Rango de precio en alquileres altos:** el rango ahora es proporcional al precio estimado (antes fijo, ±S/ 1,357). En noviembre la cobertura desde S/ 7,000 subió de 34.2% a 65.8%, aún lejos del 90% nominal; en alquileres menores a S/ 1,500 bajó de 99.2% a 91.3%.
- **Precios pedidos, no de contrato**, y distritos con pocos anuncios con error inestable.
- **Render gratuito** se duerme tras 15 minutos; la primera visita tarda 30–60 s.
- **Perfiles competitivos débiles** (silhouette 0.21): orientan, no segmentan con fuerza.

## 7. Qué nos falta completar

- [x] Pruebas con usuarios: 5 sesiones registradas (meta del guion): inquilinos P2 y P3, propietarios P5 y P6 y P7 con doble rol (`week12/pruebas_usuarios/`, `EvaluationReport.md` §6c); cambios del 17-nov comprobados por el equipo; T4 queda fuera por decisión del equipo.
- [x] Rango de precio proporcional al precio (mejora del modelo 3, revisión del profesor del 14-nov).
- [ ] Cambiar la contraseña de la cuenta analista en producción (la anterior estuvo publicada).
- [ ] Informe final (`FinalReport.md` → PDF).
- [x] Presentación final (`.pptx` + PDF) y guion en `presentation/`. El video demo ya no se pide (indicación del profesor, 17-nov).
- [ ] Data Product Canvas final y requisitos finales (`Requirements.md`).
- [ ] Contribución individual y reflexión del equipo.
- [ ] Página del proyecto.

## 8. Qué deseamos demostrar en la presentación

1. El problema: un propietario fija el precio comparando anuncios a mano.
2. **Demo en vivo del propietario**: agregar un departamento, ver estimado, comparables, tendencia, escenarios y simulador.
3. **Demo del inquilino**: búsqueda con «por debajo del estimado» y recomendaciones según su perfil.
4. **Resultados**: el modelo reduce el error a la mitad frente al baseline y se mantiene con datos de octubre y noviembre.
5. Limitaciones honestas y mejoras futuras.

## 9. Qué parte desarrolla cada integrante

| Integrante | Rol | Parte que desarrolla |
|---|---|---|
| **Adrian Urbina Mendoza** | Líder · adquisición y preprocesamiento | Coordinación e integración en `main`, adquisición y descarga diaria de datos, preprocesamiento, informe final |
| **Armando Martinez Palomino** | Ingeniería de datos | Integración ATU y BCRP, código del producto y despliegue, Data Product Canvas, requisitos finales, página del proyecto |
| **Breysi Salazar Medina** | Machine learning | Modelos (precio, perfiles, tendencia, simulador), evaluación, rango proporcional, presentación final |
| **Luciana Yangali Cáceres** | Aplicación y visualización | Interfaz web, pruebas con usuarios y ajustes según su feedback |

Según `deliveries/week07/planning/team_responsibilities.md` y `deliveries/week12/PlanFinal.md`. El detalle de lo
que hizo cada uno va en `ContributionStatement.md`.
