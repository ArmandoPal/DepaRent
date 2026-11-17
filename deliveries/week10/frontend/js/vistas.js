import { llamar, obtenerOpciones, guardarSesion, sesion } from "./api.js";
import { mostrarAnalisis } from "./analisis.js";
import { formularioVivienda } from "./formulario.js";
import { $, $$, esc, num, pct, soles, titulo, conBoton, mensaje, notaTecnica, valoracionSencilla, ETIQUETAS_AMENIDAD, vecinosConOpciones, botonesVecinos } from "./util.js";
import { marcarBienvenida } from "./bienvenida.js";
import { icono } from "./iconos.js";

const irA = (ruta) => { location.hash = ruta; };
const banos = (n) => `${num(n)} ${n === 1 ? "baño" : "baños"}`;
const dorms = (n) => `${num(n)} dorm.`;
const filaTitulo = (h1, sub, acciones = "") =>
  `<div class="title-row"><div><h1>${h1}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${acciones ? `<div class="title-actions">${acciones}</div>` : ""}</div>`;

/* ---------- Ingreso y registro ---------- */

export function vistaIngresar(lienzo, params) {
  if (sesion()) return irA(params.get("siguiente") || (sesion().usuario?.rol === "analista" ? "#/analista" : "#/mi-perfil"));
  const registro = params.get("modo") === "registro";
  const siguiente = params.get("siguiente");
  const enlace = (modo) => `#/ingresar${modo ? "?modo=registro" : ""}${siguiente ? `${modo ? "&" : "?"}siguiente=${encodeURIComponent(siguiente)}` : ""}`;
  lienzo.innerHTML = `
    ${filaTitulo(registro ? "Crear cuenta" : "Ingresar", "Una sola cuenta para buscar y para alquilar: recibe recomendaciones según tu perfil, guarda las que te gusten o publica tu departamento.")}
    <section class="panel auth-panel">
      <nav class="tabs" aria-label="Ingreso o registro">
        <a href="${enlace(false)}" ${registro ? "" : 'aria-current="page"'}>Ingresar</a>
        <a href="${enlace(true)}" ${registro ? 'aria-current="page"' : ""}>Crear cuenta</a>
      </nav>
      <form class="auth-form" novalidate>
        ${registro ? '<div class="field"><label for="a-nombre">Nombre</label><input class="input" id="a-nombre" name="nombre" autocomplete="name" required></div>' : ""}
        <div class="field"><label for="a-email">Correo</label><input class="input" id="a-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="a-pass">Contraseña</label><input class="input" id="a-pass" name="password" type="password" minlength="8"
          autocomplete="${registro ? "new-password" : "current-password"}" required>
          ${registro ? '<p class="hint">Mínimo 8 caracteres. Es un prototipo académico: no reutilices una contraseña importante.</p>' : ""}</div>
        <button class="btn primary block" type="submit">${registro ? "Crear cuenta" : "Ingresar"}</button>
        <div class="form-msg" role="alert"></div>
      </form>
    </section>`;
  const form = $(".auth-form", lienzo);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const r = await conBoton($("button", form), "Un momento…", () =>
        llamar(registro ? "/api/cuentas/registro" : "/api/cuentas/ingreso", { cuerpo: Object.fromEntries(new FormData(form)) }));
      guardarSesion({ token: r.token, usuario: r.usuario });
      const analista = r.usuario.rol === "analista";
      // Si venía de otro flujo (por ejemplo, publicar su depa) no lo interrumpimos; el analista va directo a su panel.
      if (!siguiente && !analista) marcarBienvenida();
      // Al crear la cuenta, el inquilino empieza por el cuestionario; al ingresar, va a su perfil.
      irA(siguiente || (analista ? "#/analista" : registro ? "#/mi-perfil/editar" : "#/mi-perfil"));
    } catch (err) {
      mensaje($(".form-msg", form), err.message);
    }
  });
}

export async function cerrarSesion() {
  await llamar("/api/cuentas/salida", { cuerpo: {} }).catch(() => null);
  guardarSesion(null);
  irA("#/");
}

/* ---------- Mis departamentos: ¿cuáles están publicados y a qué precio? ---------- */

