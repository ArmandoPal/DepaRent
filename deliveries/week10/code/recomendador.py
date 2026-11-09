"""Modelo 7: recomendación de departamentos según el perfil del inquilino.

Recomendación basada en contenido (no aprende de clics). El inquilino declara quién es y qué necesita;
cada departamento recibe un puntaje de compatibilidad de 0 a 100 que combina cuatro partes:

- Hogar (40%): qué tanto cumple lo que suele necesitar ese tipo de hogar (por ejemplo, una familia con hijos:
  3 dormitorios, más área, juegos infantiles, áreas verdes, seguridad y cochera).
- Prioridades (30%): lo que el inquilino marcó como más importante (precio, espacio, transporte,
  amenidades, seguridad).
- Cercanía (15%): distancia entre el lugar de trabajo o estudio y el centro del distrito del departamento.
  El mercado no guarda coordenadas exactas, así que es una aproximación por distrito.
- Precio (15%): cuánto pide frente al precio que estima el modelo 3 para sus características.

Si no se indica lugar de trabajo, su peso se reparte entre las otras partes. El presupuesto, los distritos,
el mínimo de dormitorios y las mascotas son filtros: lo que no los cumple no se recomienda. Cada
recomendación lleva sus motivos y lo que le falta, para que el puntaje se pueda explicar.
"""
import numpy as np
import pandas as pd

from modelo import normalizar

# Amenidades extra de mercado.csv (extraídas del texto del anuncio con reglas). Los departamentos publicados
# en DepaRent no las tienen: cuentan como no informadas (0).
EXTRAS = ["juegos_infantiles", "areas_verdes", "seguridad_24_7", "coworking", "parrilla", "vista_al_mar", "deposito"]
NOMBRES_AMENIDAD = {
    "ascensor": "ascensor", "balcon": "balcón", "terraza": "terraza", "piscina": "piscina", "gimnasio": "gimnasio",
    "pet_friendly": "admite mascotas", "juegos_infantiles": "juegos infantiles", "areas_verdes": "áreas verdes",
    "seguridad_24_7": "seguridad 24/7", "coworking": "coworking", "parrilla": "zona de parrilla",
    "vista_al_mar": "vista al mar", "deposito": "depósito",
}
AMENIDADES = list(NOMBRES_AMENIDAD)

PESOS = {"hogar": 0.40, "prioridades": 0.30, "cercania": 0.15, "precio": 0.15}
DISTANCIA_MAXIMA_KM = 12.0      # a esta distancia o más, la cercanía vale 0
PARADERO_IDEAL_M = 100.0        # a esta distancia o menos, el transporte vale 1
PARADERO_LIMITE_M = 800.0       # a esta distancia o más, el transporte vale 0
DESCUENTO_SOSPECHOSO = 35     # % por debajo del estimado desde el que se avisa que conviene revisar el anuncio
MAXIMO_POR_DISTRITO = 0.4       # en la lista final, a lo más 40% de un mismo distrito (si se eligieron varios o ninguno)
AVISO = ("Recomendaciones calculadas con lo que declaraste y con los anuncios del {captura}. Las amenidades se leen del "
         "texto de cada anuncio y pueden faltar; la cercanía se mide al centro del distrito, no a la dirección exacta.")


def _dormitorios(fila):
    n = int(fila["dormitorios"])
    return f"{n} dormitorio" if n == 1 else f"{n} dormitorios"


def _umbral(valor, minimo, maximo):
    """0 por debajo de minimo, 1 desde maximo, lineal entre ambos."""
    return float(np.clip((valor - minimo) / (maximo - minimo), 0, 1)) if pd.notna(valor) else 0.0


def _si(fila, columna):
    valor = fila.get(columna)
    return 1.0 if pd.notna(valor) and float(valor) >= 1 else 0.0


def _transporte(fila):
    d = fila.get("dist_paradero_min_m")
    if pd.isna(d):
        return 0.0
    return float(np.clip((PARADERO_LIMITE_M - d) / (PARADERO_LIMITE_M - PARADERO_IDEAL_M), 0, 1))


def _area_por_persona(fila):
    dormitorios = max(fila.get("dormitorios") or 1, 1)
    return _umbral(fila.get("area_total", np.nan) / dormitorios, 20, 40)


def _amenidades(fila):
    return min(sum(_si(fila, a) for a in AMENIDADES) / 5, 1.0)


def _valor_precio(fila):
    """1 si pide 20% o más por debajo del estimado, 0.5 si pide lo estimado, 0 si pide 20% o más por encima."""
    relacion = fila["precio_soles"] / fila["precio_estimado"]
    return float(np.clip(0.5 + (1 - relacion) * 2.5, 0, 1))


