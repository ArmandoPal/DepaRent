# DepaRent: diagnóstico y copia de revisión

Esta copia parte del commit `654fb79585c758ebdc470a292bc4d9a51193e819` del repositorio de los alumnos. El repositorio original y el sitio publicado no fueron modificados. La copia se ejecutó y probó en local el 13 y 14 de noviembre de 2026.

## Diagnóstico breve

| Área | Qué encontramos | Qué se hizo en esta copia |
|---|---|---|
| Producto | Ya funcionaban estimación de alquiler, comparables, búsqueda, recomendaciones, publicaciones, simulador y panel de análisis. | Se conservaron esos recorridos, las cuatro fotografías con sus créditos, los colores naranja y negro y la estructura FastAPI + HTML/CSS/JavaScript. |
| Precio | El predictor tiene MAE de S/ 553,18 en la prueba de 629 anuncios. El rango fijo cubría 92,2 % en conjunto, pero solo 34,2 % de los anuncios de S/ 7.000 o más en noviembre. | Se mantuvo el predictor y se recalibró el rango con los 500 anuncios reservados para calibración. Su ancho ahora depende del precio estimado. |
| Acceso al panel | La guía pública mostraba una clave de analista. Además, una dirección reservada podía registrarse desde la web. | Se retiró la clave de esta guía, se bloqueó el alta pública de analistas y se añadió un comando local para crear la cuenta o cambiar su contraseña, cerrando sesiones anteriores. |
| Panel | Los conteos de cuentas, perfiles, publicaciones, guardados y mensajes ya salen de la base; las métricas del modelo proceden de evaluaciones guardadas. | Se añadieron gráficos de uso, embudo, actividad diaria, Pareto por distrito, error y cobertura. El panel consulta datos nuevos cada 10 segundos mientras está abierto. |
| Interfaz | Había cifras de respaldo que podían parecer vigentes si fallaba la API y la tabla de métricas perdía etiquetas en móvil. | Se corrigieron esos estados, la lectura en móvil y la navegación por teclado. Se muestra la limitación del rango sin prometer un precio garantizado. |
| Recorrido de uso | En móvil, la explicación y las opciones para empezar quedaban debajo de la fotografía y el estimador; el análisis completo abría un ejemplo aunque el visitante hubiera cambiado los campos de portada. | Se muestran al inicio los caminos para estimar o buscar. El análisis completo recibe distrito, área, dormitorios y baños ingresados en portada. También se puede probar el recomendador sin crear cuenta y comparar hasta tres resultados de búsqueda. |
| Evaluación | La comparación rotulada «solo por ID» también eliminaba grupos heurísticos. | Se corrigió la deduplicación por `id_anuncio` en el script para la siguiente validación. Las métricas históricas de esa sensibilidad no se recalcularon: los archivos crudos diarios no están en el repositorio. |

## Qué cambió en el rango

El estimador de precio **no se reentrenó con octubre ni noviembre**. Sigue usando HistGradientBoosting y las mismas 13 entradas. Para el rango nuevo se dividió el error absoluto de cada anuncio de calibración entre `máximo(S/ 3.000, precio estimado)`. El factor del percentil calibrado al 90 % es `0,3370`. El piso de S/ 3.000 sale de redondear la mediana de S/ 2.700 del conjunto de entrenamiento; la prueba reservada no se usó para elegirlo. El script reproducible está en `deliveries/week10/code/entrenar.py` y el método de inferencia en `modelo.py`.

| Evaluación | Cobertura total anterior → nueva | Cobertura ≥ S/ 7.000 anterior → nueva | Cobertura < S/ 1.500 anterior → nueva |
|---|---:|---:|---:|
| Septiembre, prueba (629) | 92,2 % → 92,7 % | 58,8 % → 79,4 % | 89,1 % → 80,4 % |
| Octubre (1.712) | 93,5 % → 94,2 % | 37,0 % → 60,5 % | 99,1 % → 92,2 % |
| Noviembre (2.026) | 92,2 % → 93,5 % | 34,2 % → 65,8 % | 99,2 % → 91,3 % |

La mejora en alquileres altos es clara, pero **65,8 % sigue lejos del 90 % nominal**. Las coberturas de departamentos baratos bajaron; por eso el rango debe presentarse como orientación, nunca como garantía individual. Las cifras por banda son exploratorias, basadas en los cortes ya disponibles. Se requiere una nueva captura independiente para confirmar el comportamiento futuro. El MAE del precio no cambió por esta recalibración.

## Recorridos añadidos a la web