export async function vistaMisDepartamentos(lienzo) {
  const accion = '<a class="btn primary" href="#/mis-departamentos/nuevo">Agregar departamento</a>';
  lienzo.innerHTML = filaTitulo("Mis departamentos", '<span class="skeleton">Cargando tus departamentos</span>', accion)
    + guiaPropietario() + '<div data-lista></div>';
  const deptos = await llamar("/api/departamentos");
  const publicados = deptos.filter((d) => d.publicacion);
  const sub = deptos.length
    ? `${deptos.length} departamento${deptos.length > 1 ? "s" : ""} · ${publicados.length ? `${publicados.length} publicado${publicados.length > 1 ? "s" : ""} por ${soles(publicados.reduce((t, d) => t + d.publicacion.precio_soles, 0))} al mes en total` : "ninguno publicado todavía"}`
    : "Agrega el primero para ver su precio esperado y a cuánto publicarlo.";
  $(".title-row .sub", lienzo).textContent = sub;
  const grupos = { todos: deptos, publicados, borradores: deptos.filter((d) => !d.publicacion) };
  let filtro = "todos";
  const destino = $("[data-lista]", lienzo);
  function dibujar() {
    const filas = grupos[filtro];
    destino.innerHTML = `
      <div class="counts" role="group" aria-label="Filtrar por estado">
        ${[["todos", "Todos"], ["publicados", "Publicados"], ["borradores", "Borradores"]].map(([k, t]) =>
          `<button class="count" type="button" data-filtro="${k}" aria-pressed="${k === filtro}"><span>${t}</span><b>${grupos[k].length}</b></button>`).join("")}
      </div>
      <section class="panel" aria-label="Lista de departamentos">
        ${filas.length ? `<div class="table-wrap"><table class="list-table">
          <thead><tr><th>Departamento</th><th class="n">Precio esperado</th><th class="n">Sugerido</th><th>Estado</th><th class="n">Publicado a</th><th class="n">Acciones</th></tr></thead>
          <tbody>${filas.map(filaDepartamento).join("")}</tbody></table></div>`
          : `<div class="empty">${deptos.length ? `<p>${filtro === "publicados" ? "Ningún departamento publicado todavía. Ábrelo y elige un precio de publicación." : "No hay borradores: todos están publicados."}</p>`
            : '<p>Todavía no registras departamentos.</p><a class="btn primary" href="#/mis-departamentos/nuevo">Agregar mi primer departamento</a>'}</div>`}
      </section>`;
    $$("[data-filtro]", destino).forEach((b) => b.addEventListener("click", () => { filtro = b.dataset.filtro; dibujar(); }));
    $$("tr[data-href]", destino).forEach((tr) => tr.addEventListener("click", (e) => { if (!e.target.closest("a")) irA(tr.dataset.href); }));
  }
  dibujar();
}

// Pruebas con propietarios (P5): después de ingresar no quedaba claro qué hacer. Tres pasos con icono, sin párrafos.
function guiaPropietario() {
  const pasos = [["casa", "Agrega tus datos", "Distrito, tamaño y extras"], ["moneda", "Mira el precio", "Esperado, rango y parecidos"],
    ["publicar", "Publica", "Elige uno de tres precios"]];
  return `<ol class="guia-pasos" aria-label="Cómo funciona">${pasos.map(([ic, t, s], i) => `<li>${icono(ic)}<span><b>${i + 1}. ${t}</b><span class="hint">${s}</span></span></li>`).join("")}</ol>`;
}

function filaDepartamento(d) {
  const v = d.vivienda, r = d.resumen || {};
  return `<tr data-href="#/mis-departamentos/${d.id}">
    <td><a class="id" href="#/mis-departamentos/${d.id}">${esc(d.nombre)}</a>
      <span class="sub">${esc(titulo(v.distrito_norm))} · ${num(v.area_total)} m² · ${dorms(v.dormitorios)} · ${banos(v.banos)}</span></td>
    <td class="n more" data-label="Esperado">${soles(r.precio_estimado_soles)}</td>
    <td class="n more" data-label="Sugerido">${soles(r.precio_sugerido_soles)}<span class="sub">${esc(r.escenario_sugerido || "")}</span></td>
    <td class="more hide-phone"><span class="pill ${d.publicacion ? "pos" : ""}">${d.publicacion ? "Publicado" : "Borrador"}</span></td>
    <td class="n key">${d.publicacion ? `<b>${soles(d.publicacion.precio_soles)}</b>` : '<span class="dash">Sin publicar</span>'}</td>
    <td class="n row-actions"><a class="btn small" href="#/mis-departamentos/${d.id}?ver=caracteristicas">Editar</a>
      <a class="btn small" href="#/mis-departamentos/${d.id}?ver=precio">${d.publicacion ? "Cambiar precio" : "Publicar"}</a></td>
  </tr>`;
}

/* ---------- Agregar departamento ---------- */

