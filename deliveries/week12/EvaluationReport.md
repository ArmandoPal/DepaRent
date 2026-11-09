# Evaluation Report — DepaRent (Semana 12)

**Producto:** DepaRent, estimación y estrategia de precio de alquiler de departamentos en Lima.
**Equipo:** Adrian Urbina Mendoza, Armando Martinez Palomino, Breysi Salazar Medina, Luciana Yangali Cáceres.
**App desplegada:** https://deparent.onrender.com · **Mercado actual:** captura del 9 de noviembre de 2026 (3,074 anuncios únicos).

Este informe responde tres preguntas: **¿los modelos aciertan lo suficiente?**, **¿la app entrega resultados
coherentes?** y **¿le sirve a un propietario y a un inquilino?** Todos los números salen de archivos del
repositorio y se pueden regenerar (sección 9).

---

## 1. Resumen

| Componente | Métrica principal | Resultado | Contra el baseline |
|---|---|---|---|
| Precio esperado (HistGradientBoosting) | MAE en prueba de septiembre | **S/ 553** (R² 0.76) | Mediana distrital: S/ 993 → **44% menos error** |
| Mismo modelo, anuncios nuevos de noviembre | MAE | **S/ 541** (IC 95%: 503–580) | Mediana distrital: S/ 1,024 → **47% menos error** |
| Rango de precio (90% nominal) | Cobertura | **92.2%** (sept.) · 93.5% (oct.) · 92.2% (nov.) | — |
| Perfil competitivo (K-Means, k = 4) | Silhouette / estabilidad | 0.21 / ARI = 1.00 | Semana 7: 0.18 |
| Tendencia distrital (SARIMA) | MAE mediano en 4 trimestres reservados | 2.00 S/ por m² | Naive estacional: 2.54 · Naive: 2.40 |
| Escenarios de publicación (reglas) | Reglas cumplidas en 297 análisis reales | **100%** | — |
| Producto | Pruebas automáticas | **47 de 47 pasan** | — |

**Lo que funciona:** el modelo de precio no se degradó en ocho semanas y reduce casi a la mitad el error de
la mediana del distrito; la app es coherente en todos los casos probados.
**Lo que hay que mejorar:** el rango de precio es demasiado ancho para departamentos baratos y demasiado
angosto para los de lujo (cubre solo el 34% de los precios desde S/ 7,000); San Isidro y Magdalena
empeoraron frente a septiembre; y **faltan las pruebas con usuarios reales** (guion listo en
`GuionPruebasUsuarios.md`).

---

## 2. Estrategia de evaluación

La guía del curso y el plan de la Semana 7 (`week07/planning/Implementation_Plan.md`, sección 8) piden validar
cada componente por separado y el producto completo. Se aplicó así:

| Qué se evalúa | Cómo | Por qué así |
|---|---|---|
| Precio esperado | Holdout **agrupado por posible inmueble** (3,013 grupos): 1,999 entrenamiento, 500 calibración, 629 prueba; ningún grupo en dos particiones. Modelo fijado antes de evaluar, sin ajuste de hiperparámetros | El mismo departamento aparece en Adondevivir y Urbania con otro id; separar por fila inflaría las métricas |
| Precio en el tiempo | El modelo congelado se mide con anuncios **nuevos** del 23-oct y del 9-nov, quitando los que ya estaban en septiembre (por id y por duplicado probable) | Comprueba si el modelo sirve para el mercado actual, sin reentrenar |
| Rango de precio | Residuos absolutos en la partición de calibración (separada de la prueba); radio del percentil 90 | Medir la cobertura en datos que el rango no vio |
| Perfil competitivo | Silhouette para k = 2…7, estabilidad con 5 semillas (ARI) y lectura de los perfiles | Sin etiqueta verdadera, se mide separación, estabilidad e interpretabilidad |
| Tendencia distrital | Últimos 4 trimestres reservados; SARIMA contra naive y naive estacional | Validación temporal: no se usa el futuro para predecir el pasado |
| Escenarios y producto | 300 departamentos del mercado actual por la misma API que usa la app; reglas que siempre deben cumplirse | Coherencia entre lo que calcula el modelo y lo que se muestra |
| Utilidad | Dos casos de estudio (propietario e inquilino) y pruebas con usuarios | La métrica no dice si la app ayuda a decidir |

