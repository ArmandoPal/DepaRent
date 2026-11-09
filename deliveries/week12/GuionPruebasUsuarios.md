# Guion de pruebas con usuarios — DepaRent

**Objetivo.** Comprobar con personas reales si DepaRent les ayuda a decidir un precio (propietarios) o a
elegir dónde mirar (inquilinos), y encontrar lo que confunde en la interfaz antes de la Semana 15.

**Meta mínima:** 5 sesiones en total, con **al menos 2 propietarios** (o personas que hayan alquilado un
departamento suyo o de su familia) y **al menos 2 inquilinos** (personas que hayan buscado departamento en
Lima en el último año). Cada sesión dura **20–25 minutos**.

**Quién hace qué en cada sesión:** una persona del equipo **conduce** (lee el guion, no ayuda) y otra **anota**
en `plantilla_observaciones.csv`. Si solo hay una, que grabe la pantalla (con permiso) y anote después.

---

## Antes de la sesión (5 min, quien conduce)

1. Abrir https://deparent.onrender.com **5 minutos antes**: el servicio gratuito tarda 30–60 s en despertar.
2. Usar una ventana de incógnito (sin sesión iniciada).
3. Tener la plantilla abierta y anotar: fecha, código del participante (P1, P2…; **no el nombre**) y tipo
   (propietario / inquilino).
4. Para la tarea de propietario, tener a mano los datos del caso por si el participante no tiene un departamento
   propio: Jesús María, 70 m², 2 dormitorios, 2 baños, 8 años, ascensor, sin cochera, mantenimiento S/ 250.

## Introducción (leer tal cual, 2 min)

> "Gracias por ayudarnos. Estamos probando DepaRent, una página para estimar precios de alquiler de
> departamentos en Lima. **Estamos probando la página, no a ti**: si algo no se entiende, es un problema de la
> página. Te voy a pedir unas tareas. Por favor, **piensa en voz alta**: dime qué buscas, qué esperas que pase
> y qué te sorprende. No te voy a poder ayudar mientras lo haces, pero al final respondo todo.
> ¿Te parece bien si tomo notas [y grabo la pantalla]? No guardamos tu nombre."

Preguntas iniciales (anotar respuestas cortas):
- ¿Has alquilado o buscado un departamento en Lima? ¿Cuándo?
- ¿Cómo decidiste el precio o cómo sabías si un precio era razonable?

---

## Tareas

Leer cada tarea y **no dar pistas**. Si el participante se traba más de 2 minutos, anotar "no completó" y pasar
a la siguiente. Para cada tarea anotar: **completó (sí / con ayuda / no)**, **tiempo**, **dónde dudó** y
**frases textuales**.

### Tarea 1 — Primera impresión (todos, 2 min)
> "Mira la página de inicio durante 30 segundos. ¿Qué crees que puedes hacer aquí? ¿Para quién es?"

Éxito: menciona que estima precios de alquiler y que sirve a propietarios o inquilinos.

### Tarea 2 — Estimar un precio (todos, 5 min)
> "Tienes un departamento [el tuyo o el de la tarjeta] y quieres saber a cuánto alquilarlo. Averígualo sin
> crear una cuenta."

Éxito: llega a "Probar", completa el formulario y encuentra el precio estimado.
Preguntar al terminar: *"¿Qué significa el rango que aparece debajo del precio? ¿Te fiarías de ese número?"*

### Tarea 3 — Elegir el precio de publicación (propietarios, 4 min)
> "Con lo que ves, ¿a cuánto lo publicarías? ¿Por qué?"

Éxito: usa los comparables o los tres escenarios para justificar el precio.
Observar: ¿entiende la diferencia entre competitivo, equilibrado y renta superior? ¿mira la tendencia?

### Tarea 4 — Probar una mejora (propietarios, 3 min)
> "Quieres saber si agregar un balcón cambiaría el precio. Averígualo."

Éxito: encuentra el simulador y entiende que el cambio es pequeño.
Preguntar: *"¿Harías la remodelación por este resultado?"* (comprobar si leyó el aviso de que no es un efecto
garantizado).

### Tarea 5 — Buscar departamento (inquilinos, 5 min)
> "Buscas 2 dormitorios por hasta S/ 2,500 en Lince, Jesús María o Surquillo, cerca de un paradero. Encuentra
> uno que te parezca buena opción y explícame por qué."

Éxito: usa los filtros y la valoración ("por debajo del estimado") para elegir.
Preguntar: *"¿Qué crees que significa 'por debajo del estimado'? ¿Te genera confianza o sospecha?"*

### Tarea 6 — Publicar un departamento (propietarios, 4 min; opcional si falta tiempo)
> "Ahora quieres que los inquilinos vean tu departamento en DepaRent. Hazlo."

Éxito: crea una cuenta (con un correo de prueba como `prueba1@ejemplo.com`), agrega el departamento y lo
publica.

---

## Cierre (4 min)

Cuestionario rápido de 1 a 5 (1 = totalmente en desacuerdo, 5 = totalmente de acuerdo):

| # | Afirmación |
|---|---|
| C1 | Entendí qué hace DepaRent sin que me lo expliquen. |
| C2 | Confío en el precio estimado. |
| C3 | La información me ayudó a decidir (precio o qué departamento mirar). |
| C4 | Fue fácil encontrar lo que buscaba. |
| C5 | Usaría DepaRent la próxima vez que alquile o busque departamento. |

Preguntas abiertas:
- ¿Qué fue lo **más útil**?
- ¿Qué fue lo **más confuso** o lo que te faltó?
- Si pudieras cambiar una sola cosa, ¿cuál sería?

> "Muchas gracias. Ahora sí, ¿tienes alguna pregunta sobre lo que viste?"

---

## Después de las sesiones (quien junta los resultados)

1. Completar `plantilla_observaciones.csv` con una fila por participante y tarea.
2. Juntar los problemas repetidos y clasificarlos:
   - **Crítico:** impidió completar una tarea.
   - **Importante:** causó duda o error, pero la completó.
   - **Menor:** comentario o sugerencia.
3. Calcular: tasa de éxito por tarea, tiempo mediano por tarea y promedio de C1–C5.
4. Pasarle la tabla a quien actualiza el informe: van a la sección 6 de `EvaluationReport.md` como
   "Observaciones de uso", con los 3 cambios que se harán antes de la Semana 15.

## Cuidados

- No pedir datos personales ni la dirección real del departamento del participante.
- No usar correos reales al crear cuentas: usar `pruebaN@ejemplo.com`.
- Si se graba, borrar la grabación después de anotar; en el repositorio solo va la plantilla anónima.