export async function vistaNuevoDepartamento(lienzo) {
  const op = await obtenerOpciones();
  lienzo.innerHTML = filaTitulo("Agregar departamento", "Cuatro pasos cortos. Al final verás su precio esperado y a cuánto publicarlo.")
    + '<section class="panel" data-form></section>';
  const f = formularioVivienda($("[data-form]", lienzo), op, { conNombre: true, conMapa: true, conPrecio: true, pasos: true, textoBoton: "Guardar y ver el precio",
    secundario: '<a class="btn" href="#/mis-departamentos">Cancelar</a>' });
  f.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const { nombre, vivienda, ubicacion, precio } = f.leer();
      const r = await conBoton(f.boton, precio ? "Guardando y publicando…" : "Analizando…", async () => {
        const creado = await llamar("/api/departamentos", { cuerpo: { nombre, vivienda, ubicacion } });
        if (precio) await llamar(`/api/departamentos/${creado.departamento.id}/publicacion`, { cuerpo: { precio_soles: precio, escenario: "Personalizado" } });
        return creado;
      });
      irA(`#/mis-departamentos/${r.departamento.id}`);
    } catch (err) {
      mensaje(f.mensaje, err.message);
    }
  });
}

/* ---------- Detalle: ¿a cuánto lo publico? ---------- */

function cabeceraObjeto(nombre, v, acciones, extra = "") {
  return `<section class="panel object-head">
    <div class="cover" aria-hidden="true">${num(v.area_total)}<br>m²</div>
    <div><h1>${esc(nombre)}</h1><p class="meta">${esc(titulo(v.distrito_norm))} · ${num(v.area_total)} m² · ${dorms(v.dormitorios)} · ${banos(v.banos)}${extra}</p></div>
    ${acciones ? `<div class="title-actions">${acciones}</div>` : ""}
  </section>`;
}

export async function vistaDetalleDepartamento(lienzo, params, id) {
  const op = await obtenerOpciones();
  lienzo.innerHTML = `<section class="panel object-head"><div class="cover" aria-hidden="true"></div><div><h1><span class="skeleton">Cargando departamento</span></h1></div></section>`;
  const { departamento: d, analisis: a } = await llamar(`/api/departamentos/${id}`);
  const sugerido = a.publicacion.escenarios.find((s) => s.sugerido);
  const editar = '<button class="btn" type="button" data-editar>Editar características</button>';
  const acciones = d.publicacion
    ? `<span class="pill pos">Publicado a ${soles(d.publicacion.precio_soles)}</span><button class="btn primary" type="button" data-cambiar-precio>Cambiar precio</button>${editar}<button class="btn ghost" type="button" data-retirar>Retirar publicación</button>`
    : `<button class="btn primary" type="button" data-publicar-sugerido>Publicar a ${soles(sugerido.precio_soles)}</button><button class="btn" type="button" data-cambiar-precio>Elegir otro precio</button>${editar}`;
  lienzo.innerHTML = `<p style="margin-bottom:12px"><a class="card-link" href="#/mis-departamentos">Mis departamentos</a></p>`
    + cabeceraObjeto(d.nombre, d.vivienda, acciones, d.publicacion ? ` · precio ${esc(d.publicacion.escenario.toLowerCase())}` : " · borrador, no visible para inquilinos")
    + '<div class="pub-msg"></div><div data-analisis></div>';
  // Al recargar (tras publicar o guardar) se vuelve al resumen, no a la pestaña que pidió el enlace.
  const recargar = () => vistaDetalleDepartamento(lienzo, new URLSearchParams(), id);
  const ver = params.get("ver");
  const publicar = async (s) => {
    await llamar(`/api/departamentos/${id}/publicacion`, { cuerpo: { precio_soles: s.precio_soles, escenario: s.escenario } });
    await recargar();
  };
  let formulario = null;
  const analisis = mostrarAnalisis($("[data-analisis]", lienzo), a, op, {
    publicacion: d.publicacion,
    alPublicar: publicar,
    pestanaInicial: ver === "caracteristicas" ? "caracteristicas" : ver === "interesados" ? "interesados" : null,
    alMoverUbicacion: (lat, lon) => formulario?.fijarUbicacion(lat, lon),
    extras: [["caracteristicas", "Características", (panel) => {
      panel.innerHTML = `<section class="panel" data-form></section>
        <div class="danger-zone"><p class="hint">Eliminar borra el departamento y su publicación.</p>
          <div class="confirm"><button class="btn danger" type="button" data-borrar>Eliminar departamento</button></div></div>`;
      formulario = formularioVivienda($("[data-form]", panel), op, { conNombre: true, textoBoton: "Guardar y recalcular" });
      formulario.cargar(d.vivienda, d.ubicacion, d.nombre);
      if (d.publicacion) formulario.mensaje.innerHTML = '<p class="hint">Si cambias las características, la publicación se retira porque su precio ya no aplica.</p>';
      formulario.form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const { nombre, vivienda, ubicacion } = formulario.leer();
          await conBoton(formulario.boton, "Recalculando…", () => llamar(`/api/departamentos/${id}`, { metodo: "PUT", cuerpo: { nombre, vivienda, ubicacion } }));
          await recargar();
        } catch (err) {
          mensaje(formulario.mensaje, err.message);
        }
      });
      const zona = $(".confirm", panel);
      $("[data-borrar]", panel).addEventListener("click", () => {
        zona.innerHTML = `<span>¿Eliminar «${esc(d.nombre)}»? No se puede deshacer.</span>
          <button class="btn danger" type="button" data-confirmar>Sí, eliminar</button><button class="btn ghost" type="button" data-cancelar>Cancelar</button>`;
        $("[data-cancelar]", zona).addEventListener("click", () => recargar());
        $("[data-confirmar]", zona).addEventListener("click", async (e) => {
          await conBoton(e.currentTarget, "Eliminando…", () => llamar(`/api/departamentos/${id}`, { metodo: "DELETE" }));
          irA("#/mis-departamentos");
        });
      });
    }], ["interesados", `Interesados (${d.interesados.length})`, (panel) => {
      panel.innerHTML = `<section class="panel" aria-labelledby="t-int"><header><h2 id="t-int">Personas interesadas</h2>
        <span class="meta">${d.publicacion ? `Escriben desde la ficha pública: <a class="card-link" href="#/anuncio/d${d.id}">ver cómo la ven</a>` : "Publica el departamento para recibir mensajes"}</span></header>
        ${d.interesados.length ? `<div class="rows">${d.interesados.map((i) => `<div class="row" style="align-items:flex-start">
            <span>${esc(i.nombre)} · <a href="mailto:${esc(i.email)}">${esc(i.email)}</a><span class="sub">${esc(i.mensaje)}</span></span>
            <span class="hint num">${new Date(i.creado * 1000).toLocaleDateString("es-PE")}</span></div>`).join("")}</div>`
          : `<div class="empty"><p>${d.publicacion ? "Todavía nadie escribió. Los inquilinos te encuentran en la búsqueda." : "Aún no está publicado: nadie puede verlo ni escribirte."}</p></div>`}
      </section>`;
    }]],
  });
  const irAPrecio = () => {
    analisis.abrir("resumen");
    const campo = $("#p-propio", lienzo);
    campo?.scrollIntoView({ block: "center", behavior: "smooth" });
    campo?.focus({ preventScroll: true });
  };
  $("[data-cambiar-precio]", lienzo)?.addEventListener("click", irAPrecio);
  $("[data-editar]", lienzo).addEventListener("click", () => {
    analisis.abrir("caracteristicas");
    $("#tab-caracteristicas", lienzo).scrollIntoView({ block: "start", behavior: "smooth" });
  });
  if (ver === "precio") irAPrecio();
  $("[data-publicar-sugerido]", lienzo)?.addEventListener("click", (e) =>
    conBoton(e.currentTarget, "Publicando…", () => publicar(sugerido)).catch((err) => mensaje($(".pub-msg", lienzo), err.message)));
  $("[data-retirar]", lienzo)?.addEventListener("click", (e) =>
    conBoton(e.currentTarget, "Retirando…", async () => { await llamar(`/api/departamentos/${id}/publicacion`, { metodo: "DELETE" }); await recargar(); })
      .catch((err) => mensaje($(".pub-msg", lienzo), err.message)));
}

