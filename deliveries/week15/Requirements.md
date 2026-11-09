# Especificación final de requisitos — DepaRent

<!--
ESQUELETO. Partir de week05/Requirements.pdf y week07/Requirements.pdf. Para cada requisito, indicar si se
cumplió (✅), se cumplió en parte (🟡) o no (❌), y la evidencia (pantalla, endpoint, prueba o métrica).
Responsable: Armando.
-->

## 1. Interesados (stakeholders)
| Interesado | Interés |
|---|---|
| Propietario de departamento | _…_ |
| Inquilino | _…_ |
| _…_ | _…_ |

## 2. Necesidades de los usuarios
_…_

## 3. Requisitos funcionales
| ID | Requisito | Estado | Evidencia |
|---|---|---|---|
| RF1 | Analizar y valorar el inmueble (precio esperado y rango) | ✅ | Pantalla "Probar" · `POST /api/analizar` · `test_tendencia_escenarios_api.py` |
| RF2 | Recomendar una estrategia de publicación (tres escenarios) | ✅ | `escenarios_precio.py` · 297/297 casos coherentes (`week12/resultados/coherencia_producto.json`) |
| _…_ | _completar con los de la Semana 5/7_ | | |

## 4. Requisitos no funcionales
| ID | Requisito | Estado | Evidencia |
|---|---|---|---|
| RNF1 | Tiempo de respuesta del análisis | ✅ | mediana 83 ms en local (`coherencia_producto.json`); 30–60 s al despertar en Render |
| RNF2 | Privacidad: sin direcciones ni contactos de anunciantes | ✅ | `test_cuentas_busqueda.py` (sin datos personales) |
| RNF3 | Seguridad de cuentas | ✅ | PBKDF2-SHA256 con sal; sesiones guardadas como hash |
| _…_ | _completar_ | | |

## 5. Supuestos y restricciones
_…_

## 6. Criterios de aceptación
| Criterio | Cumplido | Evidencia |
|---|---|---|
| _…_ | | |

## 7. Cambios respecto de la Semana 7
_Qué requisitos se agregaron (búsqueda para inquilinos, cuentas, ubicación por dirección), cuáles se
recortaron y por qué._
