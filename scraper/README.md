# Descarga de anuncios

Repite la adquisición de la Semana 4 (`deliveries/week04/acquisition.md`) en Adondevivir y Urbania, para tener
varias capturas en el tiempo y poder validar el modelo con anuncios posteriores.

## Descargas hechas
Del **20 de octubre al 17 de noviembre de 2026**: 18 días de descarga, **8 completos** (20, 21, 23, 25 y 26 de
octubre; 9, 10 y 17 de noviembre), cada uno con 6,300–6,900 anuncios. En total, **12,235 anuncios distintos**.
La app usa la captura del 17 de noviembre. La descarga se dio por terminada el 17 de noviembre.

## Ejecutar
```powershell
py -3 scraper\descarga_diaria.py                     # descarga completa (~10-15 min)
py -3 scraper\descarga_diaria.py --max-paginas 2 --sin-historial   # prueba rápida
```
No requiere instalar librerías (solo Python 3 estándar).

## Qué se guarda (`data_diaria/`, fuera de git)
| Archivo | Contenido |
|---|---|
| `snapshots/AAAA-MM-DD.csv.gz` | Foto del día con las mismas 43 columnas de `departamentos_alquiler_lima.csv`, más `estado_portal` y `fecha_modificacion_portal` |
| `historial_precios.csv` | Una fila por anuncio y día: `fecha, id_anuncio, fuente, distrito, precio, moneda, precio_soles` |
| `anuncios.csv` | Una fila por anuncio: primera y última vez visto, días publicado, si sigue activo, precio inicial/actual y número de cambios de precio |
| `descargas_log.csv` | Resumen de cada ejecución (anuncios, páginas, errores, duración) |
| `ultima_ejecucion.log` | Salida de la última ejecución programada |

Leer un snapshot: `pd.read_csv("data_diaria/snapshots/2026-10-21.csv.gz")`.

## Decisiones
- Solo inmuebles tipo **Departamentos** (se descartan edificios y proyectos sin características).
- Deduplicación por `id_anuncio` entre portales (comparten IDs); se conserva el primero (Adondevivir).
- USD a soles con 3.75, la misma tasa de referencia de la Semana 4.
- Las amenidades quedan vacías, igual que en la Semana 4; se derivan en el EDA desde `texto_amenidades_crudo`.
- Teléfonos y correos del texto se reemplazan por `[telefono]` y `[correo]`; no se guarda el anunciante.
  El texto puede seguir teniendo nombres y las direcciones se conservan: por eso `data_diaria/` no se sube.
- Que un anuncio deje de aparecer (`activo = 0`) no confirma que se alquiló; puede haberse retirado o republicado.
- Correr dos veces el mismo día reemplaza los datos de ese día, no los duplica.
- Los portales a veces responden 403 (bloqueo). Ante un 403 o 429 se espera 15, 30, 60 y 120 s antes de reintentar,
  después de cada página fallida se hace una pausa de 2 min, y el portal solo se abandona tras 3 páginas fallidas
  **seguidas** (antes bastaban 3 en total y quedaban días con 30 anuncios).
- **Descarga completa:** un día con al menos el 80% de los anuncios del día con más anuncios. `descargas_log.csv` lo
  marca en la columna `completa`. `activo` se calcula desde la última descarga completa, así que un día bloqueado
  no deja a casi todos los anuncios como inactivos. Los precios de los días incompletos sí se guardan.
