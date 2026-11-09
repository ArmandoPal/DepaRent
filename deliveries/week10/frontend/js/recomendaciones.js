import { llamar, obtenerOpciones } from "./api.js";
import { $, $$, esc, num, pct, soles, titulo, conBoton, mensaje, ETIQUETAS_AMENIDAD } from "./util.js";

/* ---------- Recomendados para ti: el sistema elige según el perfil del inquilino (modelo 7) ---------- */

const CLAVE = "deparent.perfil-inquilino";
const DESCRIPCION_HOGAR = {
  familia: "Pesan 3 dormitorios, área, juegos infantiles, áreas verdes, seguridad y cochera.",
  pareja: "Pesan 1 o 2 dormitorios, balcón o terraza, gimnasio y parrilla.",
  estudiante: "Pesan el paradero cercano, el tamaño justo y el coworking.",
  mascota: "Solo departamentos que admiten mascotas; pesan terraza y áreas verdes.",
  mayor: "Pesan el ascensor, el paradero cercano y la seguridad.",
};

function leerPerfil() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || null; } catch { return null; }
}
function guardarPerfil(perfil) {
  try { localStorage.setItem(CLAVE, JSON.stringify(perfil)); } catch { /* sin almacenamiento: el perfil dura esta visita */ }
}

const filaTitulo = (h1, sub, acciones = "") =>
  `<div class="title-row"><div><h1>${h1}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${acciones ? `<div class="title-actions">${acciones}</div>` : ""}</div>`;

export async function vistaRecomendaciones(lienzo, params) {
  const op = await obtenerOpciones();
  let perfil = leerPerfil();
  if (params.get("ver") === "guardados") return mostrarRecomendaciones(lienzo, op, perfil || {}, "guardados");
  if (!perfil || params.get("editar") === "1") return formularioPerfil(lienzo, op, perfil);
  return mostrarRecomendaciones(lienzo, op, perfil);
}