# Criterios de cada tipo de hogar: (peso, función que da 0..1, motivo si se cumple, qué falta si no).
HOGARES = {
    "familia": {
        "nombre": "Familia con hijos", "dormitorios_min": 2,
        "criterios": [
            (3, lambda f: _umbral(f["dormitorios"], 2, 3), _dormitorios, "menos de 3 dormitorios"),
            (2, lambda f: _umbral(f["area_total"], 70, 100), lambda f: f"{f['area_total']:.0f} m²", "menos de 100 m²"),
            (2, lambda f: _si(f, "juegos_infantiles"), lambda f: "juegos infantiles", "sin juegos infantiles"),
            (1, lambda f: _si(f, "areas_verdes"), lambda f: "áreas verdes", "sin áreas verdes"),
            (2, lambda f: _si(f, "seguridad_24_7"), lambda f: "seguridad 24/7", "sin seguridad 24/7"),
            (1, lambda f: _si(f, "estacionamientos"), lambda f: "cochera", "sin cochera"),
        ],
    },
    "pareja": {
        "nombre": "Pareja", "dormitorios_min": 1,
        "criterios": [
            (2, lambda f: 1.0 if f["dormitorios"] in (1, 2) else 0.3, _dormitorios, "más dormitorios de los que suele necesitar una pareja"),
            (2, lambda f: max(_si(f, "balcon"), _si(f, "terraza")), lambda f: "balcón o terraza", "sin balcón ni terraza"),
            (1, lambda f: _si(f, "gimnasio"), lambda f: "gimnasio", "sin gimnasio"),
            (1, lambda f: _si(f, "parrilla"), lambda f: "zona de parrilla", "sin zona de parrilla"),
            (1, lambda f: _umbral(f["area_total"], 45, 70), lambda f: f"{f['area_total']:.0f} m²", "menos de 70 m²"),
        ],
    },
    "estudiante": {
        "nombre": "Estudiante o joven profesional", "dormitorios_min": 1,
        "criterios": [
            (3, _transporte, lambda f: f"paradero a {f['dist_paradero_min_m']:.0f} m", "paradero lejano"),
            (2, lambda f: 1.0 if f["dormitorios"] <= 2 else 0.2, _dormitorios, "más grande de lo necesario"),
            (2, lambda f: _si(f, "coworking"), lambda f: "coworking", "sin coworking"),
            (1, lambda f: _si(f, "gimnasio"), lambda f: "gimnasio", "sin gimnasio"),
        ],
    },
    "mascota": {
        "nombre": "Con mascota", "dormitorios_min": 1, "exige": "pet_friendly",
        "criterios": [
            (3, lambda f: _si(f, "pet_friendly"), lambda f: "admite mascotas", "no indica que admita mascotas"),
            (2, lambda f: _si(f, "terraza"), lambda f: "terraza", "sin terraza"),
            (2, lambda f: _si(f, "areas_verdes"), lambda f: "áreas verdes", "sin áreas verdes"),
            (1, lambda f: _umbral(f["area_total"], 50, 80), lambda f: f"{f['area_total']:.0f} m²", "menos de 80 m²"),
        ],
    },
    "mayor": {
        "nombre": "Persona mayor", "dormitorios_min": 1,
        "criterios": [
            (3, lambda f: _si(f, "ascensor"), lambda f: "ascensor", "sin ascensor"),
            (2, _transporte, lambda f: f"paradero a {f['dist_paradero_min_m']:.0f} m", "paradero lejano"),
            (2, lambda f: _si(f, "seguridad_24_7"), lambda f: "seguridad 24/7", "sin seguridad 24/7"),
            (1, lambda f: 1.0 if f["dormitorios"] <= 2 else 0.5, _dormitorios, "más grande de lo necesario"),
        ],
    },
}

# Prioridades que el inquilino puede marcar: (función 0..1, motivo si se cumple).
PRIORIDADES = {
    "precio": (_valor_precio, None),   # su motivo sale de la comparación con el estimado
    "espacio": (_area_por_persona, lambda f: f"{f['area_total'] / max(f['dormitorios'] or 1, 1):.0f} m² por dormitorio"),
    "transporte": (_transporte, lambda f: f"paradero a {f['dist_paradero_min_m']:.0f} m"),
    "amenidades": (_amenidades, lambda f: f"{int(sum(_si(f, a) for a in AMENIDADES))} amenidades"),
    "seguridad": (lambda f: _si(f, "seguridad_24_7"), lambda f: "seguridad 24/7"),
}
NOMBRES_PRIORIDAD = {"precio": "Buen precio", "espacio": "Espacio", "transporte": "Transporte cercano",
                     "amenidades": "Amenidades", "seguridad": "Seguridad"}


