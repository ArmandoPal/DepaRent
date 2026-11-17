# Pruebas con usuarios — DepaRent

Sesiones hechas con el guion `../GuionPruebasUsuarios.md` y la plantilla `../plantilla_observaciones.csv`.
Se probó la versión publicada **antes** de la revisión del profesor del 14 de noviembre de 2026.
En ambas sesiones el guion asignó el escenario de búsqueda (presupuesto, distritos, prioridades); las respuestas,
tiempos y notas son de cada participante.

| Código | Tipo | Fecha | Informe | Registro |
|---|---|---|---|---|
| P2 | Inquilino | 11-nov-2026 | `P2_inquilino.docx` | `P2_observaciones.xlsx` |
| P3 | Inquilina | sin registrar | `P3_inquilino.docx` | `P3_observaciones.xlsx` |
| P5 | Propietario | sin registrar | `P5_propietario.docx` | solo en `observaciones.csv` |
| P6 | Propietario | sin registrar | `P6_propietario.docx` | solo en `observaciones.csv` |
| P7 | Propietario e inquilino | 17-nov-2026 | `P7_propietario_inquilino.docx` | solo en `observaciones.csv` |

`observaciones.csv` reúne las cinco sesiones en el formato de la plantilla.

## Sesión con doble rol (P7)

P7 recorrió la app como propietario y como inquilino, con la versión que ya tenía las mejoras pedidas por P5 y P6.
El equipo registró sus observaciones como notas el 17-nov-2026. Los tiempos de T2, T5 y T7 son **estimados** con el
promedio de P2 y P3 en la misma tarea (2.9, 3.9 y 4.8 min), **no medidos**; no hay tareas completadas, frases
textuales ni cierre C1–C5. En `observaciones.csv` hay una fila por tarea comentada (T2, T3, T5, T6, T7 y el perfil del inquilino).

| Recorrido | Observación | Severidad (equipo) |
|---|---|---|
| Propietario · T2 | En Los Olivos el precio estimado parecía incorrecto o muy alto | Importante |
| Propietario · T3 | «Opcional» en el paso «Tu precio» no se notaba | Menor |
| Propietario · T6 | «Retirar publicación» en otra fila que las demás acciones | Menor |
| Inquilino · perfil | Las descripciones de hogar repetían «pesan»; «Lo que buscas» poco ordenado | Menor |
| Inquilino · T7 | Texto largo bajo el esquema, motivo no plegable, amenidades poco visibles | Menor |
| Inquilino · T5 | Demasiado texto de transporte; la explicación del distrito, más clara y más pequeña | Menor |

Todas se atendieron el 17-nov-2026 (ver `../EvaluationReport.md` §6c) y quedan por volver a comprobar.

## Sesiones con propietarios (P5 y P6)

Conducidas por Luciana. Llegaron en un solo Word (`Propietarios_Luciana.docx`) y se separaron en un archivo por
participante. Cada informe da un tiempo total para la sesión, no uno por tarea, así que en `observaciones.csv` cada
sesión ocupa una sola fila. No hay preguntas de cierre (C1–C5) ni notas de utilidad.

| | Tareas | Completó | Tiempo | Severidad | Frase textual |
|---|---|---|---|---|---|
| P5 | T1, T2 | Con ayuda | 6 min | Importante | «Veo mucho texto y muy pocas imágenes o dinamismo, no entiendo bien que estoy tocando se ve muy frío.» |
| P6 | T1, T2, T3 | Con ayuda | 5 min | Importante | «Mucho texto, me confunde un poco y me abruma.» |

- **En común:** demasiado texto. A P5 le costó entender la interfaz y el formulario después de iniciar sesión;
  P6 se abrumó con la explicación del cálculo del precio.
