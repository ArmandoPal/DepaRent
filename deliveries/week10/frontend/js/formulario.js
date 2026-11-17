import { llamar } from "./api.js";
import { ICONO_CAMPO, icono } from "./iconos.js";
import { $, $$, conBoton, esc, mensaje, titulo } from "./util.js";

const GRUPOS = [
  ["Tamaño", "Lo que más pesa en el precio.", ["area_total", "dormitorios", "banos", "estacionamientos"]],
  ["Edificio", "Si no lo sabes, déjalo vacío: el modelo usa la mediana de los anuncios.", ["antiguedad", "mantenimiento"]],
];

/* Formulario por pasos (pruebas con propietarios P5 y P6: el formulario largo confundía).
   Cada paso: [id, título, icono, una línea de ayuda, grupos que contiene]. */
const PASOS = [
  ["ubicacion", "¿Dónde está?", "ubicacion", "Elige el distrito. La dirección es opcional: afina la cercanía al transporte.", ["departamento", "ubicacion"]],
  ["tamano", "¿Cómo es?", "tamano", "Área, dormitorios y baños son obligatorios.", ["tamano"]],
  ["extras", "Edificio y extras", "edificio", "Si no sabes un dato, déjalo en «No sé».", ["edificio", "amenidades"]],
  ["precio", "Tu precio", "moneda", "Si lo dejas vacío, te mostramos tres precios para elegir.", ["publicacion"], true],
];

/**
 * Formulario de características del departamento, con la forma de una pantalla de ajustes.
 * opciones: datos de /api/opciones · conNombre: pide un nombre (propietario) · conDemos: casos de ejemplo
 * conMapa: mapa para elegir la ubicación con un clic · compacto: etiquetas sobre los campos (para paneles angostos).
 * conPrecio: campo opcional con el precio al que el propietario quiere publicar.
 * pasos: muestra un paso a la vez (ubicación → tamaño → edificio y extras → precio) con Atrás y Siguiente.
 * Devuelve { leer, cargar, ... }.
 */
