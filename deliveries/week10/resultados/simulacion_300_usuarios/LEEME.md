# Demostración con 300 usuarios

Esta carpeta contiene `usuarios_300.csv`: **300 cuentas y acciones ficticias** para practicar con el tablero. No representa personas, visitas, contratos, ingresos ni satisfacción reales. El generador es `deliveries/week10/code/crear_demo_300.py` y usa la semilla fija `20261114`. Distribuye las cuentas entre los 30 días anteriores a la ejecución; las fechas se agrupan en hora de Lima.

La simulación usa las tablas existentes: 239 perfiles, 80 guardados, 50 departamentos registrados, 25 publicaciones y 12 mensajes. Los departamentos ficticios **no aparecen** en la búsqueda ni en las recomendaciones públicas; solo alimentan los indicadores de la base de demostración. El predictor de precio y sus métricas no se reentrenan con estas cuentas.

## Ejecutar la demostración

Desde la carpeta `DepaRent` extraída del ZIP, instalen las dependencias como indica el README principal. Después, en **la misma ventana de PowerShell**:

```powershell
cd deliveries/week10/code
..\..\..\.venv\Scripts\python.exe crear_demo_300.py
$env:DEPARENT_DB = (Resolve-Path ..\data\deparent_demo_300.sqlite).Path
$env:DEPARENT_ANALISTAS = "demo-analista@ejemplo.invalid"
..\..\..\.venv\Scripts\python.exe gestionar_analista.py --email demo-analista@ejemplo.invalid --cambiar-clave
..\..\..\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
```

El comando de analista pide una clave local de forma interactiva; no hay una clave publicada en esta entrega. Abran `http://127.0.0.1:8000`, ingresen como analista y visiten «Panel de análisis». Verán 300 cuentas simuladas y 0 posteriores. En otro navegador o ventana privada, registren una cuenta de prueba desde la web. El tablero mostrará **300 simuladas + 1 posterior = 301 cuentas** en la siguiente consulta (o al pulsar «Actualizar ahora»). Repitan con otro registro para ver cómo cambia la serie diaria. No usen correos ni datos personales reales en esta práctica.

El CSV tiene una fila por cuenta ficticia, un ID anónimo, fecha de creación y columnas `0/1` para las etapas perfil, guardado, departamento, publicación y mensaje. Su finalidad es permitir verificar las cuentas del tablero en Excel o Python. La base `deparent_demo_300.sqlite` se crea localmente y **no se incluye en el ZIP**. Ejecutar otra vez el generador no duplica las 300 cuentas y conserva los registros posteriores.

En una instalación real, no ejecuten este generador: las cuentas y acciones vienen de la base operativa. El panel distingue los usuarios marcados como simulados de los demás. Las publicaciones vigentes se agrupan por la fecha de su publicación actual; las cuentas, guardados, departamentos y mensajes se agrupan por la fecha registrada. No existe una medición de compras, pagos o alquileres cerrados.

Para quitar la demostración, detengan el servidor y eliminen **solo** el archivo local `deliveries/week10/data/deparent_demo_300.sqlite`. La base operativa y los archivos originales del equipo no se tocan.