function formularioPerfil(lienzo, op, previo) {
  const p = previo || { hogar: "", prioridades: [], distritos: [] };
  const hogares = op.recomendador.hogares, prioridades = op.recomendador.prioridades;
  const distritos = op.distritos.filter((d) => d !== "otros");
  lienzo.innerHTML = `
    ${filaTitulo("Recomendados para ti", "Cuéntanos quién eres y qué necesitas. El sistema elige los departamentos del mercado que mejor te calzan y te dice qué tiene cada uno.")}
    <form class="panel perfil-form" novalidate>
      <fieldset class="perfil-grupo"><legend>¿Para quién es el departamento?</legend>
        <div class="hogares">${Object.entries(hogares).map(([k, nombre]) => `
          <label class="hogar"><input type="radio" name="hogar" value="${k}" ${p.hogar === k ? "checked" : ""} required>
            <span><b>${esc(nombre)}</b><small>${esc(DESCRIPCION_HOGAR[k] || "")}</small></span></label>`).join("")}</div>
      </fieldset>
      <div class="fields">
        <div class="field"><label for="r-max">Presupuesto máximo (S/ al mes)</label>
          <input class="input num" id="r-max" name="presupuesto_max" type="number" min="300" max="50000" step="100" value="${p.presupuesto_max ?? ""}" placeholder="Por ejemplo 2500"></div>
        <div class="field optional"><label for="r-dorm">Dormitorios mínimos</label>
          <select class="input" id="r-dorm" name="dormitorios_min"><option value="">Según tu hogar</option>
          ${[1, 2, 3, 4].map((n) => `<option value="${n}" ${p.dormitorios_min === n ? "selected" : ""}>${n} o más</option>`).join("")}</select></div>
      </div>
      <fieldset class="perfil-grupo"><legend>¿Qué te importa más? <small>(hasta 3)</small></legend>
        <div class="chips">${Object.entries(prioridades).map(([k, nombre]) => `
          <label class="chip"><input type="checkbox" name="prioridades" value="${k}" ${p.prioridades?.includes(k) ? "checked" : ""}><span>${esc(nombre)}</span></label>`).join("")}</div>
      </fieldset>
      <fieldset class="perfil-grupo"><legend>Distritos que te interesan <small>(si no marcas ninguno, buscamos en todos)</small></legend>
        <div class="chips">${distritos.map((d) => `
          <label class="chip"><input type="checkbox" name="distritos" value="${esc(d)}" ${p.distritos?.includes(d) ? "checked" : ""}><span>${esc(titulo(d))}</span></label>`).join("")}</div>
      </fieldset>
      <fieldset class="perfil-grupo"><legend>¿Dónde trabajas o estudias? <small>(opcional: acerca las recomendaciones)</small></legend>
        <div class="search-row"><input class="input" id="r-lugar" placeholder="Por ejemplo: Av. Javier Prado Este 4600, Surco" value="${esc(p.lugar_nombre || "")}" autocomplete="off">
          <button class="btn" type="button" data-buscar-lugar>Buscar</button>
          ${p.lugar ? '<button class="btn ghost" type="button" data-quitar-lugar>Quitar</button>' : ""}</div>
        <ul class="dir-results" hidden></ul>
        <p class="hint" data-lugar-msg>${p.lugar ? `Marcado: ${esc(p.lugar_nombre || "ubicación elegida")}.` : "Escribe la dirección y elige el resultado."}</p>
      </fieldset>
      <div class="form-actions"><button class="btn primary" type="submit">Ver mis recomendaciones</button>
        ${previo ? '<a class="btn ghost" href="#/para-ti">Cancelar</a>' : ""}</div>
      <div class="form-msg" role="alert"></div>
      <p class="panel-note">Tu perfil se guarda solo en este navegador. No necesitas cuenta.</p>
    </form>`;
  const form = $(".perfil-form", lienzo);
  let lugar = p.lugar || null, lugarNombre = p.lugar_nombre || "";
  const avisoLugar = $("[data-lugar-msg]", form), lista = $(".dir-results", form), entrada = $("#r-lugar", form);

  async function buscarLugar() {
    const texto = entrada.value.trim();
    lista.hidden = true;
    if (texto.length < 3) { avisoLugar.textContent = "Escribe la calle y el distrito."; return; }
    try {
      const resultados = await conBoton($("[data-buscar-lugar]", form), "Buscando…", () => llamar("/api/ubicaciones?q=" + encodeURIComponent(texto)));
      if (!resultados.length) { avisoLugar.textContent = "No encontramos esa dirección en Lima. Prueba con la avenida y el distrito."; return; }
      lista.innerHTML = resultados.map((r, i) => `<li><button type="button" data-i="${i}">${esc(r.nombre)}</button></li>`).join("");
      $$("button", lista).forEach((b) => b.addEventListener("click", () => {
        const r = resultados[Number(b.dataset.i)];
        lugar = { latitud: r.latitud, longitud: r.longitud };
        lugarNombre = r.nombre;
        entrada.value = r.nombre;
        lista.hidden = true;
        avisoLugar.textContent = `Marcado: ${r.nombre}.`;
      }));
      lista.hidden = false;
      avisoLugar.textContent = "Elige el resultado correcto.";
    } catch (err) {
      avisoLugar.textContent = err.message;
    }
  }
  $("[data-buscar-lugar]", form).addEventListener("click", buscarLugar);
  entrada.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); buscarLugar(); } });
  $("[data-quitar-lugar]", form)?.addEventListener("click", (e) => {
    lugar = null; lugarNombre = ""; entrada.value = ""; avisoLugar.textContent = "Sin lugar de trabajo o estudio."; e.currentTarget.remove();
  });
  $$('input[name="prioridades"]', form).forEach((c) => c.addEventListener("change", () => {
    const marcadas = $$('input[name="prioridades"]:checked', form);
    if (marcadas.length > 3) { c.checked = false; mensaje($(".form-msg", form), "Elige como máximo 3 prioridades."); }
    else mensaje($(".form-msg", form), "");
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const hogar = $('input[name="hogar"]:checked', form)?.value;
    if (!hogar) return mensaje($(".form-msg", form), "Elige para quién es el departamento.");
    const max = $("#r-max", form).value, dorm = $("#r-dorm", form).value;
    const nuevo = {
      hogar, presupuesto_max: max === "" ? null : Number(max), dormitorios_min: dorm === "" ? null : Number(dorm),
      prioridades: $$('input[name="prioridades"]:checked', form).map((c) => c.value),
      distritos: $$('input[name="distritos"]:checked', form).map((c) => c.value),
      lugar, lugar_nombre: lugarNombre,
    };
    if (nuevo.presupuesto_max != null && (nuevo.presupuesto_max < 300 || nuevo.presupuesto_max > 50000)) {
      return mensaje($(".form-msg", form), "El presupuesto debe estar entre S/ 300 y S/ 50,000.");
    }
    guardarPerfil(nuevo);
    if (location.hash === "#/para-ti") mostrarRecomendaciones(lienzo, op, nuevo);
    else location.hash = "#/para-ti";
  });
}

