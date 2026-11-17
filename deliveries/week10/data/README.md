# Datos del prototipo

## Qué usa la app
| Archivo | Uso | Fecha |
|---|---|---|
| `mercado.csv` | Búsqueda, fichas, comparables y perfiles: 3,074 anuncios únicos | Captura diaria del 9-nov-2026 |
| `mercado.json` | De qué captura sale el mercado; la app muestra esa fecha en sus textos | — |
| `demo_casos.json` | Tres perfiles hipotéticos precargados (Lince, Miraflores, San Isidro) | Copia del profesor |
| `deparent.sqlite` | Cuentas, departamentos e interesados (se crea sola; **no se sube**) | En vivo |
| `../../week07/data/departamentos_procesados.csv` | Entrenamiento de los modelos de precio y de perfiles | 14-sep-2026 |
| `../../week07/data/paraderos_procesado.csv` | Accesibilidad (modelo 2) | ATU, mayo de 2021 |

El **modelo de precio** sigue siendo el de septiembre: se validó con 1,712 anuncios nuevos de octubre y 2,026 de
noviembre y no se degradó (`../resultados/validacion_octubre/` y `../resultados/validacion_noviembre/`). Los **perfiles**
se aprendieron con septiembre y a ellos se asignan los anuncios nuevos; reentrenarlos con octubre daba una segmentación peor.

`mercado.csv` no tiene dirección, coordenadas, título ni descripción. Sí guarda el enlace al anuncio original en
Adondevivir o Urbania, que solo se muestra en la ficha (ver `../PRODUCT.md`). Los valores imposibles (por ejemplo, un
mantenimiento de S/ 350,000) se guardan como no informados.

## Cómo se genera
Desde `deliveries/week10/code`:

```powershell
..\..\..\.venv\Scripts\python.exe preparar_mercado.py     # captura completa más reciente de data_diaria/
..\..\..\.venv\Scripts\python.exe entrenar_perfil.py      # reasigna los perfiles y los comparables
```

Después hay que reiniciar la API, que carga el mercado al arrancar.

## De dónde salen las capturas
La descarga de anuncios se hizo con `scraper/descarga_diaria.py` del 20-oct al 17-nov-2026 (18 días de descarga, 8 completos con 6,300–6,900 anuncios).
Las capturas quedan en `data_diaria/snapshots/` (fuera de git). El mercado actual de la app usa la del 9-nov-2026.
Después de preparar un mercado nuevo hay que subirlo a `main` para que Render lo despliegue.
