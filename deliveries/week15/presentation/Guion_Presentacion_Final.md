# Guion de la presentación final — DepaRent

Pitch de **unos 20 minutos** para un público que no sabe machine learning. Archivo: `PresentationFinal.pptx`
(17 diapositivas y 4 de respaldo). Cada diapositiva tiene en sus notas a quién le toca y el tiempo.

| Bloque | Quién | Diapositivas | Tiempo |
|---|---|---|---|
| 1. La problemática | Adrian | 1–3 | 3 min 15 s |
| 2. Cómo lo solucionamos (con demo) | Armando | 4–8 | 6 min 20 s |
| 3. La parte técnica: interfaz y panel | Luciana | 9–11 | 4 min |
| 4. Conclusiones y recomendaciones | Breysi | 12–17 | 5 min 05 s |
| Cambios de turno y margen | — | — | ≈ 1 min 20 s |

**Antes de empezar:** abrir https://deparent.onrender.com 5 minutos antes (Render tarda en despertar), dejar
cargado «Probar el análisis» y tener el PDF abierto por si falla internet.

Todas las cifras salen del repositorio: `deliveries/week12/EvaluationReport.md`, `deliveries/week10/resultados/` y
`deliveries/week12/pruebas_usuarios/`. Lo que es hipótesis está rotulado así en la diapositiva 14.

---

## Bloque 1 · La problemática — Adrian

### 1. ¿Cuánto cuesta equivocarse al poner el precio de un alquiler? · 1 min
> Imagínense que tienen un departamento en Lima y lo quieren alquilar. ¿Cuánto piden? Lo más común es mirar cuánto se
> pide en el distrito. Medimos qué tan bien funciona eso: con 2,063 anuncios nuevos de noviembre, ese método se equivoca
> en promedio en 1,055 soles al mes. Con DepaRent el error baja a 534 soles: casi la mitad. Somos Adrian, Armando,
> Breysi y Luciana, y esto es DepaRent.

- **No explicar:** qué es el MAE ni cómo se calculó. Si preguntan: «es el error promedio en soles por anuncio».

### 2. Dos preguntas sin una buena respuesta · 1 min 15 s
> El problema tiene dos lados. Un propietario ve un anuncio parecido a 2,800 y pide lo mismo. Pero ese anuncio puede
> tener más área, cochera o llevar meses sin alquilarse. Si pide de más, el depa se queda vacío; si pide de menos,
> pierde plata cada mes. Del otro lado, una persona que busca: solo en Lince, con dos dormitorios y hasta 2,500 soles,
> hay 32 anuncios. En toda Lima, casi tres mil. ¿Cuál vale lo que piden?

### 3. Los portales muestran anuncios; falta decidir · 1 min
> Los portales hacen bien su trabajo: muestran anuncios. Pero entre ver anuncios y decidir hay un paso que nadie da:
> poner esos anuncios en contexto —el transporte, cómo se mueve el precio del distrito— y convertirlo en una
> recomendación. Ese paso es DepaRent.

- **Transición:** «Armando les cuenta cómo lo resolvimos».

---

## Bloque 2 · Cómo lo solucionamos — Armando

### 4. DepaRent: apoyo a la decisión · 50 s
> DepaRent tiene dos caminos que usan el mismo análisis. El propietario describe su depa en tres o cuatro pasos, recibe
> el análisis, elige uno de tres precios y publica. El inquilino cuenta qué busca, recibe opciones con el porqué de
> cada una, compara el precio pedido con el estimado y escribe al dueño. Todo esto está publicado y funciona hoy.

### 5. Cómo convierte datos en decisiones · 1 min
> Usamos datos reales de Lima: 12,235 anuncios distintos de Adondevivir y Urbania que descargamos entre el 20 de octubre
> y el 17 de noviembre, los paraderos de la ATU y las series de precio del BCRP. El motor aprendió con 3,128 anuncios de
> septiembre cuánto cambia el alquiler según el distrito, el área, los dormitorios, las amenidades y el transporte. Lo
> importante no es el nombre del algoritmo: lo probamos con anuncios que no había visto. Y devuelve seis respuestas:
> precio y rango, parecidos, transporte, tendencia, tres precios y recomendaciones.

- **No explicar:** HistGradientBoosting, K-Means ni SARIMA. Están en el respaldo B3.

### 6. Caso: un propietario en Jesús María · 1 min 10 s
> Un propietario con 70 m², dos dormitorios y dos baños pensaba pedir 2,800 porque vio uno a ese precio. DepaRent estima
> 2,528, con un rango de 1,517 a 3,539. Seis de sus ocho departamentos más parecidos piden menos de 2,800 y el distrito
> está estable. Le propone tres precios y él elige el equilibrado: 2,530. DepaRent no garantiza ese precio; le da la
> evidencia para elegirlo.

### 7. Demo en vivo · 2 min 30 s
1. «Probar el análisis» → cargar el caso de Jesús María (70 m², 2 dorm., 2 baños, 8 años, mantenimiento S/ 250, ascensor).
2. Mostrar el precio esperado y la barra del rango.
3. Bajar a «Tu precio frente a los parecidos».
4. Mostrar los tres precios y el sugerido.
5. Si sobra tiempo: «Buscar» → filtro «Más baratos de lo esperado» → abrir una recomendación y su porqué.

- **Si falla internet:** volver a las diapositivas 6, 8 y 9 y contarlo con las capturas.
- **No hacer:** recorrer todas las pestañas ni crear cuentas en vivo.