def _km(lat1, lon1, lat2, lon2):
    """Distancia en km entre dos puntos (haversine)."""
    p1, p2 = np.radians(lat1), np.radians(lat2)
    a = np.sin((p2 - p1) / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(np.radians(lon2 - lon1) / 2) ** 2
    return float(6371.0 * 2 * np.arcsin(np.sqrt(a)))


def validar_perfil(perfil):
    hogar = perfil.get("hogar")
    if hogar not in HOGARES:
        raise ValueError(f"Tipo de hogar no válido: {hogar}. Opciones: {', '.join(HOGARES)}.")
    prioridades = list(dict.fromkeys(perfil.get("prioridades") or []))
    desconocidas = [p for p in prioridades if p not in PRIORIDADES]
    if desconocidas:
        raise ValueError(f"Prioridad no válida: {', '.join(desconocidas)}. Opciones: {', '.join(PRIORIDADES)}.")
    if len(prioridades) > 3:
        raise ValueError("Elige como máximo 3 prioridades.")
    presupuesto = perfil.get("presupuesto_max")
    if presupuesto is not None and not 300 <= float(presupuesto) <= 50000:
        raise ValueError("El presupuesto debe estar entre S/ 300 y S/ 50,000 al mes.")
    dormitorios = perfil.get("dormitorios_min")
    if dormitorios is not None and not 0 <= int(dormitorios) <= 6:
        raise ValueError("El mínimo de dormitorios debe estar entre 0 y 6.")
    return {**perfil, "prioridades": prioridades}


def candidatos(tabla, perfil):
    """Aplica los filtros duros del perfil."""
    mascara = pd.Series(True, index=tabla.index)
    if perfil.get("presupuesto_max") is not None:
        mascara &= tabla["precio_soles"] <= float(perfil["presupuesto_max"])
    distritos = [normalizar(d) for d in perfil.get("distritos") or []]
    if distritos:
        mascara &= tabla["distrito_norm"].isin(distritos)
    hogar = HOGARES[perfil["hogar"]]
    minimo = perfil.get("dormitorios_min")
    minimo = hogar["dormitorios_min"] if minimo is None else int(minimo)
    mascara &= tabla["dormitorios"].fillna(0) >= minimo
    if hogar.get("exige"):
        mascara &= tabla[hogar["exige"]].fillna(0) >= 1
    return tabla[mascara & tabla["precio_soles"].notna() & tabla["precio_estimado"].notna()]


def puntuar(fila, perfil, centros):
    """Puntaje 0..1 de un departamento para un perfil, con sus motivos y lo que le falta."""
    fila = {k: (v.item() if isinstance(v, np.generic) else v) for k, v in fila.items()}
    for columna in ("dormitorios", "area_total"):
        if pd.isna(fila.get(columna)):
            fila[columna] = 0
    hogar = HOGARES[perfil["hogar"]]
    partes, pesos, de_hogar, motivos, faltas = {}, dict(PESOS), [], [], []

    total = sum(p for p, *_ in hogar["criterios"])
    valor = 0.0
    for peso, funcion, motivo, falta in hogar["criterios"]:
        v = funcion(fila)
        valor += peso * v
        if v >= 0.99:
            de_hogar.append(motivo(fila))
        elif v < 0.5 and peso >= 2:
            faltas.append(falta)
    partes["hogar"] = valor / total

    if perfil["prioridades"]:
        valores = []
        for clave in perfil["prioridades"]:
            funcion, motivo = PRIORIDADES[clave]
            v = funcion(fila)
            valores.append(v)
            if motivo and v >= 0.8:
                motivos.append(motivo(fila))
        partes["prioridades"] = float(np.mean(valores))
    else:
        pesos.pop("prioridades")

    lugar = perfil.get("lugar")
    centro = centros.get(fila["distrito_norm"]) if lugar else None
    if lugar and centro:
        km = _km(lugar["latitud"], lugar["longitud"], *centro)
        partes["cercania"] = float(np.clip(1 - km / DISTANCIA_MAXIMA_KM, 0, 1))
        if km <= 4:
            motivos.append(f"distrito a {km:.1f} km de tu trabajo o estudio")
        elif km >= 8:
            faltas.append(f"distrito a {km:.0f} km de tu trabajo o estudio")
    else:
        pesos.pop("cercania")

    partes["precio"] = _valor_precio(fila)
    diferencia = 100 * (fila["precio_soles"] / fila["precio_estimado"] - 1)
    if diferencia <= -DESCUENTO_SOSPECHOSO:
        # El modelo sobreestima los departamentos baratos (week12/EvaluationReport.md §3.3): un descuento tan grande
        # puede ser error del estimado o un dato que el anuncio no informa. No suma más que un 20% por debajo.
        motivos.append(f"{-diferencia:.0f}% por debajo del estimado")
        faltas.append("precio muy por debajo del estimado: revisa el anuncio")
    elif diferencia <= -10:
        motivos.append(f"{-diferencia:.0f}% por debajo del estimado")
    elif diferencia >= 10:
        faltas.append(f"{diferencia:.0f}% por encima del estimado")

    puntaje = sum(pesos[k] * partes[k] for k in pesos) / sum(pesos.values())
    # Lo propio del perfil (prioridades, cercanía, precio) va primero; luego hasta 3 rasgos del hogar.
    # Orden: cercanía y prioridades, luego hasta 3 rasgos del hogar, y al final la comparación con el estimado.
    precio = [m for m in motivos if "del estimado" in m]
    otros = [m for m in dict.fromkeys(motivos) if m not in precio]
    motivos = otros[:3] + [m for m in dict.fromkeys(de_hogar) if m not in otros][:3] + precio
    return puntaje, partes, list(dict.fromkeys(motivos)), list(dict.fromkeys(faltas))


def _diversificar(ordenados, limite, maximo):
    """Toma los mejores respetando un máximo por distrito; si no alcanza, completa con el resto en orden."""
    elegidos, conteo, resto = [], {}, []
    for item in ordenados:
        d = item["fila"]["distrito_norm"]
        if conteo.get(d, 0) < maximo:
            elegidos.append(item)
            conteo[d] = conteo.get(d, 0) + 1
        else:
            resto.append(item)
        if len(elegidos) == limite:
            break
    else:
        elegidos += resto[: limite - len(elegidos)]
    return sorted(elegidos, key=lambda i: -i["puntaje"])


def _formato_minimo(fila):
    return {"id": fila["id"], "distrito": fila["distrito_norm"], "precio_soles": fila["precio_soles"]}


def _tarjeta(item, formatear=None):
    """Lo que ve el inquilino de una recomendación. El puntaje solo ordena; la app no lo muestra."""
    return {**(formatear or _formato_minimo)(item["fila"]), "compatibilidad": int(round(100 * item["puntaje"])),
            "partes": {k: round(v, 3) for k, v in item["partes"].items()},
            "motivos": item["motivos"][:6], "faltas": item["faltas"][:3],
            "amenidades_extra": [NOMBRES_AMENIDAD[a] for a in EXTRAS if _si(item["fila"], a)]}


def explicar(fila, perfil, centros, formatear=None):
    """La misma tarjeta de una recomendación para un solo anuncio (por ejemplo, al guardarlo)."""
    perfil = validar_perfil(perfil)
    puntaje, partes, motivos, faltas = puntuar(fila, perfil, centros)
    return _tarjeta({"fila": fila, "puntaje": puntaje, "partes": partes, "motivos": motivos, "faltas": faltas}, formatear)


def recomendar(tabla, perfil, centros, limite=12, formatear=None):
    """tabla: la misma tabla de la búsqueda (mercado + publicados). Devuelve los mejores con su explicación."""
    perfil = validar_perfil(perfil)
    filtrados = candidatos(tabla, perfil)
    items = []
    for fila in filtrados.to_dict("records"):
        puntaje, partes, motivos, faltas = puntuar(fila, perfil, centros)
        items.append({"fila": fila, "puntaje": puntaje, "partes": partes, "motivos": motivos, "faltas": faltas})
    # Desempate estable: a igual puntaje, el que pide menos frente a su estimado y luego el id.
    items.sort(key=lambda i: (-i["puntaje"], i["fila"]["precio_soles"] / i["fila"]["precio_estimado"], str(i["fila"]["id"])))
    varios = len(perfil.get("distritos") or []) != 1
    maximo = max(int(np.ceil(MAXIMO_POR_DISTRITO * limite)), 1) if varios else limite
    elegidos = _diversificar(items, limite, maximo)
    recomendaciones = [_tarjeta(i, formatear) for i in elegidos]
    return {
        "perfil": {"hogar": HOGARES[perfil["hogar"]]["nombre"], "prioridades": [NOMBRES_PRIORIDAD[p] for p in perfil["prioridades"]],
                   "presupuesto_max": perfil.get("presupuesto_max"), "distritos": perfil.get("distritos") or [],
                   "con_lugar": bool(perfil.get("lugar"))},
        "candidatos": int(len(filtrados)),
        "recomendaciones": recomendaciones,
    }
