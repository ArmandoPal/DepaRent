"""Pruebas del modelo 7 (recomendación según el perfil del inquilino) y de POST /api/recomendar."""
import unittest
import warnings
from collections import Counter

warnings.filterwarnings("ignore")

from fastapi.testclient import TestClient  # noqa: E402

from api import MERCADO, app  # noqa: E402
from recomendador import HOGARES, puntuar, validar_perfil  # noqa: E402

TRABAJO_CENTRO = {"latitud": -12.0975, "longitud": -77.0365}   # cerca del límite Lince / San Isidro


class Recomendador(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cliente = TestClient(app)

    def pedir(self, **perfil):
        respuesta = self.cliente.post("/api/recomendar", json=perfil)
        self.assertEqual(respuesta.status_code, 200, respuesta.text)
        return respuesta.json()

    def test_filtros_duros_se_cumplen_en_todas_las_recomendaciones(self):
        d = self.pedir(hogar="familia", presupuesto_max=3000, distritos=["surco", "san borja"], dormitorios_min=3, limite=30)
        self.assertGreater(len(d["recomendaciones"]), 0)
        for r in d["recomendaciones"]:
            self.assertLessEqual(r["precio_soles"], 3000)
            self.assertIn(r["distrito"], {"surco", "san borja"})
            self.assertGreaterEqual(r["dormitorios"], 3)

    def test_con_mascota_solo_recomienda_los_que_las_admiten(self):
        d = self.pedir(hogar="mascota", presupuesto_max=4000, limite=30)
        self.assertTrue(all("pet_friendly" in r["amenidades"] for r in d["recomendaciones"]))

    def test_orden_por_compatibilidad_y_rango_valido(self):
        d = self.pedir(hogar="pareja", presupuesto_max=3000, prioridades=["amenidades", "precio"], limite=20)
        valores = [r["compatibilidad"] for r in d["recomendaciones"]]
        self.assertEqual(valores, sorted(valores, reverse=True))
        self.assertTrue(all(0 <= v <= 100 for v in valores))
        self.assertTrue(all(r["motivos"] for r in d["recomendaciones"][:5]))

    def test_cada_hogar_recibe_departamentos_distintos(self):
        familia = self.pedir(hogar="familia", presupuesto_max=3500, limite=10)["recomendaciones"]
        estudiante = self.pedir(hogar="estudiante", presupuesto_max=3500, limite=10)["recomendaciones"]
        media = lambda rs, c: sum(r[c] for r in rs) / len(rs)  # noqa: E731
        self.assertGreater(media(familia, "dormitorios"), media(estudiante, "dormitorios"))
        self.assertLess(len({r["id"] for r in familia} & {r["id"] for r in estudiante}), 3)

    def test_el_lugar_de_trabajo_acerca_las_recomendaciones(self):
        sin = self.pedir(hogar="pareja", presupuesto_max=3000, limite=12)["recomendaciones"]
        con = self.pedir(hogar="pareja", presupuesto_max=3000, lugar=TRABAJO_CENTRO, limite=12)["recomendaciones"]
        lejos = {"ate", "comas", "los olivos", "san martin de porres", "callao", "otros", "la molina", "chorrillos"}
        self.assertLessEqual(sum(r["distrito"] in lejos for r in con), sum(r["distrito"] in lejos for r in sin))
        self.assertTrue(any("km de tu trabajo" in m for r in con for m in r["motivos"]))

    def test_no_concentra_un_solo_distrito(self):
        d = self.pedir(hogar="mayor", presupuesto_max=5000, limite=10)
        self.assertLessEqual(max(Counter(r["distrito"] for r in d["recomendaciones"]).values()), 4)

    def test_es_determinista_y_sin_datos_privados(self):
        a = self.pedir(hogar="estudiante", presupuesto_max=2000, prioridades=["transporte"], limite=10)
        b = self.pedir(hogar="estudiante", presupuesto_max=2000, prioridades=["transporte"], limite=10)
        self.assertEqual([r["id"] for r in a["recomendaciones"]], [r["id"] for r in b["recomendaciones"]])
        for r in a["recomendaciones"]:
            self.assertFalse({"url", "fuente", "fecha_scraping", "latitud", "longitud", "direccion"} & set(r))

    def test_entradas_invalidas_dan_422_con_mensaje(self):
        for perfil, texto in (({"hogar": "robot"}, "hogar"), ({"hogar": "familia", "prioridades": ["vista"]}, "Prioridad"),
                              ({"hogar": "familia", "presupuesto_max": 50}, "presupuesto"),
                              ({"hogar": "familia", "prioridades": ["precio", "espacio", "transporte", "seguridad"]}, "máximo"),
                              ({"hogar": "familia", "lugar": {"latitud": -13.0, "longitud": -77.0}}, "latitud")):
            respuesta = self.cliente.post("/api/recomendar", json=perfil)
            self.assertEqual(respuesta.status_code, 422, perfil)
            self.assertIn(texto, respuesta.json()["detail"])

    def test_sin_candidatos_devuelve_lista_vacia(self):
        d = self.pedir(hogar="familia", presupuesto_max=300, limite=10)
        self.assertEqual(d["candidatos"], 0)
        self.assertEqual(d["recomendaciones"], [])

    def test_puntaje_premia_lo_que_necesita_el_hogar(self):
        base = MERCADO.iloc[0].to_dict()
        ideal = {**base, "dormitorios": 3, "area_total": 110, "juegos_infantiles": 1, "areas_verdes": 1, "seguridad_24_7": 1,
                 "estacionamientos": 1, "precio_soles": base["precio_estimado"]}
        pobre = {**ideal, "dormitorios": 1, "area_total": 40, "juegos_infantiles": 0, "areas_verdes": 0, "seguridad_24_7": 0,
                 "estacionamientos": 0}
        perfil = validar_perfil({"hogar": "familia"})
        self.assertGreater(puntuar(ideal, perfil, {})[0], puntuar(pobre, perfil, {})[0] + 0.3)

    def test_opciones_publican_hogares_y_prioridades(self):
        op = self.cliente.get("/api/opciones").json()["recomendador"]
        self.assertEqual(set(op["hogares"]), set(HOGARES))
        self.assertIn("transporte", op["prioridades"])


if __name__ == "__main__":
    unittest.main()