- **Inicio:** la primera pantalla muestra las dos tareas principales, «Quiero estimar» y «Quiero buscar». La fotografía, el cartel, la tipografía y los colores del equipo siguen en la página. En teléfono, la explicación aparece antes de la fotografía para que se pueda decidir sin recorrer toda la portada.
- **Del cálculo rápido al análisis:** el enlace del cartel conserva los cuatro datos escritos en inicio y los abre en «Probar el análisis» cuando están completos y dentro de los límites permitidos. Los demás campos quedan como no informados; el visitante puede completarlos antes de ejecutar el análisis. El selector distingue estos datos de los casos de ejemplo. No se presenta un caso distinto como si fuera suyo.
- **Recomendaciones sin cuenta:** la nueva vista `#/para-ti-demo` envía tipo de hogar, presupuesto y distrito al recomendador que ya tenía la API. Muestra hasta seis resultados con sus motivos y permite abrir cada ficha. No guarda perfil ni resultados; el registro se ofrece cuando el visitante quiere conservar opciones.
- **Comparación en búsqueda:** se pueden elegir hasta tres anuncios y leer lado a lado precio pedido, estimación, diferencia, área y distancia al paradero. Es una comparación de anuncios, no una prueba de ahorro ni una garantía de disponibilidad.
- **Lenguaje y contexto:** se retiraron expresiones como «precio justo», «alquilar rápido» y «publicado» en el ejemplo que no realiza una publicación. También se ajustaron las categorías de precio y la descripción de la página. La búsqueda explica antes de la tabla cómo leer los porcentajes y recuerda que la captura de mercado es histórica.

Estas mejoras hacen más visible la utilidad que el sistema ya ofrece; **no demuestran que los usuarios prefieran la página**. Esa preferencia debe observarse con personas ajenas al equipo, comparando tareas equivalentes entre la versión original y esta copia y registrando tanto éxitos como dificultades.

## Cómo comprobarlo

Desde la raíz de esta copia, en PowerShell:

```powershell
py -3.14 -m venv .venv
.venv\Scripts\python.exe -m pip install -r deliveries/week10/code/requirements.txt
cd deliveries/week10/code
..\..\..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Abrir `http://127.0.0.1:8000`. Sin cuenta se puede usar la portada, la búsqueda, «Probar el análisis» y «Para ti» en modo de prueba. Para comprobar la continuidad, cambiar los cuatro campos del cartel de portada, abrir el análisis completo y verificar que el formulario muestre esos mismos datos. En búsqueda, seleccionar dos o tres resultados con «Comparar». El panel de analista exige una cuenta habilitada; el procedimiento local está en `README_PROFESOR.md`, sección 2. No se incluye ninguna contraseña en esta entrega.

Para repetir la suite:

```powershell
cd deliveries/week10/code
..\..\..\.venv\Scripts\python.exe -m unittest discover -p "test_*.py" -q
```

El 14 de noviembre pasaron **76 de 76 pruebas**. La API local devolvió HTML 200, opciones de mercado y una estimación. La evaluación de `deliveries/week12/code/evaluar_producto.py` comprobó 297 departamentos válidos: sus 13 reglas de coherencia se cumplieron en todos los casos. El catálogo histórico `simulacion_v2/` se mantuvo; `simulacion_rango_proporcional/` contiene las mismas 54 consultas hipotéticas con el rango nuevo, en JSON y CSV. No son nuevos anuncios.

La prueba local se hizo con Python 3.14. El servicio de Render del equipo declara Python 3.12.8; esa combinación con el artefacto nuevo no se verificó todavía y debe comprobarse antes de desplegarlo.

## Qué significa el tablero

Los conteos de cuentas, perfiles, departamentos, publicaciones, guardados y mensajes se calculan desde la base de la aplicación. El botón «Actualizar ahora» y la consulta automática cada 10 segundos vuelven a leerlos mientras el panel está abierto. Las métricas de precio y recomendación son resultados de evaluaciones guardadas; **no cambian por una visita**. El sistema no registra compras, alquileres cerrados, ingresos, costos ni visitas anónimas: no se deben mostrar esas cifras como hechos. La evaluación del recomendador se hizo con 60 perfiles sintéticos y no mide satisfacción real.

## Lo que el grupo debe cerrar

1. **Cambiar la clave de la cuenta analista del despliegue.** La antigua estuvo publicada y retirarla de esta copia no la invalida. Usar `gestionar_analista.py` en un entorno privado conectado a la base de producción y luego verificar el acceso. No copiar claves a GitHub ni al correo.
2. **Publicar esta versión solo después de revisarla con el equipo.** El sitio actual de Render sigue ejecutando la versión que hayan desplegado los alumnos; esta copia local no lo cambia automáticamente.
3. **Hacer una prueba corta con personas.** Con seis a ocho personas ajenas al equipo, pedir que estimen un alquiler, interpreten el rango y encuentren un departamento con presupuesto fijo. Anotar si completan cada tarea sin ayuda, cuánto tardan, si entienden la fecha de los anuncios y qué versión prefieren al probar ambas en orden alternado. Registrar también por qué la prefieren; el equipo ya tiene una plantilla de observaciones en `deliveries/week12/`.
4. **Revisar la siguiente captura de anuncios.** La búsqueda incluida aquí usa el mercado del **9 de noviembre de 2026**. El equipo reportó bloqueo 403 del portal, así que primero debe verificar si la descarga volvió a funcionar y luego repetir la validación temporal. No presentar un anuncio de la captura como disponible hoy sin comprobarlo.