/* ---------- Probar sin cuenta ---------- */

export async function vistaProbar(lienzo, params = new URLSearchParams()) {
  const op = await obtenerOpciones();
  lienzo.innerHTML = filaTitulo("Probar el análisis", "Sin cuenta y en tres pasos. Los resultados no se guardan.",
    sesion() ? "" : '<a class="btn" href="#/ingresar?modo=registro">Crear cuenta para guardar</a>')
    + `<figure class="public-scene">
        <img src="assets/lima-apartamento.jpg" width="1024" height="696" loading="lazy" decoding="async" alt="Entrada y jardín de un edificio residencial en Lima">
        <figcaption><strong>Prueba con los datos de tu departamento.</strong><span>Imagen de contexto: no representa un inmueble del análisis. Foto: <a href="https://commons.wikimedia.org/wiki/File:Lima_Peru_city_-_Modern_Apartment_-_outside.jpg">Protontorniyo</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>.</span></figcaption>
      </figure><section class="panel" data-form></section><div data-resultado style="margin-top:24px"></div>`;
  const f = formularioVivienda($("[data-form]", lienzo), op, { conDemos: true, conMapa: true, pasos: true, textoBoton: "Ver el precio" });
  const distrito = params.get("distrito");
  const camposPortada = { area_total: params.get("area"), dormitorios: params.get("dormitorios"), banos: params.get("banos") };
  const valido = distrito && op.distritos.includes(distrito) && Object.entries(camposPortada).every(([campo, texto]) => {
    const valor = Number(texto), [min, max] = op.limites[campo];
    return texto !== null && texto !== "" && Number.isFinite(valor) && valor >= min && valor <= max;
  });
  if (valido) {
    const vivienda = { distrito_norm: distrito };
    for (const campo of Object.keys(op.limites)) vivienda[campo] = null;
    for (const campo of op.binarias) vivienda[campo] = null;
    for (const [campo, texto] of Object.entries(camposPortada)) vivienda[campo] = Number(texto);
    f.cargarDesdePortada(vivienda);
  }
  const destino = $("[data-resultado]", lienzo);
  f.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const { vivienda, ubicacion } = f.leer();
      const a = await conBoton(f.boton, "Analizando…", () => llamar("/api/analizar", { cuerpo: { vivienda, ubicacion } }));
      destino.innerHTML = cabeceraObjeto("Departamento de prueba", a.vivienda, "") + "<div data-analisis></div>";
      mostrarAnalisis($("[data-analisis]", destino), a, op, { alMoverUbicacion: (lat, lon) => f.fijarUbicacion(lat, lon) });
      destino.scrollIntoView({ block: "start" });
    } catch (err) {
      mensaje(f.mensaje, err.message);
    }
  });
}

