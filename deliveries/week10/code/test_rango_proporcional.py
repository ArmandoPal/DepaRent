"""Comprueba el cambio de rango con datos reservados y una captura posterior."""
import unittest

import joblib
import numpy as np
import pandas as pd

from modelo import ROOT, radio_prediccion


class RangoProporcionalTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.artifact = joblib.load(ROOT / "models/modelo_docente.joblib")

    def test_radio_crece_con_el_precio_y_conserva_el_piso(self):
        low = radio_prediccion(1500, self.artifact)
        middle = radio_prediccion(3000, self.artifact)
        high = radio_prediccion(8000, self.artifact)
        self.assertAlmostEqual(low, middle)
        self.assertGreater(high, middle)
        self.assertGreater(low, 0)

    def test_mejora_cobertura_alta_sin_perder_cobertura_global(self):
        data = pd.read_csv(ROOT / "resultados/validacion_noviembre/predicciones.csv")
        real = data["real_soles"].to_numpy(float)
        pred = data["prediccion_soles"].to_numpy(float)
        errors = np.abs(real - pred)
        fixed = errors <= self.artifact["radio_calibrado_soles"]
        adaptive = errors <= np.array([radio_prediccion(p, self.artifact) for p in pred])
        expensive = real >= 7000
        self.assertGreater(adaptive[expensive].mean(), fixed[expensive].mean())
        self.assertGreaterEqual(adaptive.mean(), fixed.mean())


if __name__ == "__main__":
    unittest.main()
