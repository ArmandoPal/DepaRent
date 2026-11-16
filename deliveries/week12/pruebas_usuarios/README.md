# Pruebas con usuarios — DepaRent

Sesiones hechas con el guion `../GuionPruebasUsuarios.md` y la plantilla `../plantilla_observaciones.csv`.
Se probó la versión publicada **antes** de la revisión del profesor del 14 de noviembre de 2026.
En ambas sesiones el guion asignó el escenario de búsqueda (presupuesto, distritos, prioridades); las respuestas,
tiempos y notas son de cada participante.

| Código | Tipo | Fecha | Informe | Registro |
|---|---|---|---|---|
| P2 | Inquilino | 11-nov-2026 | `P2_inquilino.docx` | `P2_observaciones.xlsx` |
| P3 | Inquilina | sin registrar | `P3_inquilino.docx` | `P3_observaciones.xlsx` |

`observaciones.csv` reúne las dos sesiones en el formato de la plantilla.

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
- `P3_observaciones.xlsx`: los tiempos se alinearon con el Word (T2 2.5, T5 4.0, buscador 1.5 min). T7
  recomendados (5.1 min) solo figura en el Excel. La fecha de la sesión no quedó registrada.
- `P3_inquilino.docx`: decía «resultado simulado» y «respuesta simulada» porque el escenario lo fijaba el guion.
  Se cambió por «resultado» y «frase de la participante» para no confundirlo con una sesión inventada.
- Ambos Excel: hoja `observaciones`, nombres de tarea iguales a la plantilla y columna `origen`.

## Limitaciones

- **2 sesiones** frente a la meta de 5 del guion, y ninguna con propietarios: las tareas T3 (precio de
  publicación), T4 (simulador de mejoras) y T6 (publicar) no se han probado con personas.
- Se probó la versión anterior a la revisión del profesor. Algunos hallazgos ya se atendieron (ver
  `../EvaluationReport.md` §6c) y deben volver a comprobarse con la versión actual.
- Con dos personas las notas orientan, pero no permiten generalizar la ventaja del recomendador.
