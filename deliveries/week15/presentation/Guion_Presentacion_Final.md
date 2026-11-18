# Guion de la presentación final — DepaRent

Pitch de **unos 20 minutos** para un público que no sabe machine learning. Archivo: `PresentationFinal.pptx`
(17 diapositivas y 4 de respaldo). Este guion es el mismo texto que las notas del orador de cada diapositiva
(se genera desde `notas.js`).

| Bloque | Quién | Diapositivas | Tiempo |
|---|---|---|---|
| 1. Inicio: la problemática y la solución | Breysi | 1–5 | 5 min 05 s |
| 2. Demostración (casos y demo en vivo) | Adrian | 6–8 | 4 min 30 s |
| 3. Parte técnica: interfaz, pruebas, panel y métricas | Luciana | 9–12 | 5 min 20 s |
| 4. Valor, limitaciones y conclusiones | Armando | 13–17 | 3 min 45 s |
| Cambios de turno y margen | — | — | ≈ 1 min 20 s |

**Antes de empezar:** abrir https://deparent.onrender.com 5 minutos antes (Render tarda en despertar), dejar cargado
«Probar el análisis» y tener el PDF abierto.

Todas las cifras salen del repositorio: `deliveries/week12/EvaluationReport.md`, `deliveries/week10/resultados/` y
`deliveries/week12/pruebas_usuarios/`. Lo que es hipótesis está rotulado así en la diapositiva 14.

---

## Bloque 1 · Inicio: la problemática y la solución — Breysi

### 1. ¿Cuánto cuesta equivocarse al poner el precio de un alquiler? · 1 min
> Imagínense que tienen un departamento en Lima y lo quieren alquilar. ¿Cuánto piden? Lo más común es mirar cuánto se pide en el distrito. Nosotros medimos qué tan bien funciona eso: con 2,063 anuncios nuevos de noviembre, ese método se equivoca en promedio en 1,055 soles al mes. Con DepaRent el error baja a 534 soles: casi la mitad.
> Somos Breysi, Luciana, Adrian y Armando, y esto es DepaRent.
- No explicar: qué es el MAE. Si preguntan: «es el error promedio en soles por anuncio».

### 2. Dos preguntas sin una buena respuesta · 1 min 15 s
> El problema tiene dos lados. Un propietario ve un anuncio parecido a 2,800 y pide lo mismo. Pero ese anuncio puede tener más área, cochera o llevar meses sin alquilarse. Si pide de más, el depa se queda vacío; si pide de menos, pierde plata cada mes.
> Del otro lado, una persona que busca: solo en Lince, con dos dormitorios y hasta 2,500 soles, hay 32 anuncios. En toda Lima, casi tres mil. ¿Cuál vale lo que piden?

### 3. Los portales muestran anuncios; falta decidir · 1 min
> Los portales hacen bien su trabajo: muestran anuncios. Pero entre ver anuncios y decidir hay un paso que nadie da: poner esos anuncios en contexto —el transporte, cómo se mueve el precio del distrito— y convertirlos en una recomendación. Ese paso es DepaRent.

### 4. DepaRent: apoyo a la decisión para alquilar en Lima · 50 s
> DepaRent tiene dos caminos que usan el mismo análisis. El propietario describe su depa en tres o cuatro pasos, recibe el análisis, elige uno de tres precios y publica. El inquilino cuenta qué busca, recibe opciones con el porqué de cada una, compara el precio pedido con el estimado y escribe al dueño. Todo está publicado y funciona hoy.

### 5. Cómo convierte datos en decisiones · 1 min
> Usamos datos reales de Lima: 12,235 anuncios distintos de Adondevivir y Urbania descargados entre el 20 de octubre y el 17 de noviembre, los paraderos de la ATU y las series de precio del BCRP. El motor aprendió con 3,128 anuncios de septiembre cuánto cambia el alquiler según el distrito, el área, los dormitorios, las amenidades y el transporte. Lo importante no es el nombre del algoritmo: lo probamos con anuncios que no había visto. Y devuelve seis respuestas: precio y rango, parecidos, transporte, tendencia, tres precios y recomendaciones.
- No explicar: los algoritmos (están en el respaldo).
- Transición: «Adrian les muestra cómo funciona con un caso real y en vivo».

---

## Bloque 2 · Demostración — Adrian

### 6. Caso: un propietario en Jesús María · 1 min 10 s
> Un propietario en Jesús María, con 70 m², dos dormitorios y dos baños, pensaba pedir 2,800 porque vio uno a ese precio. DepaRent estima 2,528, con un rango de 1,517 a 3,539. Seis de sus ocho departamentos más parecidos piden menos de 2,800 y el distrito está estable. Le propone tres precios y él elige el equilibrado: 2,530.
> DepaRent no garantiza ese precio: le da la evidencia para elegirlo. Ahora lo hacemos en vivo.

### 7. Demo en vivo · 2 min 30 s
- 1. «Probar el análisis» → cargar el caso de Jesús María (70 m², 2 dorm., 2 baños, 8 años, mantenimiento S/ 250, ascensor).
- 2. Mostrar el precio esperado y la barra del rango.
- 3. Bajar a «Tu precio frente a los parecidos».
- 4. Mostrar los tres precios y el sugerido.
- 5. Si sobra tiempo: «Buscar» → «Más baratos de lo esperado» → abrir una recomendación y su porqué.
- Antes de empezar: abrir la app 5 minutos antes (Render tarda en despertar) y dejar cargada «Probar el análisis».
- Si falla internet: volver a las diapositivas 6 y 8 y contarlo con esas capturas.