/* ---------- Búsqueda para inquilinos: ¿cuáles valen lo que piden? ---------- */

export async function vistaBuscar(lienzo) {
  const op = await obtenerOpciones();
  const opcionesMin = Array.from({ length: 4 }, (_, i) => `<option value="${i + 1}">${i + 1} o más</option>`).join("");
  lienzo.innerHTML = `
    ${filaTitulo("Buscar departamentos", `<span data-hallazgo>Anuncios del ${esc(op.mercado.captura_texto)} y departamentos publicados en DepaRent.</span>`)}
    <figure class="public-scene public-scene-wide">
      <img src="assets/barranco-calle.jpg" width="1280" height="960" loading="lazy" decoding="async" alt="Calle residencial con árboles y fachadas en Barranco, Lima">
      <figcaption><strong>Busca por distrito, precio y características.</strong><span>Vista de Barranco; la foto no corresponde a los anuncios. Foto: <a href="https://commons.wikimedia.org/wiki/File:Lima,_Peru_-_Streets_of_Barranco.jpg">Donairesunovi</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>.</span></figcaption>
    </figure>
    <p class="aviso-corto">${icono("info", "icono-chip")}Comparamos el precio pedido con lo que estima el modelo. Confirma la disponibilidad en el portal.</p>
    <form class="filters" novalidate>
      <div class="field"><label for="b-distrito">${icono("ubicacion", "icono-campo")}Distrito</label><select class="input" id="b-distrito" name="distrito" aria-describedby="b-distrito-ayuda"><option value="">Todos</option>
        ${op.distritos.filter((d) => d !== "otros").map((d) => `<option value="${esc(d)}">${esc(titulo(d))}</option>`).join("")}</select>
        <small class="ayuda-filtro" id="b-distrito-ayuda">Uno a la vez · «Todos» busca en Lima</small></div>
      <div class="field optional"><label for="b-max">${icono("moneda", "icono-campo")}Hasta (S/ al mes)</label><input class="input num" id="b-max" name="precio_max" type="number" min="0" step="100" placeholder="Sin límite"></div>
      <div class="field optional"><label for="b-dorm">${icono("cama", "icono-campo")}Dormitorios</label><select class="input" id="b-dorm" name="dormitorios_min"><option value="">Cualquiera</option>${opcionesMin}</select></div>
      <div class="field optional"><label for="b-orden">${icono("lista", "icono-campo")}Ordenar</label><select class="input" id="b-orden" name="orden">
        <option value="precio">Precio: menor primero</option><option value="precio_desc">Precio: mayor primero</option>
        <option value="oportunidad">Más baratos de lo esperado</option><option value="area">Mayor área</option><option value="paradero">Más cerca del transporte</option></select></div>
      <button class="btn" type="button" data-mas-filtros aria-expanded="false" aria-controls="mas-filtros">Más filtros</button>
      <span class="spacer"></span>
      <button class="btn primary" type="submit">Buscar</button>
    </form>
    <section class="panel" id="mas-filtros" hidden style="margin-bottom:16px">
      <div class="fields">
        <div class="field"><label for="b-min">${icono("moneda", "icono-campo")}Desde (S/ al mes)</label><input class="input num" id="b-min" name="precio_min" type="number" min="0" step="100"></div>
        <div class="field"><label for="b-banos">${icono("bano", "icono-campo")}Baños</label><select class="input" id="b-banos" name="banos_min"><option value="">Cualquiera</option>${opcionesMin}</select></div>
        <div class="field"><label for="b-amin">${icono("tamano", "icono-campo")}Área mínima (m²)</label><input class="input num" id="b-amin" name="area_min" type="number" min="0" step="5"></div>
        <div class="field"><label for="b-amax">${icono("tamano", "icono-campo")}Área máxima (m²)</label><input class="input num" id="b-amax" name="area_max" type="number" min="0" step="5"></div>
        <div class="field"><label for="b-par">${icono("bus", "icono-campo")}Transporte</label><select class="input" id="b-par" name="paradero_max_m"><option value="">Da igual</option>
          <option value="300">Paradero a 300 m</option><option value="500">Paradero a 500 m</option><option value="1000">Paradero a 1 km</option></select></div>
        <fieldset class="field wide" style="border:0;padding:0;margin:0"><legend class="hint" style="margin-bottom:6px">Debe tener</legend>
          <div class="chips">${op.binarias.map((b) => `<label class="chip"><input type="checkbox" name="amenidades" value="${b}"><span>${esc(ETIQUETAS_AMENIDAD[b])}</span></label>`).join("")}</div>
        </fieldset>
      </div>
    </section>
    <div data-resultados></div>`;
  const form = $(".filters", lienzo), extra = $("#mas-filtros", lienzo), destino = $("[data-resultados]", lienzo);
  let limite = 24, valoracion = null, solicitud = 0;
  const comparados = new Map();
  $("[data-mas-filtros]", lienzo).addEventListener("click", (e) => {
    extra.hidden = !extra.hidden;
    form.classList.toggle("expand", !extra.hidden);
    e.currentTarget.setAttribute("aria-expanded", String(!extra.hidden));
  });

  function filtros() {
    const valor = (sel) => $(sel, lienzo).value;
    const numero = (sel) => (valor(sel) === "" ? null : Number(valor(sel)));
    return {
      distritos: valor("#b-distrito") ? [valor("#b-distrito")] : [], orden: valor("#b-orden"), limite, valoracion,
      precio_max: numero("#b-max"), precio_min: numero("#b-min"), dormitorios_min: numero("#b-dorm"), banos_min: numero("#b-banos"),
      area_min: numero("#b-amin"), area_max: numero("#b-amax"), paradero_max_m: numero("#b-par"),
      amenidades: $$('#mas-filtros input[name="amenidades"]:checked', lienzo).map((c) => c.value),
    };
  }

  // Sin resultados en un distrito: antes de pedir más presupuesto, mostrar vecinos que sí tienen opciones.
  async function sugerirVecinos(parametros, turno) {
    const distrito = parametros.distritos[0];
    const vecinos = await vecinosConOpciones(op.centros, distrito,
      (d) => llamar("/api/buscar", { cuerpo: { ...parametros, distritos: [d], limite: 1 } }).then((x) => x.total));
    const caja = $("[data-vecinos]", destino);
    if (turno !== solicitud || !caja || !vecinos.length) return;
    caja.innerHTML = botonesVecinos(vecinos, distrito, "data-ir-distrito")
      + '<p class="hint">O amplía el presupuesto y quita amenidades.</p>';
    $$("[data-ir-distrito]", caja).forEach((b) => b.addEventListener("click", () => {
      $("#b-distrito", lienzo).value = b.dataset.irDistrito;
      limite = 24; ejecutar();
    }));
  }

  async function ejecutar() {
    const turno = ++solicitud;
    const parametros = filtros();
    destino.setAttribute("aria-busy", "true");
    try {
      const r = await llamar("/api/buscar", { cuerpo: parametros });
      if (turno !== solicitud) return;
      destino.innerHTML = resultadosBusqueda(r, parametros.valoracion, comparados, new Set(op.distritos_poco_confiables || []), parametros.distritos[0]);
      $("[data-hallazgo]", lienzo).textContent = r.total
        ? parametros.valoracion
          ? `${num(r.total)} departamentos en esta categoría con los filtros elegidos.`
          : `${num(r.total)} departamentos con estos filtros · ${num(r.conteos.por_debajo)} tienen un precio pedido por debajo de la estimación.`
        : "Ningún departamento con esta selección de filtros.";
      if (!r.total && parametros.distritos.length === 1 && !parametros.valoracion) sugerirVecinos(parametros, turno);
      $$("[data-valoracion]", destino).forEach((b) => b.addEventListener("click", () => {
        valoracion = b.dataset.valoracion || null; limite = 24; ejecutar();
      }));
      function actualizarComparacion(idParaEnfocar = null) {
        const panel = $("[data-comparacion]", destino);
        panel.innerHTML = panelComparacion(comparados);
        $$("[data-quitar-comparacion]", destino).forEach((b) => b.addEventListener("click", () => {
          const id = b.dataset.quitarComparacion;
          comparados.delete(id);
          actualizarComparacion(id);
        }));
        $$("[data-comparar]", destino).forEach((b) => {
          const seleccionado = comparados.has(b.dataset.comparar);
          b.setAttribute("aria-pressed", String(seleccionado));
          b.textContent = seleccionado ? "Quitar" : "Comparar";
          b.disabled = !seleccionado && comparados.size >= 3;
        });
        if (idParaEnfocar) {
          const boton = $$("[data-comparar]", destino).find((b) => b.dataset.comparar === idParaEnfocar);
          const foco = boton || $("h2", panel);
          if (!boton) foco.tabIndex = -1;
          foco.focus();
        }
      }
      $$("[data-comparar]", destino).forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = b.dataset.comparar;
        if (comparados.has(id)) comparados.delete(id);
        else if (comparados.size < 3) {
          const encontrado = r.resultados.find((x) => x.id === id);
          if (encontrado) comparados.set(id, encontrado);
        }
        actualizarComparacion();
      }));
      actualizarComparacion();
      $("[data-mas]", destino)?.addEventListener("click", () => { limite = Math.min(60, limite + 24); ejecutar(); });
      $$("tr[data-href]", destino).forEach((tr) => tr.addEventListener("click", (e) => { if (!e.target.closest("a, button")) irA(tr.dataset.href); }));
    } catch (err) {
      if (turno !== solicitud) return;
      destino.innerHTML = `<section class="panel"><div class="empty"><p>No pudimos cargar la búsqueda. ${esc(err.message)}</p><button class="btn" type="button" data-reintentar>Reintentar</button></div></section>`;
      $("[data-reintentar]", destino).addEventListener("click", ejecutar);
    } finally {
      if (turno === solicitud) destino.removeAttribute("aria-busy");
    }
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); limite = 24; ejecutar(); });
  extra.addEventListener("change", () => { limite = 24; ejecutar(); });
  ejecutar();
}