export function formularioVivienda(contenedor, opciones, { conNombre = false, conDemos = false, conMapa = false, conPrecio = false, compacto = false, pasos = false, textoBoton = "Analizar", secundario = "" } = {}) {
  const etiqueta = (campo) => `${ICONO_CAMPO[campo] ? icono(ICONO_CAMPO[campo], "icono-campo") : ""}${esc(opciones.etiquetas[campo])}`;
  const numerico = (campo) => {
    const [min, max] = opciones.limites[campo];
    const obligatorio = ["area_total", "dormitorios", "banos"].includes(campo);
    return `<div class="field"><label for="f-${campo}">${etiqueta(campo)}</label>
      <input class="input num" id="f-${campo}" name="${campo}" type="number" inputmode="numeric" min="${min}" max="${max}" step="1" ${obligatorio ? "required" : 'placeholder="No sé"'}></div>`;
  };
  const amenidad = (campo) => `<div class="field"><label for="f-${campo}">${esc(opciones.etiquetas[campo])}</label>
    <select class="input" id="f-${campo}" name="${campo}"><option value="0">No</option><option value="1">Sí</option><option value="">No sé</option></select></div>`;
  const grupo = (id, nombre, ayuda, cuerpo) => `<section class="form-group" data-grupo="${id}"><div><h2>${nombre}</h2>${ayuda ? `<p class="hint">${ayuda}</p>` : ""}</div><div class="fields">${cuerpo}</div></section>`;
  const html = {
    departamento: grupo("departamento", "Departamento", conDemos ? "Empieza desde un ejemplo y cámbialo." : "", `
          ${conDemos ? `<div class="field wide"><label for="f-demo">Caso de ejemplo</label><select class="input" id="f-demo" name="demo">${opciones.demos.map((d, i) => `<option value="${i}">${esc(d.nombre)}</option>`).join("")}</select></div>` : ""}
          ${conNombre ? '<div class="field wide"><label for="f-nombre">Nombre</label><input class="input" id="f-nombre" name="nombre" maxlength="80" placeholder="Depa de Lince, piso 5" required></div>' : ""}
          <div class="field wide"><label for="f-distrito">Distrito</label><select class="input" id="f-distrito" name="distrito_norm" required>
            ${opciones.distritos.map((d) => `<option value="${esc(d)}">${esc(titulo(d))}</option>`).join("")}</select></div>`),
    tamano: grupo("tamano", GRUPOS[0][0], GRUPOS[0][1], GRUPOS[0][2].map(numerico).join("")),
    edificio: grupo("edificio", GRUPOS[1][0], GRUPOS[1][1], GRUPOS[1][2].map(numerico).join("")),
    amenidades: grupo("amenidades", "Amenidades", "Las que el anuncio diría.", opciones.binarias.map(amenidad).join("")),
    ubicacion: grupo("ubicacion", "Ubicación", conMapa ? "Opcional. Busca la dirección, haz clic en el mapa o escribe las coordenadas; si no marcas nada usamos el centro del distrito."
      : "Opcional. Busca la dirección o escribe las coordenadas; sin ellas usamos el centro del distrito.", `
          <div class="field wide">
            <label for="f-direccion">Buscar dirección</label>
            <div class="search-row"><input class="input" id="f-direccion" type="search" autocomplete="off" placeholder="Por ejemplo: Av. Arequipa, Lince · o -12.0464, -77.0428">
              <button type="button" class="btn" data-buscar>Buscar</button></div>
            <ul class="dir-results" hidden></ul>
            <p class="hint" data-dir-msg aria-live="polite"></p>
          </div>
          ${conMapa ? '<div class="field wide"><div class="map map-picker" aria-label="Mapa para elegir la ubicación"></div></div>' : ""}
          <div class="field"><label for="f-latitud">Latitud</label><input class="input num" id="f-latitud" name="latitud" type="number" step="0.000001" placeholder="-12.088"></div>
          <div class="field"><label for="f-longitud">Longitud</label><input class="input num" id="f-longitud" name="longitud" type="number" step="0.000001" placeholder="-77.034"></div>`),
    publicacion: conPrecio ? grupo("publicacion", "Publicación", "Opcional. Si ya sabes a cuánto quieres alquilarlo, escríbelo y lo publicamos a ese precio. Si lo dejas vacío, primero ves el precio esperado y decides después.", `
          <div class="field wide"><label for="f-precio">Precio al que quiero publicarlo (S/ al mes)</label>
            <input class="input num" id="f-precio" name="precio_publicar" type="number" inputmode="numeric" min="300" max="50000" step="10" placeholder="Por ejemplo 2500"></div>`) : "",
  };
  const listaPasos = PASOS.filter(([id]) => id !== "precio" || conPrecio);
  // En pasos, cada paso muestra su título grande; los títulos de los grupos sobran.
  const cuerpo = pasos
    ? `<ol class="pasos" aria-label="Pasos">${listaPasos.map(([id, nombre, ic], i) => `<li>
          <button type="button" class="paso-chip" data-ir-paso="${i}">${icono(ic)}<span><small>Paso ${i + 1}</small>${esc(nombre)}</span></button></li>`).join("")}</ol>
        ${listaPasos.map(([id, nombre, ic, ayuda, grupos, opcional], i) => `<section class="paso" data-paso="${i}" aria-labelledby="paso-t-${id}" ${i ? "hidden" : ""}>
          <div class="paso-cabecera">${icono(ic, "icono-paso")}<div><h2 id="paso-t-${id}" tabindex="-1">${esc(nombre)}${opcional ? ' <span class="etiqueta-opcional">Opcional</span>' : ""}</h2><p class="hint">${esc(ayuda)}</p></div></div>
          <div class="form-groups">${grupos.map((g) => html[g]).join("")}</div></section>`).join("")}`
    : `<div class="form-groups">${["departamento", "tamano", "edificio", "amenidades", "ubicacion", "publicacion"].map((g) => html[g]).join("")}</div>`;
  contenedor.innerHTML = `
    <form class="vivienda-form ${compacto ? "compact" : ""} ${pasos ? "por-pasos" : ""}" novalidate>
      ${cuerpo}
      <div class="form-actions">${pasos ? '<button type="button" class="btn" data-atras hidden>Atrás</button><span class="paso-cuenta hint" aria-live="polite"></span>' : ""}${secundario}
        ${pasos ? `<button type="button" class="btn primary" data-siguiente>Siguiente ${icono("flecha", "icono-btn")}</button>` : ""}
        <button type="submit" class="btn primary" ${pasos ? "hidden" : ""}>${esc(textoBoton)}</button></div>
      <div class="form-msg" role="alert"></div>
    </form>`;
  const form = $("form", contenedor);
  const campo = (nombre) => form.elements.namedItem(nombre);

  function cargar(vivienda, ubicacion = null, nombre = null) {
    for (const [clave, valor] of Object.entries(vivienda)) {
      if (campo(clave)) campo(clave).value = valor == null ? "" : valor;
    }
    campo("latitud").value = ubicacion?.latitud ?? "";
    campo("longitud").value = ubicacion?.longitud ?? "";
    if (conNombre && nombre != null) campo("nombre").value = nombre;
    mapa?.sincronizar();
  }

  function leer() {
    const vivienda = { distrito_norm: campo("distrito_norm").value };
    for (const clave of Object.keys(opciones.limites)) {
      const texto = campo(clave).value.trim();
      vivienda[clave] = texto === "" ? null : Number(texto);
    }
    for (const clave of opciones.binarias) vivienda[clave] = campo(clave).value === "" ? null : Number(campo(clave).value);
    for (const clave of ["area_total", "dormitorios", "banos"]) {
      if (vivienda[clave] == null) throw new Error(`Completa: ${opciones.etiquetas[clave]}.`);
    }
    const lat = campo("latitud").value.trim(), lon = campo("longitud").value.trim();
    if ((lat === "") !== (lon === "")) throw new Error("Ingresa latitud y longitud, o deja ambas vacías.");
    const ubicacion = lat === "" ? null : { latitud: Number(lat), longitud: Number(lon) };
    let precio = null;
    if (conPrecio && campo("precio_publicar").value.trim() !== "") {
      precio = Number(campo("precio_publicar").value);
      if (!(precio >= 300 && precio <= 50000)) throw new Error("El precio de publicación debe estar entre S/ 300 y S/ 50,000.");
    }
    return { vivienda, ubicacion, nombre: conNombre ? campo("nombre").value.trim() : null, precio };
  }

  const mapa = conMapa ? mapaUbicacion($(".map-picker", form), opciones, campo) : null;

  function fijarUbicacion(lat, lon) {
    campo("latitud").value = lat.toFixed(6);
    campo("longitud").value = lon.toFixed(6);
    mapa?.sincronizar();
  }

  buscadorDireccion(form, campo, fijarUbicacion);

  let entradaPortada = null;
  function cargarDesdePortada(vivienda) {
    if (!conDemos) return;
    entradaPortada = vivienda;
    const selector = campo("demo");
    if (!selector.querySelector('option[value="portada"]')) selector.add(new Option("Lo que ingresaste en inicio", "portada"), 0);
    selector.value = "portada";
    cargar(vivienda);
  }
  if (conDemos) {
    campo("demo").addEventListener("change", () => {
      const valor = campo("demo").value;
      cargar(valor === "portada" ? entradaPortada : opciones.demos[Number(valor)].entrada);
    });
    cargar(opciones.demos[0].entrada);
  }
  if (pasos) activarPasos(form, mapa, listaPasos.length);
  return { form, leer, cargar, cargarDesdePortada, fijarUbicacion, mensaje: $(".form-msg", form), boton: $("button[type=submit]", form) };
}

