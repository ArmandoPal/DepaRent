"""Crea o actualiza una cuenta de análisis sin pasar la clave por la web ni por argumentos."""
import argparse
import getpass

import cuentas


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True, help="Correo incluido en DEPARENT_ANALISTAS")
    parser.add_argument("--nombre", help="Nombre de la persona; obligatorio al crear la cuenta")
    parser.add_argument("--cambiar-clave", action="store_true", help="Actualiza una cuenta existente y cierra sus sesiones")
    args = parser.parse_args()

    email = args.email.strip().lower()
    if not cuentas.es_analista(email):
        parser.error("El correo no está incluido en DEPARENT_ANALISTAS.")
    if not args.cambiar_clave and not args.nombre:
        parser.error("Indica --nombre para crear la cuenta.")

    clave = getpass.getpass("Nueva contraseña (mínimo 8 caracteres): ")
    confirmacion = getpass.getpass("Repite la contraseña: ")
    if clave != confirmacion:
        parser.error("Las contraseñas no coinciden.")

    conexion = cuentas.conectar()
    try:
        if args.cambiar_clave:
            cuentas.cambiar_clave_analista(conexion, email, clave)
            print("Contraseña actualizada. Las sesiones anteriores quedaron cerradas.")
        else:
            cuentas.registrar_analista(conexion, args.nombre, email, clave)
            print("Cuenta de análisis creada. Ya puede ingresar desde la aplicación.")
    except (cuentas.DatosInvalidos, cuentas.NoEncontrado) as error:
        parser.exit(1, f"No se completó el cambio: {error}\n")
    finally:
        conexion.close()


if __name__ == "__main__":
    main()
