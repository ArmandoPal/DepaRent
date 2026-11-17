import { llamar, sesion } from "./api.js";
import { escala, panelComparables, ticks } from "./analisis.js";
import { $, esc, num, pct, soles, titulo, conBoton, mensaje, ETIQUETAS_AMENIDAD, enlazarFilas, copiarEnlace, valoracionSencilla, avisoDistritoPocoConfiable } from "./util.js";
import { icono } from "./iconos.js";

const banos = (n) => `${num(n)} ${n === 1 ? "baño" : "baños"}`;
const fecha = (segundos) => new Date(segundos * 1000).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

/* ---------- Ficha de un anuncio: ¿vale lo que piden? ---------- */

export async function vistaAnuncio(lienzo, params, id) {
  lienzo.innerHTML = `<section class="panel object-head"><div class="cover" aria-hidden="true"></div><div><h1><span class="skeleton">Cargando anuncio</span></h1></div></section>`;
  const conCuenta = Boolean(sesion());
  // Con cuenta se sabe si ya está guardado; si la lista falla, la ficha se muestra igual.
  const [f, guardados] = await Promise.all([llamar(`/api/anuncios/${id}`), conCuenta ? llamar("/api/guardados").catch(() => null) : null]);
  let guardado = Boolean(guardados?.some((g) => g.id === id));
  const x = f.anuncio, v = f.vivienda, p = f.precio;
  const nombre = x.nombre || `${num(v.dormitorios)} dorm. · ${banos(v.banos)} en ${titulo(x.distrito)}`;
  const origen = f.publicacion
    ? `publicado en DepaRent por ${esc(f.publicacion.propietario)} el ${fecha(f.publicacion.desde)}`
    : `anuncio de ${f.original ? esc(f.original.portal) : "un portal"}${f.original ? `, captura del ${fecha(Date.parse(f.original.capturado + "T12:00:00") / 1000)}` : ""}`;
  const clasePill = x.valoracion.startsWith("Por debajo") ? "pos" : x.valoracion.startsWith("Por encima") ? "warn" : "";
  lienzo.innerHTML = `
    <p style="margin-bottom:12px"><a class="card-link" href="#/buscar">Buscar departamentos</a></p>
    <section class="panel object-head">
      <div class="cover" aria-hidden="true">${num(v.area_total)}<br>m²</div>
      <div><h1>${esc(nombre)}</h1><p class="meta">${icono("ubicacion", "icono-chip")}${esc(titulo(x.distrito))} · ${origen}</p></div>
      <div class="title-actions">
        ${f.publicacion?.es_mio ? "" : conCuenta
          ? `<button class="btn ${guardado ? "primary" : ""}" type="button" data-guardar aria-pressed="${guardado}">${guardado ? "Guardado" : "Guardar"}</button>`
          : `<a class="btn" href="#/ingresar?siguiente=${encodeURIComponent(`#/anuncio/${id}`)}">Guardar</a>`}
        <button class="btn" type="button" data-copiar>Copiar enlace</button>
        ${f.original ? `<a class="btn primary" href="${esc(f.original.url)}" target="_blank" rel="noopener noreferrer nofollow">Ver el anuncio original en ${esc(f.original.portal)}</a>` : ""}
        ${f.publicacion?.es_mio ? `<a class="btn primary" href="#/mis-departamentos/${f.publicacion.departamento_id}">Editar mi departamento</a>`
          : f.publicacion ? '<a class="btn primary" href="#contacto" data-ir-contacto>Me interesa</a>' : ""}
      </div>
    </section>
    <div class="grid stretch">
      ${resumenAnuncio(f, f.evidencia_distrital?.poco_confiable ? "" : clasePill)}

      <section class="panel span-6" aria-labelledby="t-carac">
        <header><h2 id="t-carac">${icono("casa", "icono-titulo")}Características</h2></header>
        <div class="ficha-datos">
          ${[["tamano", "Área", `${num(v.area_total)} m²`], ["cama", "Dormitorios", num(v.dormitorios)], ["bano", "Baños", num(v.banos)],
            ["auto", "Estacionamientos", v.estacionamientos == null ? null : num(v.estacionamientos)],
            ["edificio", "Antigüedad", v.antiguedad == null ? null : `${num(v.antiguedad)} años`],
            ["moneda", "Mantenimiento", v.mantenimiento == null ? null : soles(v.mantenimiento)]]
            .map(([ic, k, val]) => `<div class="ficha-dato">${icono(ic, "icono-titulo")}<div><span class="hint">${k}</span>${val == null ? '<b class="dash">No dice</b>' : `<b class="num">${val}</b>`}</div></div>`).join("")}
        </div>
        <div class="reco-amenidades ficha-amenidades">${x.amenidades.length
          ? x.amenidades.map((a) => `<span class="etiqueta">${icono("estrella", "icono-chip")}${esc(ETIQUETAS_AMENIDAD[a])}</span>`).join("")
          : '<span class="etiqueta vacia">El anuncio no menciona amenidades</span>'}</div>
      </section>

      <section class="panel span-6 ruler" aria-labelledby="t-justo">
        <header><h2 id="t-justo">${icono("grafico", "icono-titulo")}Frente a los parecidos</h2><span class="meta">Puntos: parecidos · barra: rango · línea naranja: lo que piden</span></header>
        ${reglaAnuncio(f)}
        <p class="panel-note">${lecturaPrecio(f)}</p>
      </section>

      <section class="panel span-3" aria-labelledby="t-transporte">
        <header><h2 id="t-transporte">${icono("bus", "icono-titulo")}Transporte</h2><span class="pill">${esc(f.acceso.nivel)}</span></header>
        <p class="big-figure num">${num(f.acceso.dist_paradero_min_m)} m</p>
        <p class="hint">al paradero más cercano · ${f.acceso.paraderos_500m} a 500 m</p>
        <div class="bullet" role="img" aria-label="Más cerca que el ${num(f.acceso.porcentaje_anuncios_mas_lejos, 1)}% de los anuncios"><span style="width:${f.acceso.porcentaje_anuncios_mas_lejos}%"></span></div>
        <p class="hint">Más cerca que el ${num(f.acceso.porcentaje_anuncios_mas_lejos, 0)}% de los anuncios</p>
        <details class="mas"><summary>¿Cómo lo medimos?</summary>
          <p>Alta: paradero a 300 m o menos y más paraderos cerca que la mitad de los anuncios. Baja: el más cercano está a más de 500 m. No mostramos el mapa para no revelar la ubicación.</p></details>
      </section>

      <section class="panel span-3" aria-labelledby="t-distrito">
        <header><h2 id="t-distrito">${icono("ubicacion", "icono-titulo")}${esc(titulo(x.distrito))}</h2><span class="pill ${f.tendencia.tendencia === "Al alza" ? "main" : ""}">${esc(f.tendencia.tendencia)} · ${pct(f.tendencia.cambio_porcentaje)}</span></header>
        <p class="big-figure num">${soles(p.baseline_distrital_soles)}</p>
        <p class="hint">alquiler típico del distrito</p>
        <details class="mas"><summary>¿Qué significa «${esc(f.tendencia.tendencia.toLowerCase())}»?</summary>
          <p>${f.tendencia.serie_propia ? "Según el BCRP, en este distrito" : "Según el promedio de Lima del BCRP (el distrito no tiene datos propios),"} el precio por m² cambiaría ${pct(f.tendencia.cambio_porcentaje)} el próximo año.
            Es contexto del mercado, no un pronóstico de este alquiler. Calculamos con ${num(p.anuncios_entrenamiento_distrito)} departamentos del distrito.</p></details>
      </section>

      <div class="span-6">${panelComparables(f.perfil).replace("Los 8 anuncios más parecidos", "Anuncios parecidos")}</div>

      <section class="panel span-6" id="contacto" aria-labelledby="t-contacto">
        <header><h2 id="t-contacto">${f.publicacion?.es_mio ? "Contacto de interesados" : f.publicacion ? `Escríbele a ${esc(f.publicacion.propietario)}` : "Contacto"}</h2></header>
        ${f.publicacion?.es_mio ? `<p>Este es tu departamento: así lo ven los inquilinos. Ellos te escriben desde aquí y sus mensajes te llegan a tu cuenta.</p>
              <p style="margin-top:12px"><a class="btn" href="#/mis-departamentos/${f.publicacion.departamento_id}?ver=interesados">Ver mis interesados</a></p>`
          : f.publicacion ? formularioInteres(f.publicacion.propietario)
          : f.original ? `<p>Este anuncio viene de ${esc(f.original.portal)} (captura del ${fecha(Date.parse(f.original.capturado + "T12:00:00") / 1000)}) y puede ya no estar disponible.
              La dirección y el contacto están en el anuncio original; DepaRent no los guarda ni los muestra.</p>
              <p style="margin-top:12px"><a class="btn" href="${esc(f.original.url)}" target="_blank" rel="noopener noreferrer nofollow">Ver el anuncio original en ${esc(f.original.portal)}</a></p>`
          : "<p>Este anuncio viene de un portal inmobiliario y DepaRent no guarda su dirección ni el contacto de su propietario.</p>"}
      </section>
    </div>
    <p class="panel-note">${esc(f.aviso)}</p>`;

  $("[data-copiar]", lienzo).addEventListener("click", (e) => copiarEnlace(e.currentTarget));
  const botonGuardar = $("[data-guardar]", lienzo);
  botonGuardar?.addEventListener("click", async () => {
    try {
      const lista = await conBoton(botonGuardar, guardado ? "Quitando…" : "Guardando…",
        () => llamar(`/api/guardados/${encodeURIComponent(id)}`, { metodo: guardado ? "DELETE" : "POST" }));
      guardado = lista.some((g) => g.id === id);
      botonGuardar.textContent = guardado ? "Guardado" : "Guardar";
      botonGuardar.setAttribute("aria-pressed", String(guardado));
      botonGuardar.classList.toggle("primary", guardado);
      botonGuardar.title = guardado ? "Está en tus guardados (Recomendados para ti → Guardados). Pulsa para quitarlo." : "";
    } catch (err) {
      botonGuardar.textContent = "No se pudo guardar";
      botonGuardar.title = err.message;
    }
  });
  enlazarFilas(lienzo);
  $("[data-ir-contacto]", lienzo)?.addEventListener("click", (e) => {
    e.preventDefault();
    $("#contacto", lienzo).scrollIntoView({ block: "start" });
    $("#i-nombre", lienzo)?.focus({ preventScroll: true });
  });
  const form = $(".interes-form", lienzo);
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await conBoton($("button", form), "Enviando…", () => llamar(`/api/anuncios/${id}/interes`, { cuerpo: Object.fromEntries(new FormData(form)) }));
      form.outerHTML = `<p class="toast">Listo. ${esc(f.publicacion.propietario)} verá tu mensaje y tu correo en su cuenta de DepaRent para responderte.</p>`;
    } catch (err) {
      mensaje($(".form-msg", form), err.message);
    }
  });
}

