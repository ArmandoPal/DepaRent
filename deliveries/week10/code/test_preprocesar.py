"""El preprocesamiento en módulo reproduce exactamente los datos procesados de la Semana 7.

Es la garantía de que una captura nueva (por ejemplo, la de octubre) se procesa igual que la de entrenamiento.
"""
import unittest

import joblib
import numpy as np
import pandas as pd

from modelo import ROOT, SOURCE, preparar
from preprocesar import procesar

COLUMNAS = ["precio_soles", "area_total", "dormitorios", "banos", "estacionamientos", "antiguedad", "mantenimiento",
            "ascensor", "balcon", "terraza", "piscina", "gimnasio", "pet_friendly", "piso", "precio_m2_real"]


class PreprocesarTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.crudo = pd.read_csv(ROOT.parent / "week04/data/departamentos_alquiler_lima.csv")
        cls.referencia = pd.read_csv(SOURCE, low_memory=False)
        cls.artefacto = joblib.load(ROOT / "models/modelo_docente.joblib")

    def _comparar(self, nuevo):
        self.assertEqual(list(nuevo["id_anuncio"].astype(str)), list(self.referencia["id_anuncio"].astype(str)))
        for col in COLUMNAS:
            self.assertTrue(np.allclose(nuevo[col].astype(float), self.referencia[col].astype(float), equal_nan=True), col)
        self.assertTrue((nuevo["distrito_norm"].str.lower() == self.referencia["distrito_norm"].str.lower()).all())
        self.assertTrue(np.allclose(self.artefacto["pipeline"].predict(preparar(nuevo)),
                                    self.artefacto["pipeline"].predict(preparar(self.referencia))))

    def test_reproduce_septiembre_con_el_umbral_de_otros(self):
        self._comparar(procesar(self.crudo))

    def test_reproduce_septiembre_con_los_distritos_del_modelo(self):
        # El modo que se usa con capturas nuevas: los distritos fuera del entrenamiento van a "Otros".
        self._comparar(procesar(self.crudo, distritos_conocidos=self.artefacto["distritos"]))

    def test_alias_de_portal_solo_en_capturas_nuevas(self):
        fila = self.crudo.iloc[[0]].copy()
        fila[["precio_soles", "area_total", "latitud", "longitud"]] = [2000, 60, -12.1, -77.0]
        for nombre, esperado in (("Lima Cercado", "Lima"), ("Ate Vitarte", "Ate"), ("Magdalena Vieja", "Pueblo Libre")):
            fila["distrito"] = nombre
            nuevo = procesar(fila, distritos_conocidos=self.artefacto["distritos"], alias_portal=True)
            self.assertEqual(nuevo.loc[0, "distrito_norm"], esperado)
        # Sin alias (como en el entrenamiento), Magdalena Vieja no es un distrito del modelo: va a "Otros".
        self.assertEqual(procesar(fila, distritos_conocidos=self.artefacto["distritos"]).loc[0, "distrito_norm"], "Otros")

    def test_negaciones_de_mascotas_en_capturas_nuevas(self):
        fila = self.crudo.iloc[[0]].copy()
        fila[["precio_soles", "area_total", "latitud", "longitud"]] = [2000, 60, -12.1, -77.0]
        fila[["titulo", "caracteristicas"]] = ["Depa", ""]
        for col in ("pet_friendly", "texto_amenidades_crudo"):
            fila = fila.drop(columns=col, errors="ignore")
        fila["pet_friendly"] = float("nan")
        casos = {
            # Textos reales de la captura del 9-nov: el portal pega las palabras.
            "bicicletas- no Mascotasdistribución: - cocina": 0,
            "1 mes de adelantono mascotas.": 0,
            "no aceptan mascotaseste departamento es ideal": 0,
            "no se permiten fumadores, ni mascotas.": 0,
            "- no apto para mascotas. - áreas comunes": 0,
            "no está permitido las mascotas.": 0,
            "juego de niñosno pet friendlyno estacionamiento": 0,
            # Los que sí admiten, aunque tengan un "no" cerca.
            "se permite mascotas (no gatos) con depósito": 1,
            "se permiten mascotas tranquilas no cachorros": 1,
            "no cuenta con cochera, tus mascotas son bienvenidas": 1,
            "edificio pet friendly con piscina": 1,
        }
        for texto, esperado in casos.items():
            fila["descripcion"] = texto
            nuevo = procesar(fila, distritos_conocidos=self.artefacto["distritos"], negaciones_estrictas=True)
            self.assertEqual(nuevo.loc[0, "pet_friendly"], esperado, texto)

    def test_un_distrito_desconocido_va_a_otros(self):
        fila = self.crudo.iloc[[0]].copy()
        fila["distrito"] = "Pachacámac"
        fila[["precio_soles", "area_total", "latitud", "longitud"]] = [2000, 60, -12.1, -77.0]
        procesado = procesar(fila, distritos_conocidos=self.artefacto["distritos"])
        self.assertEqual(procesado.loc[0, "distrito_norm"], "Otros")


if __name__ == "__main__":
    unittest.main(verbosity=2)