- **P6** valoró el diseño y que el rango fuera accesible, pero consideró que el margen de error es demasiado amplio.
- **Propuestas de los informes:** textos más breves, más iconos e imágenes, mejor jerarquía visual del formulario,
  indicaciones paso a paso, resultado del precio más visual y una explicación del margen de error.

## Resultados por tarea

| Tarea | P2: completó · tiempo · severidad | P3: completó · tiempo · severidad |
|---|---|---|
| T1 Primera impresión | Sí · 0.5 min · menor | Sí · 0.5 min · menor |
| T2 Estimar un precio | Sí · 3.2 min · importante | Sí · 2.5 min · menor |
| T5 Buscar departamento | Sí · 3.8 min · importante | Sí · 4.0 min · importante |
| T7 Recomendados | Sí · 4.5 min · importante | Sí · 5.1 min · importante |
| T7 Buscador por precio | Sí · 2.1 min · menor | Sí · 1.5 min · menor |

**8 de 8 tareas completadas sin ayuda.**

## Recomendador frente a buscador (utilidad 1–5 de los 5 primeros)

| | Recomendador | Buscador por precio |
|---|---|---|
| P2 | 5;4;4;3;4 → **4.0** | 3;3;2;4;2 → **2.8** |
| P3 | 4;4;3;5;3 → **3.8** | 3;2;3;4;2 → **2.8** |
| Promedio | **3.9** | **2.8** |

## Cierre (1–5)

| | C1 entendí | C2 confío | C3 me ayudó | C4 fácil | C5 lo usaría |
|---|---|---|---|---|---|
| P2 | 5 | 4 | 5 | 4 | 4 |
| P3 | 5 | 4 | 4 | 3 | 4 |
| Promedio | 5.0 | 4.0 | 4.5 | 3.5 | 4.0 |

- **Más útil:** ver el precio pedido junto al precio estimado (ambos).
- **Más confuso:** el esquema de distribución parecía el plano real (ambos).
- **Cambiarían:** explicar mejor por qué aparece cada recomendación (P2); si no hay opciones en el distrito,
  mostrar distritos cercanos antes de sugerir subir el presupuesto (P3).

## Correcciones hechas a los archivos originales

- `P2_observaciones.xlsx`: Excel había convertido los tiempos en fechas (3.2 → 3 de febrero, etc.). Se
  restauraron 3.2, 3.8 y 4.5 min según el Word; el tiempo del buscador (2.1 min) se recuperó de la fecha
  2 de enero, porque el Word no lo indica.
- `Propietarios_Luciana.docx`: se dividió en `P5_propietario.docx` y `P6_propietario.docx` sin cambiar el texto.
  El informe de P6 está incompleto en el original: la lista de mejoras termina en «Mejorar» y no hay conclusión.
- `P3_observaciones.xlsx`: los tiempos se alinearon con el Word (T2 2.5, T5 4.0, buscador 1.5 min). T7
  recomendados (5.1 min) solo figura en el Excel. La fecha de la sesión no quedó registrada.
- `P3_inquilino.docx`: decía «resultado simulado» y «respuesta simulada» porque el escenario lo fijaba el guion.
  Se cambió por «resultado» y «frase de la participante» para no confundirlo con una sesión inventada.
- Ambos Excel: hoja `observaciones`, nombres de tarea iguales a la plantilla y columna `origen`.

## Limitaciones

- **5 sesiones**, la meta del guion: 2 con inquilinos, 2 con propietarios y 1 con doble rol (P7). T4 (simulador de
  mejoras) sigue sin probarse con personas.
- P5 y P6 no tienen fecha ni tiempos por tarea; P7 tiene tiempos estimados, no medidos. Ninguna de las tres tiene cierre
  C1–C5.
- Se probó la versión anterior a la revisión del profesor. Algunos hallazgos ya se atendieron (ver
  `../EvaluationReport.md` §6c) y deben volver a comprobarse con la versión actual.
- Con dos personas las notas orientan, pero no permiten generalizar la ventaja del recomendador.