### 8. Caso: buscar 2 dormitorios hasta S/ 2,500 · 50 s
> Una persona busca en Jesús María, Lince o Surquillo, dos dormitorios, hasta 2,500 y con un paradero cerca. De casi tres mil anuncios quedan 106. De esos, 30 piden menos de lo que estima el modelo: puede empezar por ahí. Ojo: «por debajo de la estimación» no significa ganga; puede haber algo que el anuncio no dice.
- Transición: «Luciana les explica cómo está hecho y cómo sabemos que funciona».

---

## Bloque 3 · Parte técnica — Luciana

### 9. La interfaz: una pregunta por pantalla · 1 min 20 s
> Diseñamos la interfaz para que alguien sin experiencia la entienda. El propietario llena el formulario en pasos cortos, con iconos y validación en cada paso. El inquilino ve sus recomendaciones con el porqué plegado, para no llenarlo de texto, y su perfil ordenado en tarjetas. Tres reglas: menos texto, el precio grande y arriba, y avisos cuando la estimación no es precisa.

### 10. Lo probamos con 5 personas y cambiamos el producto · 1 min 20 s
> Hicimos pruebas con cinco personas entre el 11 y el 17 de noviembre: dos inquilinos, dos propietarios y una que probó los dos roles. Los inquilinos completaron las ocho tareas sin ayuda y le dieron al recomendador 3.9 de 5, frente a 2.8 del buscador por precio.
> Y nos hicieron cambiar cosas: los propietarios dijeron que había mucho texto, así que pusimos el precio grande y el formulario por pasos; confundían el esquema con el plano; y en Los Olivos el precio parecía muy alto, así que agregamos un aviso.
- Si preguntan: los tiempos de P7 son estimados, no medidos.

### 11. El panel de análisis · 1 min 20 s
> Para el equipo hay un panel que muestra cómo se usa el producto —de registro a publicación y contacto— y cómo le va al modelo con cada captura nueva del mercado.
> Ojo: las cifras de uso de esta captura son de una base de demostración con 300 cuentas simuladas, no de usuarios reales. El error del modelo, 534 soles, sí es real.

### 12. ¿Funciona? Lo medimos con anuncios nuevos · 1 min 20 s
> Lo medimos con anuncios que el modelo nunca había visto. En las cuatro mediciones, DepaRent se equivoca casi la mitad que el precio típico del distrito, y no empeoró en nueve semanas. En el recomendador, 82% de las primeras doce opciones cumplen lo que la persona pidió, frente a 23% del mejor orden del buscador y 25% al azar. Además, los 296 análisis que probamos son coherentes y pasan las 77 pruebas automáticas.
- No explicar: R², nDCG ni intervalos (están en el respaldo).
- Transición: «Armando les cuenta qué significa esto para el negocio y qué sigue».

---

## Bloque 4 · Valor y conclusiones — Armando

### 13. ¿Por qué no es solo otro portal? · 45 s
> Ya vieron que funciona. Ahora, ¿en qué se diferencia de un portal? Un portal te muestra anuncios y el precio que pide el dueño. DepaRent interpreta ese precio: lo compara con departamentos parecidos, suma el transporte y la tendencia del distrito, te propone tres precios y te avisa cuando no está seguro. No competimos con los portales: usamos sus anuncios y te llevamos al original. En resumen: el portal te da información; DepaRent te ayuda a decidir.

### 14. Valor para el negocio · 50 s
> Aquí somos cuidadosos: separamos lo medido de lo que todavía es hipótesis. Lo medido: baja a la mitad el error de la referencia típica y ordena casi tres mil anuncios según lo que busca cada persona.
> Como hipótesis, que habría que validar: al propietario le reduciría el riesgo de pedir de más o de menos, y al inquilino el tiempo que pierde en anuncios que no le sirven. Y podría monetizarse siendo gratis para inquilinos, con análisis premium para propietarios o con una suscripción para corredores. No medimos ingresos ni ahorro: eso sería el siguiente paso.
- No decir: cifras de ingresos, clientes o ahorro. No existen.

### 15. Lo que DepaRent todavía no sabe · 50 s
> También queremos ser honestos con los límites. El modelo aprende de precios pedidos, no de contratos cerrados. En alquileres desde siete mil soles acierta menos. Y en distritos como Los Olivos suele estimar de más; por eso la app muestra un aviso, como ven aquí.
> No es una debilidad que escondemos: no queremos que el usuario confíe a ciegas, queremos darle más información para decidir.

### 16. Conclusiones y siguientes pasos · 50 s
> Nos quedamos con tres cosas. Uno: el modelo baja a la mitad el error y se mantuvo estable nueve semanas. Dos: un mismo análisis sirve a los dos lados del alquiler. Tres: las pruebas con personas cambiaron el producto.
> Lo que sigue: actualizar el mercado de forma periódica, mejorar los alquileres altos y los distritos con pocos datos, y medir el uso real. Y, como visión, llevarlo a otras ciudades y a corredores inmobiliarios.

### 17. Cierre · 30 s
> Empezamos con una pregunta: ¿cuánto cuesta equivocarse al poner un precio? DepaRent no decide por ustedes: les da contexto, evidencia y alternativas. El propietario decide cuánto pedir y el inquilino decide dónde mirar. Pueden probarlo ahora en deparent.onrender.com. Muchas gracias.

---

## Respaldo (solo si preguntan)

| Diapositiva | Para responder |
|---|---|
| B1 Arquitectura | Cómo está construido: un servicio en Render; la API sirve el frontend; cuentas en Postgres (Neon). |
| B2 Métricas | MAE, MAPE, R² y cobertura por corte; recomendador, perfiles y tendencia; rango por precio. |
| B3 Métodos | Qué técnica usa cada componente y cómo se evaluó. |
| B4 Datos y validación | Fuentes, fechas y cómo evitamos que el modelo vea los datos de prueba. |
