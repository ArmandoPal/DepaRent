# DepaRent — Guía para el profesor

Este archivo responde punto por punto a lo que se pidió para la revisión. La descripción general del proyecto y
las instrucciones completas están en el [`README.md`](README.md).

La revisión local del 13 de noviembre, con cambios, métricas y pasos pendientes, está en
[`REVISION_DepaRent_13-11-2026.md`](REVISION_DepaRent_13-11-2026.md). La web pública aún no usa necesariamente esta copia.

| | |
|---|---|
| **App desplegada** | https://deparent.onrender.com (plan gratuito: la primera visita tarda 30–60 s en despertar) |
| **Repositorio** | https://github.com/Luciana-y/DepaRent |
| **Panel de KPIs** | Ingresar con una cuenta de análisis habilitada por el equipo (ver §2) |
| **Equipo** | Adrian Urbina Mendoza · Armando Martinez Palomino · Breysi Salazar Medina · Luciana Yangali Cáceres |

---

## 1. Lo que se pidió incluir y dónde está

| Pedido | Dónde está |
|---|---|
| **Código completo y actualizado** | Producto (API + modelos): [`deliveries/week10/code/`](deliveries/week10/code/) · Interfaz web: [`deliveries/week10/frontend/`](deliveries/week10/frontend/) · Descarga diaria de anuncios: [`scraper/`](scraper/) · Índice del código por etapa: [`deliveries/week15/code/README.md`](deliveries/week15/code/README.md) |
| **Base de datos utilizada** | Datos crudos (septiembre): [`deliveries/week04/data/`](deliveries/week04/data/) · Datos procesados: [`deliveries/week07/data/`](deliveries/week07/data/) · Mercado actual de la app (captura del 9-nov-2026): [`deliveries/week10/data/mercado.csv`](deliveries/week10/data/) · Diccionario de datos: [`deliveries/week07/data_dictionary.csv`](deliveries/week07/data_dictionary.csv) · Base de cuentas: Postgres (Neon) en producción y SQLite en local |
| **Notebooks o scripts de entrenamiento** | Notebooks de EDA y preprocesamiento: [`deliveries/week06/code/EDA_week06_v5.ipynb`](deliveries/week06/code/), [`deliveries/week07/code/EDA_week07.ipynb`](deliveries/week07/code/) · Notebook del profesor: [`deliveries/week10/code/Notebook_docente.ipynb`](deliveries/week10/code/) · Scripts: `entrenar.py` (precio), `entrenar_perfil.py` (K-Means) y `entrenar_tendencia.py` (SARIMA) en `deliveries/week10/code/` |
| **Modelo entrenado** | [`deliveries/week10/models/`](deliveries/week10/models/) (`modelo_docente.joblib`, `perfil_competitivo.joblib`) · Cómo cargarlos y sus métricas: [`deliveries/week10/models/metadata.md`](deliveries/week10/models/metadata.md) |
| **Interfaz o prototipo actual** | En línea: https://deparent.onrender.com · Código: [`deliveries/week10/frontend/`](deliveries/week10/frontend/) · Capturas: [`deliveries/week10/screenshots/`](deliveries/week10/screenshots/) · Bocetos y wireframes: [`deliveries/week07/design/`](deliveries/week07/design/) |
| **Documentos y presentaciones** | Tabla por semana en el [`README.md`](README.md) §3 · Evaluación: [`deliveries/week12/EvaluationReport.md`](deliveries/week12/EvaluationReport.md) · Última presentación: [`deliveries/week10/PresentationWeek10.pptx`](deliveries/week10/) |
| **Instrucciones para instalar y ejecutar** | [`README.md`](README.md) §4 |
| **Enlace de GitHub** | https://github.com/Luciana-y/DepaRent |
| **Ejercicio del profesor (n y MAE de un distrito)** | [`deliveries/week10/code/EJERCICIO_FINAL.py`](deliveries/week10/code/EJERCICIO_FINAL.py) |
| **Demostración del tablero con 300 cuentas ficticias** | Generador: [`deliveries/week10/code/crear_demo_300.py`](deliveries/week10/code/crear_demo_300.py) · CSV y pasos: [`deliveries/week10/resultados/simulacion_300_usuarios/LEEME.md`](deliveries/week10/resultados/simulacion_300_usuarios/LEEME.md). Usa otra base local; los registros nuevos se muestran aparte. |
| **Ayuda y supervisión** | Botón «Ayuda» en las vistas públicas y «Asistente de supervisión» dentro del panel de análisis. Son guías basadas en funciones e indicadores existentes, no un chat con una persona ni un servicio generativo. |

## 2. Acceso al panel de KPIs

En https://deparent.onrender.com, entrar a **Ingresar** con una cuenta de análisis ya habilitada. La contraseña
se entrega a la persona responsable por un canal privado; no debe publicarse en el repositorio. La clave que
aparecía en una versión anterior de esta guía debe cambiarse antes de usar el panel en producción.

Al iniciar sesión se abre directamente el **Panel de análisis (KPIs)**: uso del producto (cuentas, perfiles,
departamentos, publicaciones, guardados y mensajes), métricas del modelo, estado de los datos y evaluación del
recomendador. El panel solo muestra conteos agregados, sin datos personales.

Para crear una cuenta de análisis en local, configure `DEPARENT_ANALISTAS` con el correo autorizado y ejecute,
desde `deliveries/week10/code/`, el siguiente comando. El programa solicita la clave dos veces, sin mostrarla
ni incluirla en la línea de comandos:

```powershell
$env:DEPARENT_ANALISTAS = "correo.autorizado@ejemplo.com"
..\..\..\.venv\Scripts\python.exe gestionar_analista.py --email correo.autorizado@ejemplo.com --nombre "Nombre del analista"
```

Si la cuenta ya existe, cambie su clave con el mismo programa; esto cierra las sesiones anteriores:

```powershell
..\..\..\.venv\Scripts\python.exe gestionar_analista.py --email correo.autorizado@ejemplo.com --cambiar-clave
```

Para administrar la base de producción, ejecute el comando únicamente en un entorno privado que tenga
la misma `DATABASE_URL` y `DEPARENT_ANALISTAS` que usa el servicio. El registro público de la web no permite
crear cuentas de análisis. Después de habilitarla, el analista inicia sesión por **Ingresar**.

## 3. Documento breve

Está en [`deliveries/week15/EstadoProyecto.md`](deliveries/week15/EstadoProyecto.md). Cada pregunta tiene su sección:

| Pregunta | Sección |
|---|---|
| Qué mejoras realizaron | §1 |
| Qué funciona actualmente | §2 |
| Qué modelo están utilizando y qué resultados obtuvieron | §3 |
| Cómo se conectan los datos, el modelo y la interfaz | §4 |
| Qué simulación pueden mostrar | §5 |
| Qué dificultades tienen actualmente | §6 |
| Qué les falta completar | §7 |
| Qué desean demostrar en la presentación | §8 |
| Qué parte está desarrollando cada integrante | §9 |

## 4. Ejecución rápida (Windows, desde la carpeta `DepaRent` extraída del ZIP)

```powershell
py -3.14 -m venv .venv
.venv\Scripts\python.exe -m pip install -r deliveries/week10/code/requirements.txt
cd deliveries/week10/code
..\..\..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

Abrir **http://127.0.0.1:8000**. No se necesitan credenciales para usarlo en local.
