"""La base demo no toca producción y los nuevos registros se ven aparte en el tablero."""
import os
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import api
import cuentas
from crear_demo_300 import CORREO_ANALISTA, crear_demo_300


class Demo300(unittest.TestCase):
    def test_300_mas_un_usuario_y_repeticion_sin_duplicar(self):
        with tempfile.TemporaryDirectory() as carpeta, patch.dict(
            os.environ, {"DEPARENT_ANALISTAS": CORREO_ANALISTA}
        ):
            base = Path(carpeta) / "deparent_demo_prueba.sqlite"
            csv = Path(carpeta) / "usuarios_300.csv"
            ahora = time.time()
            primero = crear_demo_300(base, ahora=ahora, csv_salida=csv)
            self.assertEqual(primero["usuarios_simulados"], 300)
            self.assertEqual(primero["usuarios_reales"], 0)
            self.assertEqual(len(csv.read_text(encoding="utf-8-sig").splitlines()), 301)

            conexion = cuentas.conectar(base)
            try:
                self.assertEqual(len(cuentas.publicados(conexion)), 0)
                id_publicado = conexion.execute(
                    "SELECT id FROM departamentos WHERE precio_publicado IS NOT NULL LIMIT 1"
                ).fetchone()["id"]
                with self.assertRaises(cuentas.NoEncontrado):
                    cuentas.publicado(conexion, id_publicado)
                cuentas.cambiar_clave_analista(conexion, CORREO_ANALISTA, "clave-demo-de-prueba")
            finally:
                conexion.close()

            def base_temporal():
                c = cuentas.conectar(base)
                try:
                    yield c
                finally:
                    c.close()

            api.app.dependency_overrides[api.base_datos] = base_temporal
            try:
                cliente = TestClient(api.app)
                self.assertEqual(cliente.get("/api/kpis").status_code, 401)
                ingreso = cliente.post("/api/cuentas/ingreso", json={
                    "email": CORREO_ANALISTA, "password": "clave-demo-de-prueba"})
                self.assertEqual(ingreso.status_code, 200)
                cabecera = {"Authorization": "Bearer " + ingreso.json()["token"]}
                antes = cliente.get("/api/kpis", headers=cabecera)
                self.assertEqual(antes.status_code, 200)
                producto = antes.json()["producto"]
                self.assertEqual(producto["usuarios"], 300)
                self.assertEqual(producto["simulacion"]["usuarios_simulados"], 300)
                self.assertEqual(producto["simulacion"]["usuarios_reales"], 0)
                self.assertEqual(len(producto["actividad_diaria"]), 30)
                self.assertEqual(sum(x["cuentas_simuladas"] for x in producto["actividad_diaria"]), 300)
                self.assertEqual(sum(x["departamentos"] for x in producto["distritos_publicados"]), 25)
                self.assertNotIn("@", antes.text)
                self.assertEqual(cliente.get(f"/api/anuncios/d{id_publicado}").status_code, 404)

                registro = cliente.post("/api/cuentas/registro", json={
                    "nombre": "Usuario nuevo", "email": "nuevo@ejemplo.test", "password": "clave-nueva-de-prueba"})
                self.assertEqual(registro.status_code, 200)
                normal = {"Authorization": "Bearer " + registro.json()["token"]}
                self.assertEqual(cliente.get("/api/kpis", headers=normal).status_code, 403)
                despues = cliente.get("/api/kpis", headers=cabecera).json()["producto"]
                self.assertEqual(despues["usuarios"], 301)
                self.assertEqual(despues["simulacion"]["usuarios_simulados"], 300)
                self.assertEqual(despues["simulacion"]["usuarios_reales"], 1)
                self.assertEqual(despues["actividad_diaria"][-1]["cuentas_reales"], 1)
            finally:
                api.app.dependency_overrides.pop(api.base_datos, None)

            repetido = crear_demo_300(base, ahora=ahora, csv_salida=csv)
            self.assertEqual(repetido["usuarios_simulados"], 300)
            self.assertEqual(repetido["usuarios_reales"], 1)
            self.assertEqual(len(csv.read_text(encoding="utf-8-sig").splitlines()), 301)


if __name__ == "__main__":
    unittest.main()
