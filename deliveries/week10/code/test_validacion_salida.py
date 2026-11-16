"""La validación de una nueva captura no debe borrar evaluaciones anteriores."""
import json
import tempfile
import unittest
from pathlib import Path

from validar_octubre import salida_para_captura


class SalidaValidacion(unittest.TestCase):
    def test_conserva_la_captura_anterior_y_reusa_la_misma(self):
        with tempfile.TemporaryDirectory() as temporal:
            resultados = Path(temporal)
            anterior = resultados / "validacion_noviembre"
            anterior.mkdir()
            (anterior / "metricas.json").write_text(json.dumps({"captura": "2026-11-09"}), encoding="utf-8")

            self.assertEqual(salida_para_captura("2026-11-09", resultados), anterior)
            siguiente = salida_para_captura("2026-11-14", resultados)
            self.assertEqual(siguiente.name, "validacion_2026_11_14")
            self.assertNotEqual(siguiente, anterior)
            self.assertEqual(salida_para_captura("2026-12-01", resultados).name, "validacion_2026_12_01")


if __name__ == "__main__":
    unittest.main()