function resultadosBusqueda(r, valoracion, comparados, pocoConfiables = new Set(), distritoElegido = null) {
  const total = Object.values(r.conteos).reduce((a, b) => a + b, 0);
  const tarjetas = [["", "Todos", total], ["por_debajo", "Por debajo de la estimación", r.conteos.por_debajo],
    ["en_linea", "Cerca de la estimación", r.conteos.en_linea], ["por_encima", "Por encima de la estimación", r.conteos.por_encima]];
  const pill = (x) => (x.valoracion.startsWith("Por debajo") ? "pos" : x.valoracion.startsWith("Por encima") ? "warn" : "");
  const aviso = distritoElegido && pocoConfiables.has(distritoElegido)
    ? `<div class="aviso-distrito" role="note" style="margin-bottom:12px"><b>⚠ El precio estimado en ${esc(titulo(distritoElegido))} puede no ser exacto</b>
        <span>El equipo de DepaRent ha detectado que en este distrito la estimación no es tan precisa y suele salir más alta que el precio real.
        Por eso muchos anuncios aparecen «por debajo de la estimación» sin serlo: compáralos entre sí.</span></div>`
    : "";
  return `${aviso}
    <div class="counts" role="group" aria-label="Filtrar por relación entre precio pedido y estimación">
      ${tarjetas.map(([k, t, n]) => `<button class="count" type="button" data-valoracion="${k}" aria-pressed="${(valoracion || "") === k}"><span>${t}</span><b>${num(n)}</b></button>`).join("")}
    </div>
    <div data-comparacion aria-live="polite">${panelComparacion(comparados)}</div>
    <section class="panel" aria-label="Resultados">
      <p class="leyenda-diferencia"><span class="pill pos">−%</span> pide menos que lo estimado <span class="pill warn">+%</span> pide más <span class="hint">· es orientativo, no confirma un ahorro</span></p>
      ${r.total ? `<div class="table-wrap"><table class="list-table">
        <thead><tr><th>Departamento</th><th class="n">Área</th><th class="n">Transporte</th><th class="n">Estimación</th><th class="n">Diferencia</th><th class="n">Precio pedido</th><th>Comparar</th></tr></thead>
        <tbody>${r.resultados.map((x) => `<tr data-href="#/anuncio/${x.id}">
          <td><a class="id" href="#/anuncio/${x.id}">${x.nombre ? esc(x.nombre) : `${dorms(x.dormitorios)} · ${banos(x.banos)}`}</a>
            <span class="sub fila-distrito">${icono("ubicacion", "icono-chip")}${esc(titulo(x.distrito))}${x.origen === "Publicado en DepaRent" ? ' <span class="pill pos">En DepaRent</span>' : ""}</span>
            ${x.amenidades.length ? `<span class="sub fila-amenidades">${x.amenidades.map((a) => esc(ETIQUETAS_AMENIDAD[a])).join(" · ")}</span>` : ""}</td>
          <td class="n more" data-label="Área">${num(x.area_total)} m²</td>
          <td class="n more" data-label="Transporte"><span class="con-icono">${icono("bus", "icono-chip")}${num(x.dist_paradero_min_m)} m</span></td>
          <td class="n more" data-label="Estimación">${soles(x.precio_estimado_soles)}${pocoConfiables.has(x.distrito) ? `<span class="marca-poco-confiable" title="El equipo de DepaRent ha detectado que en ${esc(titulo(x.distrito))} la estimación no es tan precisa y suele salir más alta que el precio real.">⚠</span>` : ""}</td>
          <td class="n more" data-label="Diferencia"><span class="pill ${pocoConfiables.has(x.distrito) ? "" : pill(x)}" title="${esc(valoracionSencilla(x.valoracion))}">${pct(x.diferencia_estimado_porcentaje)}</span></td>
          <td class="n key"><b>${soles(x.precio_soles)}</b></td>
          <td class="compare-cell"><button class="btn compare-add" type="button" data-comparar="${esc(x.id)}" aria-pressed="${comparados.has(x.id)}">${comparados.has(x.id) ? "Quitar" : "Comparar"}</button></td></tr>`).join("")}</tbody>
      </table></div>
      <div class="list-foot"><span>1 a ${r.resultados.length} de ${num(r.total)}</span>
        ${r.resultados.length < Math.min(r.total, 60) ? `<button class="btn" type="button" data-mas>Mostrar ${Math.min(24, Math.min(r.total, 60) - r.resultados.length)} más</button>` : ""}</div>`
      : '<div class="empty"><p>Ningún departamento con estos filtros.</p><div data-vecinos><p>Prueba ampliar el presupuesto, quitar amenidades o cambiar el distrito.</p></div></div>'}
      <p class="panel-note">Es una foto del mercado de ese día, no una lista de ofertas vigentes.</p>
      ${notaTecnica(r.aviso)}
    </section>`;
}