/* Un paso a la vez. Siguiente valida solo los campos del paso visible; Enter avanza en vez de enviar.
   Este listener se registra antes que el de la vista: si el formulario no está en el último paso, la vista no recibe el envío. */
function activarPasos(form, mapa, total) {
  const paneles = $$(".paso", form), chips = $$(".paso-chip", form);
  const atras = $("[data-atras]", form), siguiente = $("[data-siguiente]", form);
  const enviar = $("button[type=submit]", form), cuenta = $(".paso-cuenta", form), aviso = $(".form-msg", form);
  let actual = 0, alcanzado = 0;

  // Primer campo inválido del paso, con un mensaje que nombra el campo.
  const invalido = (i) => $$("input, select", paneles[i]).find((el) => !el.checkValidity());
  const textoError = (el) => {
    const nombre = form.querySelector(`label[for="${el.id}"]`)?.textContent.trim() || "este dato";
    return el.validity.valueMissing ? `Completa: ${nombre}.` : `Revisa: ${nombre} (${el.min !== "" ? `entre ${el.min} y ${el.max}` : "valor no válido"}).`;
  };

  function mostrar(i, enfocar = true) {
    actual = i;
    alcanzado = Math.max(alcanzado, i);
    paneles.forEach((p, j) => { p.hidden = j !== i; });
    chips.forEach((c, j) => {
      c.closest("li").dataset.estado = j === i ? "actual" : j < i || j <= alcanzado ? "hecho" : "";
      if (j === i) c.setAttribute("aria-current", "step"); else c.removeAttribute("aria-current");
      c.disabled = j > alcanzado;
    });
    atras.hidden = i === 0;
    siguiente.hidden = i === total - 1;
    enviar.hidden = i !== total - 1;
    cuenta.textContent = `Paso ${i + 1} de ${total}`;
    mensaje(aviso, "");
    if (i === 0) mapa?.refrescar();
    if (enfocar) $("h2", paneles[i]).focus({ preventScroll: true });
    if (enfocar) form.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function avanzar() {
    const malo = invalido(actual);
    if (malo) { mensaje(aviso, textoError(malo)); malo.focus(); return; }
    if (actual < total - 1) mostrar(actual + 1);
  }

  siguiente.addEventListener("click", avanzar);
  atras.addEventListener("click", () => mostrar(actual - 1));
  chips.forEach((c, j) => c.addEventListener("click", () => {
    // Hacia adelante solo se salta si los pasos intermedios están completos.
    for (let k = actual; k < j; k++) {
      const malo = invalido(k);
      if (malo) { mostrar(k); mensaje(aviso, textoError(malo)); malo.focus(); return; }
    }
    mostrar(j);
  }));
  form.addEventListener("submit", (e) => {
    if (actual < total - 1) { e.preventDefault(); e.stopImmediatePropagation(); avanzar(); return; }
    const conError = paneles.findIndex((_, k) => invalido(k));
    if (conError >= 0) {
      e.preventDefault(); e.stopImmediatePropagation();
      const malo = invalido(conError);
      mostrar(conError);
      mensaje(aviso, textoError(malo));
      malo.focus();
    }
  });
  mostrar(0, false);
}

const LIMA = [-12.0464, -77.0428];
// Mismo recorte geográfico que la API (accesibilidad.LIMITES).
const dentroDeLima = (lat, lon) => lat >= -12.35 && lat <= -11.75 && lon >= -77.2 && lon <= -76.8;

/* Buscador de la ubicación: una dirección se busca en la API (OpenStreetMap) y se elige de una lista;
   un par "latitud, longitud" se marca directo. Se busca al pulsar Buscar o Enter, no al teclear. */
function buscadorDireccion(form, campo, fijarUbicacion) {
  const entrada = $("#f-direccion", form), boton = $("[data-buscar]", form);
  const lista = $(".dir-results", form), aviso = $("[data-dir-msg]", form);

  function elegir(r) {
    fijarUbicacion(r.latitud, r.longitud);
    lista.hidden = true;
    entrada.value = r.nombre;
    const distrito = campo("distrito_norm");
    // OpenStreetMap casi nunca tiene la numeración de Lima: suele devolver un punto de la calle.
    const ajuste = "Si el número no coincide, haz clic en el mapa para afinar el punto.";
    if (r.distrito && [...distrito.options].some((o) => o.value === r.distrito)) {
      distrito.value = r.distrito;
      aviso.textContent = `Ubicación marcada. Distrito: ${titulo(r.distrito)}. ${ajuste}`;
    } else {
      aviso.textContent = `Ubicación marcada. Revisa que el distrito elegido sea el correcto. ${ajuste}`;
    }
  }

  async function buscar() {
    const texto = entrada.value.trim();
    lista.hidden = true;
    const par = texto.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
    if (par) {
      const lat = Number(par[1]), lon = Number(par[2]);
      if (!dentroDeLima(lat, lon)) { aviso.textContent = "Esas coordenadas están fuera de Lima. Escríbelas como latitud, longitud (por ejemplo -12.0464, -77.0428)."; return; }
      fijarUbicacion(lat, lon);
      aviso.textContent = "Ubicación marcada con las coordenadas.";
      return;
    }
    if (texto.length < 3) { aviso.textContent = "Escribe la calle y el número, por ejemplo Av. Arequipa 1500, Lince."; return; }
    aviso.textContent = "Buscando…";
    try {
      const resultados = await conBoton(boton, "Buscando…", () => llamar("/api/ubicaciones?q=" + encodeURIComponent(texto)));
      if (!resultados.length) {
        aviso.textContent = "No encontramos esa dirección en Lima. Prueba solo con la calle y el distrito, o marca el punto en el mapa.";
        return;
      }
      lista.innerHTML = resultados.map((r, i) => `<li><button type="button" data-i="${i}">${esc(r.nombre)}</button></li>`).join("");
      lista.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => elegir(resultados[Number(b.dataset.i)])));
      lista.hidden = false;
      aviso.textContent = resultados.length === 1 ? "Elige el resultado para marcarlo en el mapa." : `Elige uno de los ${resultados.length} resultados.`;
    } catch (err) {
      aviso.textContent = err.message;
    }
  }

  boton.addEventListener("click", buscar);
  // Enter busca en vez de enviar el formulario.
  entrada.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); buscar(); } });
}