async function mostrarRecomendaciones(lienzo, op, perfil, pestana = "recomendados") {
  const hogar = op.recomendador.hogares[perfil.hogar] || "";
  const guardados = leerGuardados();
  lienzo.innerHTML = `
    ${filaTitulo("Recomendados para ti", "Elegidos por el sistema según tu perfil. Guarda los que te gusten para compararlos después.",
      '<a class="btn" href="#/para-ti?editar=1">Editar mi perfil</a>')}
    ${perfil.hogar ? tarjetaPerfil(op, perfil, hogar) : ""}
    <nav class="tabs reco-tabs" aria-label="Recomendados o guardados">
      <a href="#/para-ti" ${pestana === "recomendados" ? 'aria-current="page"' : ""}>Recomendados</a>
      <a href="#/para-ti?ver=guardados" ${pestana === "guardados" ? 'aria-current="page"' : ""}>Guardados <span data-n-guardados>(${guardados.length})</span></a>
    </nav>
    <div data-recos aria-busy="true"><section class="panel"><p class="skeleton">Buscando los departamentos que mejor te calzan…</p></section></div>`;
  const destino = $("[data-recos]", lienzo);
  if (pestana === "guardados") {
    pintarGuardados(destino, lienzo);
    destino.removeAttribute("aria-busy");
    return;
  }
  const { lugar_nombre, ...cuerpo } = perfil;
  try {
    const r = await llamar("/api/recomendar", { cuerpo: { ...cuerpo, limite: 12 } });
    destino.innerHTML = r.recomendaciones.length ? `
      <p class="sub reco-count">${num(r.candidatos)} departamentos cumplen tu presupuesto y tus filtros. Estos ${r.recomendaciones.length} son los que mejor te calzan, del más al menos recomendado.</p>
      <ol class="reco-list">${r.recomendaciones.map((x, i) => tarjeta(x, i)).join("")}</ol>
      <p class="panel-note">${esc(r.aviso)} El orden combina lo que suele necesitar tu tipo de hogar, tus prioridades,
        la cercanía a tu trabajo o estudio y el precio frente al estimado del modelo.</p>`
      : `<section class="panel"><div class="empty"><p>Ningún departamento cumple tu presupuesto y tus filtros. Prueba subir el presupuesto, quitar distritos o bajar el mínimo de dormitorios.</p>
          <a class="btn primary" href="#/para-ti?editar=1">Editar mi perfil</a></div></section>`;
    activarGuardar(destino, lienzo, r.recomendaciones);
  } catch (err) {
    destino.innerHTML = `<section class="panel"><div class="empty"><p>No pudimos calcular tus recomendaciones. ${esc(err.message)}</p>
      <a class="btn" href="#/para-ti?editar=1">Revisar mi perfil</a></div></section>`;
  } finally {
    destino.removeAttribute("aria-busy");
  }
}

/* Paso "perfil": lo que el sistema entendió del cuestionario y qué va a priorizar. */
function tarjetaPerfil(op, perfil, hogar) {
  const filas = [
    ["Hogar", `${hogar}. ${DESCRIPCION_HOGAR[perfil.hogar] || ""}`],
    ["Presupuesto", perfil.presupuesto_max ? `hasta ${soles(perfil.presupuesto_max)} al mes` : "sin tope"],
    ["Dormitorios", perfil.dormitorios_min ? `${perfil.dormitorios_min} o más` : "según tu hogar"],
    ["Te importa", perfil.prioridades?.length ? perfil.prioridades.map((k) => op.recomendador.prioridades[k]).join(", ") : "sin prioridades marcadas"],
    ["Distritos", perfil.distritos?.length ? perfil.distritos.map(titulo).join(", ") : "todos"],
    ["Trabajo o estudio", perfil.lugar ? (perfil.lugar_nombre || "ubicación marcada") : "no indicado"],
  ];
  return `<section class="panel perfil-card" aria-label="Tu perfil">
    <h2>Tu perfil</h2>
    <dl>${filas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
  </section>`;
}