function formularioInteres(propietario) {
  return `<p class="hint" style="margin-bottom:14px">${esc(propietario)} verá tu nombre, tu correo y tu mensaje en su cuenta. No compartimos tu correo con nadie más.</p>
    <form class="interes-form fields" novalidate>
      <div class="field"><label for="i-nombre">Tu nombre</label><input class="input" id="i-nombre" name="nombre" autocomplete="name" required></div>
      <div class="field"><label for="i-email">Tu correo</label><input class="input" id="i-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field wide"><label for="i-mensaje">Mensaje</label>
        <textarea class="input" id="i-mensaje" name="mensaje" rows="3" maxlength="600" required style="height:auto;padding:10px 12px">Hola, me interesa el departamento. ¿Sigue disponible?</textarea></div>
      <div class="field wide"><div style="display:flex;justify-content:flex-end"><button class="btn primary" type="submit">Enviar mensaje</button></div></div>
      <div class="form-msg wide" role="alert"></div>
    </form>`;
}

// Arriba y en grande: lo que piden, si es más o menos que lo estimado y dónde cae en el rango.
function resumenAnuncio(f, clasePill) {
  const x = f.anuncio, p = f.precio;
  const min = Math.min(p.limite_inferior_soles, x.precio_soles), max = Math.max(p.limite_superior_soles, x.precio_soles);
  const pos = (valor) => Math.min(100, Math.max(0, ((valor - min) / (max - min)) * 100));
  const dif = x.diferencia_estimado_porcentaje;
  const frase = Math.abs(dif) < 1 ? "Pide lo mismo que estima el modelo"
    : `Pide ${num(Math.abs(dif), 0)}% ${dif < 0 ? "menos" : "más"} que lo que estima el modelo`;
  return `<section class="panel span-6 resumen-precio" aria-labelledby="t-pide">
    ${avisoDistritoPocoConfiable(f.evidencia_distrital)}
    <div class="rp-principal">
      <p class="rp-etiqueta" id="t-pide">${icono("moneda", "icono-titulo")}Piden</p>
      <p class="rp-valor num">${soles(x.precio_soles)}<small>al mes</small></p>
      <p class="rp-veredicto"><span class="pill ${clasePill}">${esc(valoracionSencilla(x.valoracion))}</span></p>
      <p class="hint">${f.publicacion ? `Precio ${esc(f.publicacion.escenario.toLowerCase())} elegido por su propietario` : "Precio pedido en el portal, no de contrato"}</p>
    </div>
    <div class="rp-rango">
      <p class="rp-etiqueta">${frase}</p>
      <div class="rango-barra rango-anuncio" role="img" aria-label="Rango estimado de ${soles(p.limite_inferior_soles)} a ${soles(p.limite_superior_soles)}; estimado ${soles(p.precio_estimado_soles)}; piden ${soles(x.precio_soles)}">
        <span class="rango-tramo" style="left:${pos(p.limite_inferior_soles)}%;width:${pos(p.limite_superior_soles) - pos(p.limite_inferior_soles)}%"></span>
        <span class="rango-marca estimado" style="left:${pos(p.precio_estimado_soles)}%"></span>
        <span class="rango-marca" style="left:${pos(x.precio_soles)}%"></span>
      </div>
      <div class="rango-leyenda"><span><i class="punto naranja"></i>Piden ${soles(x.precio_soles)}</span><span><i class="punto negro"></i>El modelo estima ${soles(p.precio_estimado_soles)}</span></div>
      <p class="rp-frase">Rango estimado: ${soles(p.limite_inferior_soles)} a ${soles(p.limite_superior_soles)}.</p>
      <details class="mas"><summary>${icono("info", "icono-btn")}¿Cómo leer esto?</summary>
        <p>La estimación sale de departamentos parecidos del mismo distrito. Un precio más bajo puede deberse a algo que el anuncio no dice (estado, piso, ruido): revisa el anuncio antes de decidir.</p></details>
    </div>
  </section>`;
}