Los precios son los pedidos en anuncios, no valores de contratos ni tasaciones. La tendencia SARIMA es contexto de distrito, no un pronóstico individual. La comparación de mejoras en la vivienda es una consulta hipotética del modelo, no una prueba de efecto causal.

## Segunda revisión, 14 de noviembre

La comprobación de los recorridos públicos encontró que la portada y la sección «Tres precios» usaban datos distintos para un ejemplo que parecía ser el mismo. Ahora ambas calculan con los cuatro datos visibles del cartel; la opción «Equilibrado» redondea esa estimación a decenas de soles. El análisis completo conserva esos mismos cuatro datos al abrirse desde portada. Se corrigió también el enlace para que solo acepte dormitorios y baños enteros, como exige la API.

En «Para ti» de prueba, el botón de registro ya no sugiere que las recomendaciones temporales se guardan. Indica que hay que crear la cuenta y configurar el perfil. La búsqueda ignora una respuesta antigua si el visitante ya cambió los filtros, evitando que aparezcan resultados de una consulta anterior. El comparador devuelve el foco al quitar una tarjeta y explica que las opciones elegidas permanecen aunque se cambien los filtros. La distribución de la portada se apila antes en pantallas intermedias para que texto e imagen no se superpongan.

También se corrigió el titular de resultados al elegir una categoría de precio: ahora indica la cantidad de esa categoría, no la de toda la búsqueda. Se comprobó en el navegador que la categoría «Por debajo de la estimación» mostraba 883 resultados y que, al quitar una opción del comparador, el foco regresaba a su botón de la tabla.

El embudo del tablero ahora calcula «usuarios con perfil que guardan» usando la intersección real de ambos grupos. «Publicados con mensajes» solo cuenta publicaciones activas; los mensajes históricos siguen en su contador separado. La validación temporal escribe cada nueva captura en su propia carpeta y conserva las evaluaciones anteriores. Los nombres históricos de algunas claves JSON, como `metricas_octubre`, se mantienen para no romper la API y no deben interpretarse como fecha de una captura nueva.

Si un departamento se retira y luego se vuelve a publicar, el indicador de publicaciones con mensajes considera solo las consultas recibidas desde la publicación vigente. Un valor cero en el embudo muestra una barra vacía. Las 76 pruebas automatizadas pasaron tras las correcciones y la incorporación de la demostración.

La guía principal ahora indica ejecutar la copia extraída del ZIP. Clonar el GitHub del equipo recuperaría su versión original y no estas mejoras. La prueba local se hizo con Python 3.14; el comportamiento de esta copia en el despliegue Python 3.12.8 sigue pendiente de verificación por el equipo.

## Ayuda, fotografías y demostración del tablero

La web incluye un botón «Ayuda» que abre una guía para las seis consultas habituales: estimar, buscar y comparar, recomendaciones, publicar, guardar opciones y entrar al panel. Propone enlaces a las pantallas existentes. La respuesta se arma en el navegador, no se envía como mensaje a una persona ni usa un modelo generativo. En teléfono ocupa la pantalla disponible y permite cerrar con Escape; se probó la navegación por teclado.

Se agregaron seis fotografías **distintas** de calles y edificios residenciales de Lima a las vistas públicas, además de las cuatro fotos originales del equipo. Sus fuentes, autores y licencias se detallan en `deliveries/week10/frontend/assets/credits.json` y al pie de la web. Son imágenes de contexto urbano, no fotografías de los departamentos anunciados. Se conservó Epilogue y se cargaron explícitamente los pesos usados por los títulos y controles. La portada, la búsqueda y las recomendaciones se revisaron a 390 y 1440 píxeles sin desbordamiento horizontal.

El tablero incorpora un **asistente de supervisión** con lecturas de uso, publicaciones, datos, modelo y recomendador a partir de los indicadores disponibles. También presenta serie diaria de 30 días, embudo de registro a contacto, publicaciones por distrito con porcentaje acumulado, comparación del MAE y cobertura del rango. Los conteos de actividad se consultan automáticamente cada 10 segundos. Las evaluaciones del modelo y recomendador son históricas y no se recalculan por una cuenta nueva.

Para una presentación reproducible, `deliveries/week10/code/crear_demo_300.py` crea una **base SQLite local separada** con 300 cuentas ficticias marcadas como simuladas. Incluye 239 perfiles, 80 guardados, 50 departamentos, 25 publicaciones y 12 mensajes de ensayo. Las publicaciones ficticias no salen en la búsqueda pública. El CSV anónimo y los comandos exactos están en `deliveries/week10/resultados/simulacion_300_usuarios/LEEME.md`. La base SQLite generada no se incluye en el ZIP. En una prueba local, una nueva cuenta de ensayo cambió el total de **300 a 301** sin recargar la página y el panel mostró por separado «300 simuladas» y «1 cuenta no simulada». No se está afirmando que sean usuarios captados, ventas o ingresos.

La suite completa terminó con **76/76 pruebas**. Esta copia sigue siendo local: el GitHub y Render de los alumnos no recibieron estos cambios automáticamente.