/* ---------- Guardados: se quedan en este navegador ---------- */
const CLAVE_GUARDADOS = "deparent.guardados";
function leerGuardados() {
  try { return JSON.parse(localStorage.getItem(CLAVE_GUARDADOS)) || []; } catch { return []; }
}
function escribirGuardados(lista) {
  try { localStorage.setItem(CLAVE_GUARDADOS, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
}

function activarGuardar(destino, lienzo, datos) {
  $$("[data-guardar]", destino).forEach((boton) => boton.addEventListener("click", () => {
    const id = boton.dataset.guardar;
    let lista = leerGuardados();
    const ya = lista.some((g) => g.id === id);
    if (ya) lista = lista.filter((g) => g.id !== id);
    else lista = [{ ...datos.find((d) => d.id === id), guardado: Date.now() }, ...lista];
    escribirGuardados(lista);
    const n = $("[data-n-guardados]", lienzo);
    if (n) n.textContent = `(${lista.length})`;
    if (destino.dataset.vista === "guardados") return pintarGuardados(destino, lienzo);
    boton.setAttribute("aria-pressed", String(!ya));
    boton.textContent = ya ? "Guardar" : "Guardado";
  }));
}

function pintarGuardados(destino, lienzo) {
  const lista = leerGuardados();
  destino.dataset.vista = "guardados";
  destino.innerHTML = lista.length ? `
    <p class="sub reco-count">${lista.length === 1 ? "1 departamento guardado" : `${lista.length} departamentos guardados`}. Los datos son de la captura del mercado en que los guardaste.</p>
    <ol class="reco-list">${lista.map((x, i) => tarjeta(x, i, false)).join("")}</ol>`
    : `<section class="panel"><div class="empty"><p>Todavía no guardas ningún departamento. En Recomendados, usa "Guardar" en los que te gusten.</p>
        <a class="btn primary" href="#/para-ti">Ver recomendados</a></div></section>`;
  activarGuardar(destino, lienzo, lista);
}

function yaDicha(amenidad, dichos) {
  const a = amenidad.toLowerCase();
  return dichos.includes(a) || ((a === "balcón" || a === "terraza") && dichos.includes("balcón o terraza"));
}

function tarjeta(x, i, numerar = true) {
  const guardado = leerGuardados().some((g) => g.id === x.id);
  const dorm = `${num(x.dormitorios)} ${x.dormitorios === 1 ? "dormitorio" : "dormitorios"}`;
  const banos = `${num(x.banos)} ${x.banos === 1 ? "baño" : "baños"}`;
  // Todas las amenidades del anuncio, sin repetir las que ya están en "Tiene".
  const dichos = x.motivos.join(" ").toLowerCase();
  const amenidades = [...x.amenidades.map((a) => ETIQUETAS_AMENIDAD[a].toLowerCase()), ...x.amenidades_extra]
    .filter((a) => !yaDicha(a, dichos));
  const pill = x.valoracion.startsWith("Por debajo") ? "pos" : x.valoracion.startsWith("Por encima") ? "warn" : "";
  return `<li class="reco-card">
    <a class="reco-link" href="#/anuncio/${x.id}" aria-label="Ver ficha: ${esc(dorm)} en ${esc(titulo(x.distrito))}">
      ${numerar ? `<span class="reco-rank" aria-label="Recomendación ${i + 1}">${i + 1}</span>` : '<span class="reco-rank" aria-hidden="true">♥</span>'}
      <div class="reco-body">
        <p class="reco-title"><b>${esc(titulo(x.distrito))}</b> · ${esc(dorm)} · ${esc(banos)} · ${num(x.area_total)} m²</p>
        <p class="reco-price"><b>${soles(x.precio_soles)}</b> al mes · estimado ${soles(x.precio_estimado_soles)}
          <span class="pill ${pill}">${pct(x.diferencia_estimado_porcentaje)}</span></p>
        ${x.motivos.length ? `<p class="reco-why"><span>Tiene:</span> ${x.motivos.map(esc).join(" · ")}</p>` : ""}
        ${amenidades.length ? `<p class="reco-extra"><span>Amenidades:</span> ${amenidades.map(esc).join(" · ")}</p>` : ""}
        ${x.faltas.length ? `<p class="reco-miss"><span>Ten en cuenta:</span> ${x.faltas.map(esc).join(" · ")}</p>` : ""}
      </div>
    </a>
    <button class="btn reco-save" type="button" data-guardar="${esc(x.id)}" aria-pressed="${guardado}">${guardado ? "Guardado" : "Guardar"}</button></li>`;
}