function panelComparacion(comparados) {
  const elegidos = [...comparados.values()];
  // Vacío: una sola línea. Así los resultados quedan más arriba.
  if (!elegidos.length) {
    return `<section class="compare-vacio" aria-labelledby="titulo-comparar"><h2 id="titulo-comparar">${icono("lista", "icono-chip")}Compara hasta 3</h2>
      <span class="hint">Pulsa «Comparar» en dos o tres resultados para verlos lado a lado.</span></section>`;
  }
  return `<section class="panel compare-panel" aria-labelledby="titulo-comparar">
    <header><h2 id="titulo-comparar">Compara hasta 3 departamentos</h2><span class="meta">${elegidos.length} de 3 elegidos</span></header>
    <p class="panel-note">Las opciones elegidas permanecen aquí aunque cambies los filtros de búsqueda.</p>
    ${elegidos.length ? `<div class="compare-grid">${elegidos.map((x) => `<article class="compare-card">
      <div class="compare-card-head"><h3>${esc(titulo(x.distrito))} · ${num(x.dormitorios)} dorm.</h3>
        <button class="btn ghost" type="button" data-quitar-comparacion="${esc(x.id)}" aria-label="Quitar departamento de ${esc(titulo(x.distrito))} de la comparación">Quitar</button></div>
      <dl><div><dt>Precio pedido</dt><dd>${soles(x.precio_soles)}</dd></div>
        <div><dt>Estimación del modelo</dt><dd>${soles(x.precio_estimado_soles)}</dd></div>
        <div><dt>Diferencia</dt><dd>${pct(x.diferencia_estimado_porcentaje)}</dd></div>
        <div><dt>Área</dt><dd>${num(x.area_total)} m²</dd></div>
        <div><dt>Paradero</dt><dd>${num(x.dist_paradero_min_m)} m</dd></div></dl>
      <a href="#/anuncio/${esc(x.id)}">Ver ficha</a></article>`).join("")}</div>
      <p class="panel-note">Comparamos precios pedidos de anuncios; la estimación es orientativa y no confirma disponibilidad.</p>`
    : '<p class="hint">Pulsa “Comparar” en dos o tres resultados para verlos lado a lado.</p>'}
  </section>`;
}

/* ---------- Errores ---------- */

export function vistaNoEncontrada(lienzo) {
  lienzo.innerHTML = filaTitulo("Página no encontrada", "La dirección no corresponde a ninguna pantalla de DepaRent.")
    + '<section class="panel"><div class="empty"><a class="btn primary" href="#/">Volver al inicio</a></div></section>';
}

export function vistaError(lienzo, error) {
  lienzo.innerHTML = filaTitulo("No pudimos cargar esta pantalla", esc(error.message))
    + `<section class="panel"><div class="empty"><p>Si trabajas en local, inicia la API con <code>python -m uvicorn api:app --port 8000</code> desde <code>deliveries/week10/code</code>.</p>
      <button class="btn" type="button" data-recargar>Reintentar</button></div></section>`;
  $("[data-recargar]", lienzo).addEventListener("click", () => location.reload());
}
