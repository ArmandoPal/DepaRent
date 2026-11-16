"""Pruebas de la sección de analista: rol por correo, KPIs protegidos, precio propio y orden del perfil.

Usan una base SQLite temporal: no tocan data/deparent.sqlite.
"""
import os
import tempfile
import unittest
import uuid
from pathlib import Path
from unittest.mock import patch

_TEMPORAL = tempfile.TemporaryDirectory()
os.environ.setdefault("DEPARENT_DB", str(Path(_TEMPORAL.name) / "prueba.sqlite"))

from fastapi.testclient import TestClient  # noqa: E402

from api import app  # noqa: E402
import cuentas  # noqa: E402

VIVIENDA = {"distrito_norm": "lince", "area_total": 70, "dormitorios": 2, "banos": 2}


def _cuenta(cliente, prefijo="usuario"):
    email = f"{prefijo}-{uuid.uuid4().hex[:8]}@ejemplo.com"
    r = cliente.post("/api/cuentas/registro", json={"nombre": "Prueba", "email": email, "password": "clave-de-prueba-1"})
    return email, r.json(), {"Authorization": "Bearer " + r.json()["token"]}


class KpisAnalista(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cliente = TestClient(app)
        cls.email_analista = f"analista-{uuid.uuid4().hex[:8]}@ejemplo.com"
        os.environ["DEPARENT_ANALISTAS"] = f"otra@ejemplo.com, {cls.email_analista.upper()}"

    @classmethod
    def tearDownClass(cls):
        os.environ.pop("DEPARENT_ANALISTAS", None)

    def _analista(self):
        conexion = cuentas.conectar()
        try:
            if conexion.execute("SELECT id FROM usuarios WHERE email = ?", (self.email_analista,)).fetchone() is None:
                cuentas.registrar_analista(conexion, "Analista", self.email_analista, "clave-de-prueba-1")
        finally:
            conexion.close()
        r = self.cliente.post("/api/cuentas/ingreso", json={"email": self.email_analista, "password": "clave-de-prueba-1"})
        return r.json(), {"Authorization": "Bearer " + r.json()["token"]}

    def test_alta_publica_no_puede_reservar_correo_analista(self):
        email = f"reservado-{uuid.uuid4().hex[:8]}@ejemplo.com"
        autorizados = os.environ["DEPARENT_ANALISTAS"] + ", " + email.upper()
        with patch.dict(os.environ, {"DEPARENT_ANALISTAS": autorizados}):
            alta_publica = self.cliente.post("/api/cuentas/registro", json={
                "nombre": "Analista", "email": email, "password": "clave-de-prueba-1"})
            self.assertEqual(alta_publica.status_code, 422)
            conexion = cuentas.conectar()
            try:
                self.assertIsNone(conexion.execute("SELECT id FROM usuarios WHERE email = ?", (email,)).fetchone())
                cuentas.registrar_analista(conexion, "Analista", email, "clave-de-prueba-1")
            finally:
                conexion.close()
            ingreso = self.cliente.post("/api/cuentas/ingreso", json={"email": email, "password": "clave-de-prueba-1"})
            self.assertEqual(ingreso.status_code, 200)
            self.assertEqual(ingreso.json()["usuario"]["rol"], "analista")
            token_anterior = {"Authorization": "Bearer " + ingreso.json()["token"]}

            conexion = cuentas.conectar()
            try:
                cuentas.cambiar_clave_analista(conexion, email, "otra-clave-de-prueba-2")
            finally:
                conexion.close()
            self.assertEqual(self.cliente.get("/api/kpis", headers=token_anterior).status_code, 401)
            self.assertEqual(self.cliente.post("/api/cuentas/ingreso", json={
                "email": email, "password": "clave-de-prueba-1"}).status_code, 401)
            self.assertEqual(self.cliente.post("/api/cuentas/ingreso", json={
                "email": email, "password": "otra-clave-de-prueba-2"}).status_code, 200)

    def test_kpis_exigen_sesion_y_rol(self):
        self.assertEqual(self.cliente.get("/api/kpis").status_code, 401)
        _, cuerpo, cabecera = _cuenta(self.cliente)
        self.assertEqual(cuerpo["usuario"]["rol"], "usuario")
        self.assertEqual(self.cliente.get("/api/kpis", headers=cabecera).status_code, 403)

    def test_analista_ve_los_kpis(self):
        cuerpo, cabecera = self._analista()
        self.assertEqual(cuerpo["usuario"]["rol"], "analista")
        self.assertEqual(self.cliente.get("/api/cuentas/yo", headers=cabecera).json()["rol"], "analista")
        r = self.cliente.get("/api/kpis", headers=cabecera)
        self.assertEqual(r.status_code, 200)
        k = r.json()
        self.assertGreaterEqual(k["producto"]["usuarios"], 1)
        self.assertLess(k["modelo"]["prueba"]["modelo"]["mae_soles"], k["modelo"]["prueba"]["baseline_distrital"]["mae_soles"])
        self.assertTrue(k["modelo"]["validaciones"])
        self.assertGreater(k["datos"]["en_la_app"], 0)
        # Sin datos personales en los KPIs.
        self.assertNotIn("@", r.text)

    def test_publicar_a_precio_propio_y_cambiarlo(self):
        _, _, cabecera = _cuenta(self.cliente, "propietario")
        d = self.cliente.post("/api/departamentos", headers=cabecera, json={"nombre": "Depa prueba", "vivienda": VIVIENDA}).json()["departamento"]
        url = f"/api/departamentos/{d['id']}/publicacion"
        r = self.cliente.post(url, headers=cabecera, json={"precio_soles": 2345, "escenario": "Personalizado"})
        self.assertEqual(r.json()["publicacion"]["precio_soles"], 2345)
        r = self.cliente.post(url, headers=cabecera, json={"precio_soles": 2400, "escenario": "Personalizado"})
        self.assertEqual(r.json()["publicacion"]["precio_soles"], 2400)
        self.assertEqual(self.cliente.post(url, headers=cabecera, json={"precio_soles": 50}).status_code, 422)

    def test_propietario_no_se_escribe_a_si_mismo(self):
        email, _, cabecera = _cuenta(self.cliente, "dueno")
        d = self.cliente.post("/api/departamentos", headers=cabecera, json={"nombre": "Depa propio", "vivienda": VIVIENDA}).json()["departamento"]
        self.cliente.post(f"/api/departamentos/{d['id']}/publicacion", headers=cabecera, json={"precio_soles": 2300})
        ficha = f"/api/anuncios/d{d['id']}"
        self.assertTrue(self.cliente.get(ficha, headers=cabecera).json()["publicacion"]["es_mio"])
        publica = self.cliente.get(ficha).json()["publicacion"]
        self.assertFalse(publica["es_mio"])
        self.assertIsNone(publica["departamento_id"])
        mensaje = {"nombre": "Yo mismo", "email": "otro@ejemplo.com", "mensaje": "Hola, ¿sigue disponible?"}
        # Con su sesión, o sin sesión pero con su propio correo: rechazado.
        self.assertEqual(self.cliente.post(ficha + "/interes", headers=cabecera, json=mensaje).status_code, 422)
        self.assertEqual(self.cliente.post(ficha + "/interes", json={**mensaje, "email": email.upper()}).status_code, 422)
        # Otra persona sí puede escribir.
        _, _, otra = _cuenta(self.cliente, "inquilina")
        self.assertEqual(self.cliente.post(ficha + "/interes", headers=otra, json=mensaje).status_code, 200)
        interesados = self.cliente.get(f"/api/departamentos/{d['id']}", headers=cabecera).json()["departamento"]["interesados"]
        self.assertEqual(len(interesados), 1)

    def test_orden_del_perfil_se_guarda_y_se_valida(self):
        _, _, cabecera = _cuenta(self.cliente, "inquilino")
        perfil = {"hogar": "pareja", "presupuesto_max": 3000, "orden": "precio"}
        r = self.cliente.put("/api/perfil", headers=cabecera, json=perfil)
        self.assertEqual(r.json()["perfil"]["orden"], "precio")
        self.assertEqual(self.cliente.put("/api/perfil", headers=cabecera, json={**perfil, "orden": "otro"}).status_code, 422)
        self.assertEqual(self.cliente.post("/api/recomendar", json={**perfil, "limite": 5}).status_code, 200)

    def test_embudo_cuenta_solo_perfiles_y_publicaciones_activas(self):
        with tempfile.TemporaryDirectory() as temporal:
            conexion = cuentas.conectar(Path(temporal) / "embudo.sqlite")
            try:
                with conexion:
                    for i in (1, 2, 3):
                        conexion.execute("INSERT INTO usuarios (id, nombre, email, sal, hash, creado) VALUES (?, ?, ?, ?, ?, ?)",
                                         (i, f"Usuario {i}", f"u{i}@ejemplo.com", b"sal", b"hash", 1000))
                    for i in (1, 3):
                        conexion.execute("INSERT INTO perfiles_inquilino (usuario_id, perfil, actualizado) VALUES (?, ?, ?)",
                                         (i, '{}', 1000))
                    for i in (2, 3):
                        conexion.execute("INSERT INTO guardados (usuario_id, anuncio_id, datos, creado) VALUES (?, ?, ?, ?)",
                                         (i, f"m{i}", '{}', 1000))
                    for i, precio in ((1, 2500), (2, None)):
                        conexion.execute("INSERT INTO departamentos (id, usuario_id, nombre, vivienda, resumen, precio_publicado, "
                                         "publicado_en, creado, actualizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                         (i, 1, f"Depa {i}", '{}', '{"precio_estimado_soles": 2000}', precio,
                                          1000 if precio else None, 1000, 1000))
                        conexion.execute("INSERT INTO interesados (departamento_id, nombre, email, mensaje, creado) "
                                         "VALUES (?, ?, ?, ?, ?)", (i, "Consulta", "persona@ejemplo.com", "¿Disponible?", 1000))
                k = cuentas.kpis_producto(conexion, ahora=2000)
                self.assertEqual(k["usuarios_con_guardados"], 2)
                self.assertEqual(k["usuarios_con_perfil_y_guardados"], 1)
                self.assertEqual(k["tasa_perfil_a_guardado_porcentaje"], 50.0)
                self.assertEqual(k["mensajes_interesados"], 2)
                self.assertEqual(k["departamentos_publicados"], 1)
                self.assertEqual(k["publicados_con_interes"], 1)
                self.assertEqual(k["tasa_publicado_con_interes_porcentaje"], 100.0)
                conexion.execute("UPDATE departamentos SET publicado_en = 1500 WHERE id = 1")
                k = cuentas.kpis_producto(conexion, ahora=2000)
                self.assertEqual(k["mensajes_interesados"], 2)
                self.assertEqual(k["publicados_con_interes"], 0)
                self.assertEqual(k["tasa_publicado_con_interes_porcentaje"], 0.0)
            finally:
                conexion.close()


if __name__ == "__main__":
    unittest.main()