### 8. Caso: buscar 2 dormitorios hasta S/ 2,500 · 50 s
> Una persona busca en Jesús María, Lince o Surquillo, dos dormitorios, hasta 2,500 y con un paradero cerca. De casi tres
> mil anuncios quedan 106. De esos, 30 piden menos que lo que estima el modelo: puede empezar por ahí. Ojo: «por debajo
> de la estimación» no significa ganga; puede haber algo que el anuncio no dice.

- **Transición:** «Luciana les muestra cómo está hecha la interfaz y cómo la seguimos».

---

## Bloque 3 · Interfaz y panel — Luciana

### 9. La interfaz: una pregunta por pantalla · 1 min 20 s
> Diseñamos la interfaz para que alguien sin experiencia la entienda. El propietario llena el formulario en pasos cortos,
> con iconos y validación en cada paso. El inquilino ve sus recomendaciones con el porqué plegado, para no llenarlo de
> texto, y su perfil ordenado en tarjetas. Tres reglas: menos texto, el precio grande y arriba, y avisos cuando la
> estimación no es precisa.

### 10. Lo probamos con 5 personas · 1 min 20 s
> Hicimos pruebas con cinco personas entre el 11 y el 17 de noviembre: dos inquilinos, dos propietarios y una que probó los
> dos roles. Los inquilinos completaron las ocho tareas sin ayuda y le dieron al recomendador 3.9 de 5 frente a 2.8 del
> buscador por precio. Y nos hicieron cambiar cosas: los propietarios dijeron que había mucho texto, así que pusimos el
> precio grande y el formulario por pasos; confundían el esquema con el plano; y en Los Olivos el precio parecía muy
> alto, así que agregamos un aviso.

- **Si preguntan:** los tiempos de P7 son estimados, no medidos, y P5 a P7 no tienen el cierre C1–C5.

### 11. El panel de análisis · 1 min 20 s
> Para el equipo hay un panel que muestra cómo se usa el producto —de registro a publicación y contacto— y cómo le va al
> modelo con cada captura nueva. Ojo con algo: las cifras de uso de esta captura son de una base de demostración con 300
> cuentas simuladas, no de usuarios reales. El error del modelo, 534 soles, sí es real.

- **Transición:** «Breysi les cuenta qué tan bien funciona y qué sigue».

---

## Bloque 4 · Conclusiones y recomendaciones — Breysi

### 12. ¿Funciona? · 1 min 20 s
> Lo medimos con anuncios que el modelo nunca había visto. En las cuatro mediciones, DepaRent se equivoca casi la mitad
> que el precio típico del distrito, y no empeoró en nueve semanas. En el recomendador, 82% de las primeras doce opciones
> cumplen lo que la persona pidió, frente a 23% del mejor orden del buscador y 25% al azar. Además, los 296 análisis que
> probamos son coherentes y pasan las 77 pruebas automáticas.

- **No explicar:** R², nDCG ni intervalos de confianza. Están en el respaldo B2.

### 13. ¿Por qué no es solo otro portal? · 45 s
> Un portal muestra anuncios y el precio que pide el dueño. DepaRent interpreta ese precio, lo compara con parecidos,
> suma transporte y tendencia, propone tres precios, recomienda y avisa cuando no es preciso. No competimos con los
> portales: usamos sus anuncios y enlazamos al original.

### 14. Valor para el negocio · 50 s
> Separamos lo medido de lo que todavía es hipótesis. Lo medido: baja a la mitad el error y ordena el mercado según el
> perfil. Como hipótesis, podría reducir el riesgo de pedir de más o de menos y el tiempo de búsqueda, y monetizarse con
> un modelo gratis para inquilinos, análisis premium para propietarios o una suscripción para corredores. No medimos
> ingresos ni ahorro: eso habría que validarlo.

- **No decir:** cifras de ingresos, clientes o ahorro. No existen.

### 15. Lo que DepaRent todavía no sabe · 50 s
> Aprende precios pedidos, no de contrato. En alquileres desde 7,000 soles el rango acierta 66 de cada 100. En distritos
> como Los Olivos el modelo suele estimar de más, y por eso la app lo avisa. Y el mercado es una foto del 17 de noviembre.
> No queremos que confíen a ciegas: queremos darles más información para decidir.

### 16. Conclusiones y siguientes pasos · 50 s
> Tres conclusiones: el modelo baja a la mitad el error y se mantuvo estable; un mismo análisis sirve a los dos lados del
> alquiler; y las pruebas con personas cambiaron el producto. Lo siguiente: capturas periódicas, mejorar los alquileres
> altos y los distritos con pocos datos, y medir el uso real. Como visión, otras ciudades y corredores.

### 17. Cierre · 30 s
> Empezamos preguntando cuánto cuesta equivocarse. DepaRent no decide por ustedes: les da contexto, evidencia y
> alternativas. El propietario decide cuánto pedir; el inquilino, dónde mirar. Pruébenlo en deparent.onrender.com.
> Gracias.

---

## Respaldo (solo si preguntan)

| Diapositiva | Para responder |
|---|---|
| B1 Arquitectura | «¿Cómo está construido?» — un servicio en Render; la API sirve el frontend; cuentas en Postgres (Neon). |
| B2 Métricas | MAE, MAPE, R² y cobertura por corte; recomendador, perfiles y tendencia; rango por precio. |
| B3 Métodos | Qué técnica usa cada componente y cómo se evaluó. |
| B4 Datos y validación | Fuentes, fechas y cómo evitamos que el modelo «vea» los datos de prueba. |
