"""Pruebas de la cuenta como inquilino: perfil de búsqueda (cuestionario) y departamentos guardados.

Usan una base SQLite temporal: no tocan data/deparent.sqlite.
"""
import os
import tempfile
import unittest
import uuid
from pathlib import Path

_TEMPORAL = tempfile.TemporaryDirectory()
os.environ.setdefault("DEPARENT_DB", str(Path(_TEMPORAL.name) / "prueba.sqlite"))

from fastapi.testclient import TestClient  # noqa: E402

from api import MERCADO, app  # noqa: E402

PERFIL = {"hogar": "familia", "presupuesto_max": 3500, "prioridades": ["seguridad"], "distritos": [],
          "lugar": {"latitud": -12.0975, "longitud": -77.0365}, "lugar_nombre": "Av. Javier Prado, San Isidro"}


def _cuenta(cliente):
    email = f"inquilino-{uuid.uuid4().hex[:8]}@ejemplo.com"
    r = cliente.post("/api/cuentas/registro", json={"nombre": "Inquilino Prueba", "email": email, "password": "clave-de-prueba-1"})
    return {"Authorization": "Bearer " + r.json()["token"]}


class CuentaInquilino(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cliente = TestClient(app)
        cls.anuncio = str(MERCADO["id"].iloc[0])

    def test_perfil_y_guardados_exigen_sesion(self):
        for metodo, ruta in (("get", "/api/perfil"), ("put", "/api/perfil"), ("get", "/api/guardados"),
                             ("post", f"/api/guardados/{self.anuncio}"), ("delete", f"/api/guardados/{self.anuncio}")):
            r = getattr(self.cliente, metodo)(ruta, **({"json": PERFIL} if metodo == "put" else {}))
            self.assertEqual(r.status_code, 401, ruta)

    def test_cuenta_nueva_sin_perfil_y_luego_lo_guarda(self):
        h = _cuenta(self.cliente)
        inicio = self.cliente.get("/api/perfil", headers=h).json()
        self.assertIsNone(inicio["perfil"])
        self.assertEqual(inicio["usuario"]["nombre"], "Inquilino Prueba")
        guardado = self.cliente.put("/api/perfil", json=PERFIL, headers=h)
        self.assertEqual(guardado.status_code, 200, guardado.text)
        perfil = self.cliente.get("/api/perfil", headers=h).json()["perfil"]
        self.assertEqual(perfil["hogar"], "familia")
        self.assertEqual(perfil["lugar_nombre"], PERFIL["lugar_nombre"])
        self.assertEqual(perfil["prioridades"], ["seguridad"])
        # Editarlo lo reemplaza.
        self.cliente.put("/api/perfil", json={**PERFIL, "hogar": "pareja", "prioridades": []}, headers=h)
        self.assertEqual(self.cliente.get("/api/perfil", headers=h).json()["perfil"]["hogar"], "pareja")

    def test_perfil_invalido_no_se_guarda(self):
        h = _cuenta(self.cliente)
        for malo in ({**PERFIL, "hogar": "robot"}, {**PERFIL, "presupuesto_max": 10},
                     {**PERFIL, "lugar": {"latitud": -13.5, "longitud": -77.0}}):
            self.assertEqual(self.cliente.put("/api/perfil", json=malo, headers=h).status_code, 422)
        self.assertIsNone(self.cliente.get("/api/perfil", headers=h).json()["perfil"])

    def test_guardar_listar_y_quitar(self):
        h = _cuenta(self.cliente)
        self.cliente.put("/api/perfil", json=PERFIL, headers=h)
        lista = self.cliente.post(f"/api/guardados/{self.anuncio}", headers=h).json()
        self.assertEqual([g["id"] for g in lista], [self.anuncio])
        self.assertIn("motivos", lista[0])
        self.assertIn("precio_soles", lista[0])
        self.assertFalse({"url", "fuente", "fecha_scraping"} & set(lista[0]))
        # Guardar dos veces no lo duplica.
        self.assertEqual(len(self.cliente.post(f"/api/guardados/{self.anuncio}", headers=h).json()), 1)
        self.assertEqual(self.cliente.delete(f"/api/guardados/{self.anuncio}", headers=h).json(), [])

    def test_guardados_no_se_ven_entre_cuentas(self):
        a, b = _cuenta(self.cliente), _cuenta(self.cliente)
        self.cliente.post(f"/api/guardados/{self.anuncio}", headers=a)
        self.assertEqual(self.cliente.get("/api/guardados", headers=b).json(), [])
        self.cliente.delete(f"/api/guardados/{self.anuncio}", headers=b)
        self.assertEqual(len(self.cliente.get("/api/guardados", headers=a).json()), 1)

    def test_anuncio_invalido_o_inexistente_da_404(self):
        h = _cuenta(self.cliente)
        for anuncio in ("x123", "m99999999999", "m1;DROP"):
            self.assertEqual(self.cliente.post(f"/api/guardados/{anuncio}", headers=h).status_code, 404, anuncio)


if __name__ == "__main__":
    unittest.main()