function lecturaPrecio(f) {
  const x = f.anuncio, c = f.perfil;
  const baratos = c.comparables.filter((k) => k["Precio pedido (S/)"] < x.precio_soles).length;
  return `Pide ${soles(x.precio_soles)}: ${baratos} de sus ${c.comparables.length} departamentos más parecidos piden menos, y el modelo estima ${soles(f.precio.precio_estimado_soles)}. `
    + "Tómalo como una referencia, no como una tasación.";
}

// La regla de precios del inquilino: el precio pedido (único dato en naranja) frente a los parecidos y al modelo.
function reglaAnuncio(f) {
  const x = f.anuncio, p = f.precio;
  const comps = f.perfil.comparables.map((c) => c["Precio pedido (S/)"]).filter((v) => v != null);
  const todos = [...comps, p.limite_inferior_soles, p.limite_superior_soles, x.precio_soles];
  const min = Math.min(...todos) * 0.94, max = Math.max(...todos) * 1.04;
  const compacto = window.innerWidth < 700;
  const W = compacto ? 360 : 640, L = compacto ? 8 : 132, R = W - 16, ex = escala(min, max, L, R);
  const fila = compacto ? { comparables: 62, rango: 116 } : { comparables: 66, rango: 112 };
  const ejeY = fila.rango + 52, H = ejeY + 8;
  const etiqueta = (texto, y) => compacto ? `<text class="lbl" x="0" y="${y - 16}">${texto}</text>` : `<text class="lbl" x="0" y="${y + 4}">${texto}</text>`;
  const xPedido = ex(x.precio_soles), xEstimado = ex(p.precio_estimado_soles);
  const anclaPedido = xPedido > (L + R) / 2 ? "end" : "start", dxPedido = anclaPedido === "end" ? -6 : 6;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Precio pedido ${soles(x.precio_soles)} frente a ${comps.length} departamentos parecidos y al rango probable">
    ${ticks(min, max, compacto ? 3 : 4).map((v) => `<line x1="${ex(v)}" x2="${ex(v)}" y1="40" y2="${ejeY - 18}" stroke="#e7e6e2" stroke-dasharray="2 3"/><text x="${ex(v)}" y="${ejeY}" text-anchor="middle">${soles(v)}</text>`).join("")}
    ${etiqueta(`${comps.length} parecidos`, fila.comparables)}${etiqueta("Rango probable", fila.rango)}
    ${comps.map((v) => `<circle cx="${ex(v)}" cy="${fila.comparables}" r="5" fill="#111" fill-opacity="0.28"><title>${soles(v)}</title></circle>`).join("")}
    <rect x="${ex(p.limite_inferior_soles)}" y="${fila.rango - 4}" width="${ex(p.limite_superior_soles) - ex(p.limite_inferior_soles)}" height="8" rx="4" fill="#d9d7d2"/>
    <line x1="${xEstimado}" x2="${xEstimado}" y1="${fila.rango - 12}" y2="${fila.rango + 12}" stroke="#111" stroke-width="2"/>
    <text x="${xEstimado}" y="${fila.rango + 28}" text-anchor="middle">Estimación</text>
    <line x1="${xPedido}" x2="${xPedido}" y1="34" y2="${fila.rango + 12}" stroke="var(--accent)" stroke-width="2"/>
    <text class="main-lbl" x="${xPedido + dxPedido}" y="24" text-anchor="${anclaPedido}">Pide ${soles(x.precio_soles)}</text>
  </svg>`;
}