**Métricas.** MAE en soles (la más fácil de explicar a un propietario: "el estimado se equivoca en S/ X al mes en
promedio"), RMSE (penaliza errores grandes), MAPE (error relativo) y R². Para el rango, la cobertura. Los
baselines son la **mediana del distrito** (lo que haría un propietario mirando los portales) y la **mediana global**.

---

## 3. Precio esperado

### 3.1 Prueba de septiembre (629 anuncios)

| Modelo | MAE | RMSE | MAPE | R² |
|---|---:|---:|---:|---:|
| Mediana global | S/ 1,215.82 | S/ 2,253.11 | 37.8% | −0.04 |
| Mediana distrital | S/ 993.23 | S/ 2,053.45 | 26.6% | 0.13 |
| **HistGradientBoosting** | **S/ 553.18** | **S/ 1,075.56** | **18.8%** | **0.76** |

El error mediano es de unos S/ 300: la mitad de los estimados queda a menos de S/ 300 del precio pedido.
El 44% queda a menos del 10% del precio y el 71% a menos del 20%.

### 3.2 Validación temporal: ¿sigue sirviendo con el mercado actual?

| Corte | Anuncios nuevos | MAE (IC 95%) | MAPE | R² | Cobertura del rango | MAE mediana distrital |
|---|---:|---:|---:|---:|---:|---:|
| Prueba de septiembre (14-sep) | 629 | S/ 553 | 18.8% | 0.762 | 92.2% | S/ 993 |
| Octubre (23-oct) | 1,712 | S/ 512 (476–551) | 16.4% | 0.785 | 93.5% | S/ 948 |
| Noviembre (9-nov) | 2,026 | S/ 541 (503–580) | 16.8% | 0.782 | 92.2% | S/ 1,024 |

Ocho semanas después del entrenamiento el error sigue en el mismo nivel; los intervalos de octubre y noviembre
se superponen. **No hace falta reentrenar por ahora.** El sesgo es pequeño: la mediana de (precio pedido −
estimado) es −S/ 44 en noviembre (−S/ 65 en octubre). Detalle en `week10/resultados/validacion_octubre/` y
`week10/resultados/validacion_noviembre/`.

### 3.3 Análisis de errores por rango de precio

`resultados/error_por_rango_precio.csv` (noviembre; los otros cortes muestran el mismo patrón):

| Precio pedido | Anuncios | MAE modelo | MAE mediana distrital | MAPE | Sesgo (real − estimado) | Cobertura del rango |
|---|---:|---:|---:|---:|---:|---:|
| < S/ 1,500 | 127 | S/ 555 | S/ 760 | 50.7% | −S/ 515 | 99.2% |
| S/ 1,500 – 2,499 | 746 | S/ 279 | S/ 521 | 14.3% | −S/ 104 | 98.8% |
| S/ 2,500 – 3,999 | 812 | S/ 366 | S/ 424 | 12.3% | +S/ 35 | 98.0% |
| S/ 4,000 – 6,999 | 224 | S/ 1,013 | S/ 1,717 | 20.0% | +S/ 318 | 75.4% |
| ≥ S/ 7,000 | 117 | S/ 2,517 | S/ 7,344 | 22.3% | +S/ 1,960 | **34.2%** |

**Lectura.**
- En el rango donde está el 77% del mercado (S/ 1,500 a 3,999) el modelo es preciso: 12–14% de error relativo.
- **Departamentos baratos:** el modelo los sobreestima (pide unos S/ 500 más de lo que se publica). El error en
  soles es moderado, pero en porcentaje es alto (51%).
- **Departamentos de lujo:** el modelo los subestima y el rango cubre solo a uno de cada tres. La causa es que el
  radio del rango es **igual para todos** (±S/ 1,357): sobra para un departamento de S/ 1,500 y no alcanza para
  uno de S/ 10,000. Aun así, el modelo supera al baseline en todos los rangos menos el más barato de septiembre.
- **Mejora propuesta para la Semana 15:** un radio proporcional al precio estimado (por ejemplo, calibrar
  el error relativo o usar cuantiles), validado con la misma partición de calibración.

### 3.4 Errores por distrito

Distritos con 20 o más anuncios en la prueba de septiembre y en noviembre (detalle completo en
`week10/resultados/validacion_noviembre/error_por_distrito.csv`):

| Distrito | MAE sept. | MAE oct. | MAE nov. |
|---|---:|---:|---:|
| Miraflores | S/ 783 | S/ 758 | S/ 728 |
| Surco | S/ 693 | S/ 550 | S/ 637 |
| **San Isidro** | S/ 643 | S/ 814 | **S/ 855** |
| San Miguel | S/ 263 | S/ 264 | S/ 270 |
| Jesús María | S/ 246 | S/ 256 | S/ 236 |
| Barranco | S/ 487 | S/ 335 | S/ 379 |
| Lince | S/ 285 | S/ 268 | S/ 307 |
| Surquillo | S/ 244 | S/ 262 | S/ 210 |
| Pueblo Libre | S/ 316 | S/ 283 | S/ 294 |
| **Magdalena** | S/ 239 | S/ 457 | **S/ 448** |

San Isidro y Magdalena empeoraron en los dos cortes: son los primeros a revisar si se reentrena. Miraflores,
San Isidro y Surco tienen más error en soles porque sus precios son más altos. En los distritos con menos de 20
anuncios de prueba (Ate, Los Olivos, Breña, Comas, San Martín de Porres, Callao) el error no es fiable; **la app
ya lo advierte** al mostrar el estimado.

---

## 4. Perfil competitivo y comparables

K-Means sobre 11 atributos estandarizados, **sin precio** (para que el perfil no repita lo que se quiere estimar).

| k | 2 | 3 | **4** | 5 | 6 | 7 |
|---|---:|---:|---:|---:|---:|---:|
| Silhouette | 0.182 | 0.201 | **0.208** | 0.162 | 0.161 | 0.177 |
| ARI medio entre semillas | 0.997 | 0.999 | **1.000** | 0.940 | 0.625 | 0.549 |

k = 4 tiene la mejor separación y es totalmente estable. Mejora el clustering de la Semana 7 (0.178, que usaba
el precio por m²). Reentrenar con octubre dio 0.148 y grupos sin el rasgo que les da nombre: por eso los
anuncios nuevos **se asignan** a los perfiles de septiembre (silhouette del mercado asignado: 0.207).

| Perfil (mercado del 9-nov) | Anuncios | Área mediana | Rasgo | Precio mediano (p25–p75) |
|---|---:|---:|---|---:|
| Estándar tradicional | 1,497 | 73 m² | 9 años, casi sin amenidades | S/ 2,500 (1,850–3,100) |
| Compacto moderno con amenidades | 792 | 60 m² | 89% con gimnasio, 72% con piscina | S/ 2,691 (2,300–3,300) |
| Moderno que admite mascotas | 463 | 65 m² | 100% admite mascotas | S/ 2,550 (2,025–3,113) |
| Amplio de alta gama | 322 | 200 m² | El triple de área | S/ 7,735 (5,400–10,268) |

**Lectura.** Un silhouette de 0.21 es bajo: los perfiles **orientan, no separan mercados**. Se usan para elegir
con quién compararse, no para fijar el precio. En los 297 análisis de la sección 6, los 8 comparables fueron
siempre del mismo distrito, sin repetidos, con similitud mediana de 0.42.

---

## 5. Tendencia distrital (SARIMA)

Series trimestrales del BCRP (2013-T3 a 2026-T1, S/ por m² de alquiler derivado del precio de venta y el PER),
12 distritos más el promedio. El orden de cada SARIMA se elige por AIC con los primeros 47 trimestres; los
últimos 4 se reservan para validar.

| Método | MAE mediano (S/ por m²) | MAPE mediano | Series en que gana SARIMA |
|---|---:|---:|---:|
| **SARIMA** | **2.00** | **6.3%** | — |
| Naive estacional (mismo trimestre del año anterior) | 2.54 | 8.1% | 10 de 13 |
| Naive (último valor) | 2.40 | 6.7% | 7 de 13 |

SARIMA gana con claridad al naive estacional, pero contra el último valor la ventaja es pequeña (7 de 13). Con
4 trimestres de validación la evidencia es limitada; por eso la app muestra la tendencia solo como **etiqueta**
(al alza / estable / a la baja con un umbral de ±2%) y no como un precio. Hoy 7 series dan "al alza" y 6
"estable"; ninguna "a la baja".

---

## 6. Coherencia del producto de punta a punta

`code/evaluar_producto.py` toma 300 departamentos del mercado actual (semilla 42) y los envía a
`POST /api/analizar`, el mismo endpoint que usa la pantalla "Analizar". 3 se rechazaron con error 422 y un
mensaje claro porque el anuncio no informa los dormitorios (el formulario los exige). En los **297 restantes**:

| Regla | Cumple |
|---|---:|
| Responde 200 con JSON estricto (sin NaN ni infinitos) | 100% |
| El precio mostrado es idéntico al del modelo | 100% |
| Tres escenarios: competitivo < equilibrado < renta superior | 100% |
| Los tres escenarios caen dentro del rango calibrado | 100% |
| El equilibrado coincide con el precio esperado | 100% |
| Se sugiere exactamente un escenario | 100% |
| 8 comparables, sin repetir | 100% |
| Perfil, nivel de accesibilidad y etiqueta de tendencia asignados | 100% |

Escenario sugerido: renta superior en 164 casos y equilibrado en 133. **El competitivo no se sugirió nunca**,
porque solo se sugiere cuando el distrito tiene tendencia a la baja y hoy ninguna serie la tiene. Es correcto
según la regla, pero conviene explicarlo en la app para que no parezca un error.

**Tiempo de respuesta** (en local, sin red): mediana 83 ms, percentil 95: 147 ms. En Render (plan gratuito) la
primera visita tras 15 minutos de inactividad tarda 30–60 s mientras el servicio despierta.

### Evidencia de pruebas

| Evidencia | Qué cubre | Resultado |
|---|---|---|
| 47 pruebas automáticas en 6 archivos (`week10/code/test_*.py`) | Preprocesamiento idéntico al de la Semana 7, los 5 modelos, API, cuentas con contraseña con sal, aislamiento entre propietarios, filtros de búsqueda, que no se expongan datos personales, errores 404/422 | 47/47 pasan (9-nov-2026) |
| `week10/resultados/simulacion_v2/` | 54 consultas del simulador iguales a la inferencia del modelo, verificadas con SHA-256 | PASS |
| `resultados/coherencia_producto.json` | Sección 6 | 100% de las reglas |
| `week10/resultados/demos_ejecutadas.json` | Casos de demostración ejecutados de punta a punta | OK |
| Pruebas con usuarios | Utilidad y claridad de la interfaz | **Pendiente** (guion listo) |

---

## 7. Casos de estudio

Ejecutados con la API de la app sobre el mercado del 9 de noviembre (`code/casos_estudio.py` →
`resultados/casos_estudio.json`). Las personas son ficticias; los anuncios del caso 2 son reales, sin datos de
contacto ni dirección.

### Caso 1 — Propietario: "¿a cuánto lo publico?"

**Situación.** Un propietario tiene un departamento en Jesús María: 70 m², 2 dormitorios, 2 baños, 8 años,
ascensor, sin cochera, mantenimiento de S/ 250. Pensaba pedir **S/ 2,800** porque vio un anuncio parecido a ese
precio.

**Lo que hace en DepaRent** (pantalla "Analizar"):

1. **Ingresa los datos** y obtiene el estimado: **S/ 2,528 al mes** (rango S/ 1,171 a 3,885). La app le dice que
   en Jesús María el modelo se equivocó en promedio S/ 246 con 32 anuncios de prueba: el estimado es confiable
   en ese distrito.
2. **Revisa sus 8 comparables**, todos de Jesús María (perfil "Estándar tradicional"). Piden entre S/ 1,650 y
   4,100; la mediana es S/ 2,300. **5 de los 8 piden menos que los S/ 2,800 que tenía en mente**, y los que
   piden más tienen 3 dormitorios o más de 90 m².
3. **Mira el contexto:** accesibilidad media (paradero a unos 360 m del centro del distrito) y tendencia estable
   (+0.7% proyectado). No hay señal de mercado para pedir más.
4. **Elige el precio** entre tres escenarios:

   | Escenario | Precio | Frente al esperado | Comparables más baratos |
   |---|---:|---:|---:|
   | Competitivo | S/ 2,230 | −11.8% | 50% |
   | **Equilibrado (sugerido)** | **S/ 2,530** | 0% | 62.5% |
   | Renta superior | S/ 2,890 | +14.3% | 62.5% |

5. **Prueba mejoras:** con el simulador, agregar un balcón solo sube el estimado S/ 24 (+1%), así que no vale la
   pena para el precio. En el laboratorio de área, 14 m² más (84 m²) darían S/ 2,728 (+7.9%).

**Decisión.** Publica en **S/ 2,530** en vez de S/ 2,800. Sus S/ 2,800 estaban casi en el escenario de renta
superior, que la app no sugiere con un mercado estable. Así se ubica en la mitad de sus comparables, que es lo
que da más probabilidad de alquilar sin regatear.
**Lo que este caso muestra:** la app convierte una intuición ("vi uno a 2,800") en una decisión con evidencia
(estimado, comparables reales, tendencia) y explica por qué. También muestra un límite: el simulador mide
asociaciones del modelo, no el efecto real de una remodelación, y la app lo advierte.

### Caso 2 — Inquilino: "quiero 2 dormitorios hasta S/ 2,500, cerca del transporte"

**Situación.** Una persona que trabaja en el centro busca 2 dormitorios o más, hasta **S/ 2,500**, en Jesús María,
Lince o Surquillo, y con un paradero a menos de 300 m.

**Lo que hace en DepaRent** (pantalla "Buscar"):

1. **Aplica los filtros:** **118 departamentos** cumplen todo. La mediana pedida es S/ 2,300 (la mitad central
   va de S/ 2,100 a 2,500).
2. **Mira la valoración** de cada anuncio frente al estimado del modelo: **37 piden menos que el estimado**
   (más de 10% por debajo), 68 están en línea y 13 por encima.
3. **Ordena por oportunidad** y revisa primero los que piden menos:

   | Distrito | Pide | Estimado | Diferencia | Área | Dorm. | Baños | Paradero |
   |---|---:|---:|---:|---:|---:|---:|---:|
   | Lince | S/ 2,400 | S/ 3,219 | −25% | 90 m² | 3 | 2 | 165 m |
   | Surquillo | S/ 2,250 | S/ 2,943 | −24% | 82 m² | 2 | 2 | 295 m |
   | Surquillo | S/ 2,200 | S/ 2,857 | −23% | 110 m² | 3 | 2 | 271 m |
   | Jesús María | S/ 2,400 | S/ 3,006 | −20% | 77 m² | 2 | 2 | 283 m |
   | Jesús María | S/ 1,800 | S/ 2,251 | −20% | 85 m² | 2 | 1 | 7 m |

4. **Abre la ficha** de los dos primeros, compara con sus comparables y va al anuncio original para contactar.

**Lo que este caso muestra:** en vez de revisar más de 100 anuncios uno por uno, el inquilino empieza por los 37
con mejor relación entre precio y características. **Límite:** "por debajo del estimado" puede deberse a algo
que el modelo no ve (estado del inmueble, piso, ruido); la app lo presenta como orientativo y avisa que es una
foto del mercado del 9 de noviembre, no una lista de ofertas vigentes.

---

## 8. Limitaciones

- **Precios pedidos, no de contrato.** El modelo aprende lo que piden los propietarios.
- **Rango de precio con radio fijo.** Bien calibrado en promedio, pero no por rango de precio (sección 3.3).
- **Distritos con pocos datos** y la categoría "Otros" tienen errores inestables.
- **Perfiles débiles** (silhouette 0.21): orientan, no segmentan.
- **Tendencia** con poca evidencia de validación (4 trimestres) y derivada del precio de venta, no del alquiler.
- **Paraderos ATU de 2021.** La accesibilidad usa el centro aproximado del distrito si no se marca la ubicación.
- **Descarga diaria inestable.** Los portales bloquean parte de las descargas (error 403); del 28-oct al 8-nov
  no hubo una captura completa.
- **Sin pruebas con usuarios todavía.** La utilidad está argumentada con casos de estudio, no medida.

---

## 9. Reproducir

Desde la raíz del repositorio, con el entorno de `week10/README.md`:

```powershell
cd deliveries\week10\code
..\..\..\.venv\Scripts\python.exe -m unittest discover -p "test_*.py"     # 47 pruebas
..\..\..\.venv\Scripts\python.exe validar_octubre.py --captura 2026-11-09  # validación temporal (requiere data_diaria/)
cd ..\..\week12\code
..\..\..\.venv\Scripts\python.exe evaluar_producto.py   # error por rango + coherencia (secciones 3.3 y 6)
..\..\..\.venv\Scripts\python.exe casos_estudio.py      # casos de estudio (sección 7)
```

| Archivo | Contenido |
|---|---|
| `week10/resultados/metricas.json` | Prueba de septiembre, baselines, rango calibrado |
| `week10/resultados/validacion_octubre/`, `validacion_noviembre/` | Validación temporal |
| `week10/resultados/metricas_perfil.json` | Perfil competitivo |
| `week10/resultados/tendencia_distrital.json` | SARIMA y baselines temporales |
| `resultados/error_por_rango_precio.csv` | Sección 3.3 |
| `resultados/coherencia_producto.json` | Sección 6 |
| `resultados/casos_estudio.json` | Sección 7 |

---

## 10. Próximos pasos (hacia la Semana 15)

1. Hacer las pruebas con 3 a 5 usuarios (`GuionPruebasUsuarios.md`) y agregar los resultados a este informe.
2. Rango de precio proporcional al precio, para que cubra también los departamentos de lujo.
3. Explicar en la app por qué el escenario competitivo solo se sugiere con tendencia a la baja.
4. Mantener la captura diaria y repetir la validación temporal antes de la presentación final.