/* Mapa del formulario: muestra el centro del distrito elegido y, al hacer clic, fija latitud y longitud. */
function mapaUbicacion(elemento, opciones, campo) {
  if (!window.L) {
    elemento.textContent = "No se pudo cargar el mapa (requiere conexión a internet). Puedes escribir las coordenadas.";
    return null;
  }
  const mapa = L.map(elemento, { scrollWheelZoom: false }).setView(LIMA, 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(mapa);
  const marcador = L.circleMarker(LIMA, { radius: 9, color: "#fff", weight: 2, fillColor: "#c2510a", fillOpacity: 1 });

  function sincronizar() {
    const lat = Number(campo("latitud").value), lon = Number(campo("longitud").value);
    if (campo("latitud").value.trim() !== "" && campo("longitud").value.trim() !== "" && Number.isFinite(lat) && Number.isFinite(lon)) {
      marcador.setLatLng([lat, lon]).addTo(mapa).bindTooltip("Departamento");
      mapa.setView([lat, lon], Math.max(mapa.getZoom(), 15));
    } else {
      marcador.remove();
      mapa.setView(opciones.centros?.[campo("distrito_norm").value] || LIMA, 14);
    }
  }

  mapa.on("click", (e) => {
    campo("latitud").value = e.latlng.lat.toFixed(6);
    campo("longitud").value = e.latlng.lng.toFixed(6);
    sincronizar();
  });
  for (const nombre of ["distrito_norm", "latitud", "longitud"]) campo(nombre).addEventListener("change", sincronizar);
  // Mientras se escriben las coordenadas, el punto se mueve en cuanto el par es válido.
  for (const nombre of ["latitud", "longitud"]) campo(nombre).addEventListener("input", () => {
    const lat = Number(campo("latitud").value), lon = Number(campo("longitud").value);
    if (campo("latitud").value.trim() !== "" && campo("longitud").value.trim() !== "" && dentroDeLima(lat, lon)) sincronizar();
  });
  // El panel acaba de pintarse: Leaflet necesita medir el contenedor ya visible.
  setTimeout(() => { mapa.invalidateSize(); sincronizar(); }, 0);
  // Al volver al paso de ubicación, Leaflet tiene que medir otra vez el contenedor que estuvo oculto.
  const refrescar = () => setTimeout(() => mapa.invalidateSize(), 0);
  return { sincronizar, refrescar };
}
