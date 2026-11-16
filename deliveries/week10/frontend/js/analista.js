import { llamar, obtenerOpciones } from "./api.js";
import { esc, num, soles, titulo } from "./util.js";

/* Panel de análisis: KPIs del producto de datos. Solo lo ven las cuentas con rol "analista"
   (correos en DEPARENT_ANALISTAS); la API responde 403 a cualquier otra cuenta. */

const porcentaje = (v, dec = 1) => (v == null ? "—" : `${num(v, dec)}%`);
const cuentasNoSimuladas = (n) => `${num(n)} ${Number(n) === 1 ? "cuenta no simulada" : "cuentas no simuladas"}`;
const kpi = (etiqueta, valor, nota, principal = false) => `<div class="kpi"><p class="kpi-label">${etiqueta}</p>
  <p class="kpi-value num ${principal ? "is-main" : ""}">${valor}</p>${nota ? `<p class="delta">${nota}</p>` : ""}</div>`;
const NOMBRES_ALTERNATIVA = { azar: "elegir al azar", buscador_area: "ordenar por área", buscador_oportunidad: "ordenar por oportunidad", buscador_precio: "ordenar por precio" };
let temporizador = null;
let ultimaFirma = null;
let ultimoLienzo = null;

function etapa(label, value, total) {
  const n = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const width = total > 0 && n > 0 ? Math.min(100, Math.max(2, 100 * n / total)) : 0;
  return `<div class="etapa"><span>${esc(label)}</span><div class="etapa-track" role="img" aria-label="${esc(label)}: ${num(n)}"><i style="width:${width}%"></i></div><b class="num">${num(n)}</b></div>`;
}

function barrasError(rows, maxValue) {
  return rows.map((row) => {
    const model = Math.max(0, Number(row.modelo.mae_soles) || 0);
    const base = Math.max(0, Number(row.baseline_distrital.mae_soles) || 0);
    return `<div class="error-group" role="group" aria-label="${esc(row.captura)}: error del modelo ${soles(model)}, mediana distrital ${soles(base)}">
      <div class="error-columns"><span class="error-model" style="height:${100 * model / maxValue}%" title="Modelo: ${soles(model)}"></span>
      <span class="error-base" style="height:${100 * base / maxValue}%" title="Mediana del distrito: ${soles(base)}"></span></div>
      <b>${esc(row.captura)}</b></div>`;
  }).join("");
}

const TEMAS_SUPERVISION = [
  ["uso", "Uso"],
  ["publicaciones", "Publicaciones"],
  ["datos", "Datos"],
  ["modelo", "Modelo"],
  ["recomendador", "Recomendador"],
];

function lecturaSupervision(tema, p, m, d, r) {
  const ultima = m.validaciones.at(-1);
  const simulacion = p.simulacion?.activa;
  let mensajes;
  switch (tema) {
    case "publicaciones":
      mensajes = [
        `Hay <strong>${num(p.departamentos_publicados)} departamentos publicados</strong> de ${num(p.departamentos)} registrados. ${p.departamentos === 0
          ? "Prueben primero el recorrido de registro de un departamento."
          : p.departamentos_publicados === 0 ? "Prueben el paso de publicación con un caso de muestra." : "Revisen las publicaciones antes de presentarlas como disponibles."}`,
        `${num(p.publicados_con_interes)} publicaciones vigentes recibieron mensajes desde su publicación actual. Hay ${num(p.mensajes_interesados)} mensajes en el historial completo. ${p.departamentos_publicados > 0 && p.publicados_con_interes === 0
          ? "Conviene probar el formulario de contacto; este dato no explica por sí solo por qué faltan consultas." : ""}`,
        "No se registran alquileres cerrados ni ingresos; este panel no puede calcular ventas o rentabilidad.",
      ];
      break;
    case "datos":
      mensajes = [
        `La captura de anuncios es del <strong>${esc(d.captura_texto)}</strong> y tiene ${num(d.dias_desde_captura)} días. ${d.dias_desde_captura > 7
          ? "Antes de mostrar los anuncios como actuales, intenten actualizar la captura o destaquen su fecha." : "Muestren siempre la fecha de la captura al explicar la búsqueda."}`,
        `De ${num(d.anuncios_en_captura)} anuncios descargados, ${num(d.validos)} pasaron la limpieza y ${num(d.en_la_app)} aparecen en la búsqueda. Estos conteos describen ese corte de datos.`,
        "El precio y la disponibilidad de un anuncio deben confirmarse fuera de la aplicación antes de tomar una decisión.",
      ];
      break;
    case "modelo":
      mensajes = ultima ? [
        `La última evaluación guardada es del <strong>${esc(ultima.captura)}</strong>, con ${num(ultima.evaluados)} anuncios. El error medio del precio es ${soles(ultima.modelo.mae_soles)}; cuanto menor, mejor.`,
        `El rango cubrió ${porcentaje(ultima.cobertura_rango_porcentaje)} en esa evaluación, frente al objetivo de ${porcentaje(ultima.cobertura_objetivo_porcentaje, 0)}. ${ultima.cobertura_rango_porcentaje < ultima.cobertura_objetivo_porcentaje
          ? "Está por debajo del objetivo: expliquen esta limitación al presentar." : "Ese resultado corresponde a esta muestra; no garantiza la cobertura de anuncios futuros."}`,
        "Estas métricas proceden de evaluaciones guardadas. Una nueva visita o cuenta no vuelve a evaluar el modelo.",
      ] : [
        "No hay una validación posterior disponible para resumir.",
        "El panel no puede afirmar la calidad futura del modelo sin una nueva evaluación con anuncios posteriores.",
      ];
      break;
    case "recomendador":
      mensajes = r ? [
        `El recomendador se evaluó con <strong>${num(r.perfiles_evaluados)} perfiles de prueba</strong>. La precisión en las primeras 12 opciones fue ${porcentaje(100 * r.recomendador.precision, 0)}.`,
        `El cumplimiento de presupuesto, dormitorios y distritos fue ${porcentaje(100 * r.recomendador.cumplimiento, 0)} en esa evaluación.`,
        "Son perfiles sintéticos: todavía hace falta comprobar con personas si las opciones resultan útiles y se entienden sus motivos.",
      ] : [
        "No se cargó la evaluación del recomendador en esta consulta.",
        "Prueben recomendaciones con perfiles concretos y registren si las personas comprenden por qué aparece cada opción.",
      ];
      break;
    default:
      mensajes = [
        simulacion
          ? `Esta base tiene <strong>${num(p.simulacion.usuarios_simulados)} cuentas simuladas</strong> y ${cuentasNoSimuladas(p.simulacion.usuarios_reales)}. No representan visitas ni clientes captados.`
          : `Hay <strong>${num(p.usuarios)} cuentas</strong> y ${num(p.usuarios_nuevos_7_dias)} se crearon en los últimos 7 días. Una cuenta no equivale a una visita: las visitas anónimas no se cuentan aquí.`,
        `${num(p.perfiles_completados)} personas completaron el cuestionario y ${num(p.usuarios_con_perfil_y_guardados)} de ellas guardaron algún departamento. ${p.usuarios > 0 && p.perfiles_completados === 0
          ? "Prueben si el camino hacia el cuestionario se entiende." : p.perfiles_completados > 0 && p.usuarios_con_perfil_y_guardados === 0
            ? "Prueben si las recomendaciones y la acción de guardar se entienden." : "Usen estos pasos para observar dónde se detienen los usuarios."}`,
        "Los conteos de uso se consultan de nuevo cada 10 segundos mientras este panel está abierto.",
      ];
  }
  return `<ul>${mensajes.map((mensaje) => `<li>${mensaje}</li>`).join("")}</ul>`;
}

const SERIES_ACTIVIDAD = [
  ["todas", "Vista conjunta"],
  ["cuentas", "Cuentas"],
  ["departamentos", "Departamentos"],
  ["publicaciones", "Publicaciones"],
  ["mensajes", "Mensajes"],
  ["guardados", "Guardados"],
];
const numeroSeguro = (valor) => Math.max(0, Number(valor) || 0);
const fechaCorta = (fecha) => typeof fecha === "string" && fecha.length >= 10 ? `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}` : "";

function graficoActividad(filas, seleccion, simulacionActiva) {
  if (!filas?.length) return '<div class="empty">Aún no hay una serie diaria para mostrar.</div>';
  const totalCuentas = (fila) => numeroSeguro(fila.cuentas_simuladas) + numeroSeguro(fila.cuentas_reales);
  const opciones = {
    todas: [
      ["Cuentas", totalCuentas, "#111111"],
      ["Publicaciones vigentes", (f) => numeroSeguro(f.publicaciones_vigentes), "#c2510a"],
      ["Mensajes", (f) => numeroSeguro(f.mensajes), "#686868"],
    ],
    cuentas: simulacionActiva ? [
      ["Cuentas simuladas", (f) => numeroSeguro(f.cuentas_simuladas), "#c2510a"],
      ["Cuentas no simuladas", (f) => numeroSeguro(f.cuentas_reales), "#111111"],
    ] : [["Cuentas", (f) => numeroSeguro(f.cuentas_reales), "#111111"]],
    departamentos: [["Departamentos actuales por fecha de registro", (f) => numeroSeguro(f.departamentos_registrados), "#111111"]],
    publicaciones: [["Publicaciones vigentes por fecha", (f) => numeroSeguro(f.publicaciones_vigentes), "#c2510a"]],
    mensajes: [["Mensajes recibidos", (f) => numeroSeguro(f.mensajes), "#111111"]],
    guardados: [["Departamentos guardados", (f) => numeroSeguro(f.guardados), "#c2510a"]],
  };
  const series = opciones[seleccion] || opciones.todas;
  const w = 760, h = 270, left = 54, right = 20, top = 20, bottom = 40;
  const plotW = w - left - right, plotH = h - top - bottom;
  const maximo = Math.max(1, ...series.flatMap(([, valor]) => filas.map(valor)));
  const x = (indice) => left + plotW * indice / Math.max(1, filas.length - 1);
  const y = (valor) => top + plotH * (1 - valor / maximo);
  const rejilla = [0, 0.5, 1].map((fraccion) => {
    const alto = y(maximo * fraccion);
    return `<line x1="${left}" y1="${alto}" x2="${w - right}" y2="${alto}" stroke="#dedbd7" stroke-dasharray="3 4"/>
      <text x="${left - 9}" y="${alto + 4}" text-anchor="end" class="chart-axis">${num(Math.round(maximo * fraccion))}</text>`;
  }).join("");
  const fechas = [...new Set([0, Math.floor((filas.length - 1) / 2), filas.length - 1])].map((indice) =>
    `<text x="${x(indice)}" y="${h - 10}" text-anchor="${indice === 0 ? "start" : indice === filas.length - 1 ? "end" : "middle"}" class="chart-axis">${esc(fechaCorta(filas[indice].fecha))}</text>`).join("");
  const trazos = series.map(([label, valor, color]) => {
    const puntos = filas.map((fila, indice) => `${x(indice).toFixed(1)},${y(valor(fila)).toFixed(1)}`).join(" ");
    const fin = filas.at(-1);
    return `<polyline points="${puntos}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${filas.map((fila, indice) => `<circle cx="${x(indice)}" cy="${y(valor(fila))}" r="7" fill="transparent">
        <title>${esc(label)}: ${num(valor(fila))} el ${esc(fechaCorta(fila.fecha))}</title></circle>`).join("")}
      <circle cx="${x(filas.length - 1)}" cy="${y(valor(fin))}" r="4" fill="${color}">
        <title>${esc(label)}: ${num(valor(fin))} el ${esc(fechaCorta(fin.fecha))}</title></circle>`;
  }).join("");
  return `<div class="chart-legend">${series.map(([label, , color]) => `<span><i style="background:${color}"></i>${esc(label)}</span>`).join("")}</div>
    <svg class="business-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Serie diaria de ${esc(series.map(([label]) => label).join(", "))}, del ${esc(fechaCorta(filas[0].fecha))} al ${esc(fechaCorta(filas.at(-1).fecha))}">
      ${rejilla}${fechas}${trazos}
    </svg>`;
}

function tablaActividad(filas) {
  return `<details class="chart-details" data-detalle="actividad"><summary>Ver los datos diarios en tabla</summary>
    <div class="table-wrap"><table class="list-table">
      <thead><tr><th>Fecha</th><th class="n">Cuentas simuladas</th><th class="n">Cuentas no simuladas</th><th class="n">Departamentos actuales</th><th class="n">Publicaciones vigentes</th><th class="n">Mensajes</th><th class="n">Guardados</th></tr></thead>
      <tbody>${filas.map((fila) => `<tr><td>${esc(fila.fecha)}</td><td class="n">${num(fila.cuentas_simuladas)}</td><td class="n">${num(fila.cuentas_reales)}</td>
        <td class="n">${num(fila.departamentos_registrados)}</td><td class="n">${num(fila.publicaciones_vigentes)}</td>
        <td class="n">${num(fila.mensajes)}</td><td class="n">${num(fila.guardados)}</td></tr>`).join("")}</tbody>
    </table></div></details>`;
}

function graficoPareto(filas, simulacionActiva) {
  const ordenadas = [...(filas || [])].filter((fila) => numeroSeguro(fila.departamentos) > 0)
    .sort((a, b) => b.departamentos - a.departamentos);
  const total = ordenadas.reduce((suma, fila) => suma + numeroSeguro(fila.departamentos), 0);
  if (!total) return '<div class="empty">Aún no hay publicaciones vigentes para distribuir por distrito.</div>';
  const visibles = ordenadas.slice(0, 7).map((fila) => ({
    nombre: titulo(fila.distrito), cantidad: numeroSeguro(fila.departamentos),
    simulados: numeroSeguro(fila.simulados), reales: numeroSeguro(fila.reales),
  }));
  const otros = ordenadas.slice(7).reduce((suma, fila) => suma + numeroSeguro(fila.departamentos), 0);
  if (otros) visibles.push({
    nombre: "Otros distritos", cantidad: otros,
    simulados: ordenadas.slice(7).reduce((suma, fila) => suma + numeroSeguro(fila.simulados), 0),
    reales: ordenadas.slice(7).reduce((suma, fila) => suma + numeroSeguro(fila.reales), 0),
  });
  const w = 760, h = 300, left = 55, right = 55, top = 26, bottom = 76;
  const plotW = w - left - right, plotH = h - top - bottom, paso = plotW / visibles.length;
  const maximo = Math.max(...visibles.map((fila) => fila.cantidad), 1);
  let acumulado = 0;
  const puntos = visibles.map((fila, indice) => {
    acumulado += fila.cantidad;
    return `${(left + paso * (indice + 0.5)).toFixed(1)},${(top + plotH * (1 - acumulado / total)).toFixed(1)}`;
  });
  const barras = visibles.map((fila, indice) => {
    const centro = left + paso * (indice + 0.5);
    const alto = plotH * fila.cantidad / maximo;
    const corto = fila.nombre.length > 14 ? fila.nombre.slice(0, 13) + "…" : fila.nombre;
    const altoReal = simulacionActiva ? alto * fila.reales / fila.cantidad : 0;
    return `<g><title>${esc(fila.nombre)}: ${num(fila.cantidad)} publicaciones${simulacionActiva ? `, ${num(fila.simulados)} simuladas y ${num(fila.reales)} ${fila.reales === 1 ? "no simulada" : "no simuladas"}` : ""}</title>
      <rect x="${centro - paso * 0.3}" y="${top + plotH - alto}" width="${paso * 0.6}" height="${alto}" rx="3" fill="#c2510a"/>
      ${altoReal ? `<rect x="${centro - paso * 0.3}" y="${top + plotH - alto}" width="${paso * 0.6}" height="${altoReal}" fill="#111111"/>` : ""}
      </g>
      <text x="${centro}" y="${top + plotH - alto - 7}" text-anchor="middle" class="chart-axis">${num(fila.cantidad)}</text>
      <text x="${centro}" y="${h - 47}" text-anchor="middle" class="chart-axis">${esc(corto)}</text>`;
  }).join("");
  const acumuladoFinal = visibles.map((fila, indice) => {
    const porcentajeAcumulado = Math.round(100 * visibles.slice(0, indice + 1).reduce((suma, item) => suma + item.cantidad, 0) / total);
    return `<tr><td>${esc(fila.nombre)}</td><td class="n">${num(fila.cantidad)}</td>
      ${simulacionActiva ? `<td class="n">${num(fila.simulados)}</td><td class="n">${num(fila.reales)}</td>` : ""}
      <td class="n">${porcentaje(porcentajeAcumulado, 0)}</td></tr>`;
  }).join("");
  return `<div class="chart-legend"><span><i style="background:#c2510a"></i>${simulacionActiva ? "Simuladas" : "Publicaciones vigentes"}</span>
      ${simulacionActiva ? '<span><i style="background:#111111"></i>No simuladas</span>' : ""}
      <span><i style="background:#686868"></i>Porcentaje acumulado</span></div>
    <svg class="business-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Pareto de ${num(total)} publicaciones vigentes por distrito">
      <line x1="${left}" y1="${top + plotH}" x2="${w - right}" y2="${top + plotH}" stroke="#aaa"/>
      ${barras}
      <polyline points="${puntos.join(" ")}" fill="none" stroke="#686868" stroke-width="3" stroke-linejoin="round"/>
      ${puntos.map((punto) => {
        const [cx, cy] = punto.split(",");
        return `<circle cx="${cx}" cy="${cy}" r="4" fill="#686868"/>`;
      }).join("")}
      <text x="${w - right + 8}" y="${top + 4}" class="chart-axis">100%</text>
      <text x="${w - right + 8}" y="${top + plotH + 4}" class="chart-axis">0%</text>
    </svg>
    <details class="chart-details" data-detalle="pareto"><summary>Ver distritos y porcentaje acumulado</summary>
      <div class="table-wrap"><table class="list-table"><thead><tr><th>Distrito</th><th class="n">Publicaciones</th>
        ${simulacionActiva ? '<th class="n">Simuladas</th><th class="n">No simuladas</th>' : ""}
        <th class="n">Acumulado</th></tr></thead>
      <tbody>${acumuladoFinal}</tbody></table></div></details>`;
}

function graficoCobertura(filas) {
  const validas = filas.filter((fila) => Number.isFinite(Number(fila.cobertura_rango_porcentaje)));
  if (!validas.length) return '<div class="empty">No hay coberturas guardadas para comparar.</div>';
  return `<div class="coverage-rows">${validas.map((fila) => {
    const valor = Math.max(0, Math.min(100, Number(fila.cobertura_rango_porcentaje)));
    return `<div class="coverage-row"><span>${esc(fila.captura)}</span>
      <div class="coverage-track" role="img" aria-label="${esc(fila.captura)}: cobertura ${porcentaje(valor)}"><i style="width:${valor}%"></i></div>
      <b>${porcentaje(valor)}</b></div>`;
  }).join("")}</div>`;
}

function programarRefresco(lienzo) {
  temporizador = setTimeout(() => {
    if (!lienzo.isConnected || location.hash.split("?")[0] !== "#/analista") return;
    if (document.hidden) return programarRefresco(lienzo);
    vistaAnalista(lienzo);
  }, 10_000);
}

export async function vistaAnalista(lienzo) {
  clearTimeout(temporizador);
  const teniaDatos = Boolean(lienzo.querySelector(".kpis"));
  if (!teniaDatos) lienzo.innerHTML = `<div class="title-row"><div><h1>Panel de análisis</h1><p class="sub"><span class="skeleton">Cargando KPIs</span></p></div></div>`;
  let k, opciones;
  try {
    [k, opciones] = await Promise.all([llamar("/api/kpis"), obtenerOpciones().catch(() => null)]);
  } catch (err) {
    if (err.estado === 401) { location.hash = "#/ingresar"; return; }
    if (err.estado !== 403 && teniaDatos) {
      lienzo.querySelector("[data-refresco-estado]").textContent = "No se pudo actualizar; se muestran los datos de la última consulta.";
      programarRefresco(lienzo);
      return;
    }
    if (err.estado !== 403) throw err;
    lienzo.innerHTML = `<div class="title-row"><div><h1>Panel de análisis</h1></div></div>
      <section class="panel"><div class="empty"><p>Esta sección es solo para el equipo de análisis de DepaRent.</p><a class="btn" href="#/">Volver al inicio</a></div></section>`;
    return;
  }
  const { producto: p, modelo: m, datos: d, recomendador: r } = k;
  const consultado = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  const firma = JSON.stringify(k);
  if (teniaDatos && ultimoLienzo === lienzo && firma === ultimaFirma) {
    lienzo.querySelector("[data-refresco-estado]").textContent =
      `Consultado a las ${consultado} · se consulta cada 10 segundos mientras ves el panel`;
    programarRefresco(lienzo);
    return;
  }
  const ultima = m.validaciones.at(-1);
  const mejora = ultima ? 100 * (1 - ultima.modelo.mae_soles / ultima.baseline_distrital.mae_soles) : null;
  const desactualizado = d.dias_desde_captura > 7;
  const maxDistrito = Math.max(...d.anuncios_por_distrito.map((x) => x.anuncios), 1);
  const maxMae = Math.max(...m.validaciones.map((v) => v.baseline_distrital.mae_soles), m.prueba.baseline_distrital.mae_soles);
  const coberturaPrueba = opciones?.metricas?.intervalo?.cobertura_observada_prueba;
  const filasValidacion = [{ captura: "Prueba de entrenamiento", evaluados: opciones?.metricas?.particiones?.prueba,
    modelo: m.prueba.modelo, baseline_distrital: m.prueba.baseline_distrital,
    cobertura_rango_porcentaje: coberturaPrueba == null ? null : 100 * coberturaPrueba },
    ...m.validaciones];
  const simulacion = p.simulacion?.activa;
  const actividad = p.actividad_diaria || [];
  const serieAnterior = lienzo.querySelector("[data-serie-actividad][aria-pressed='true']")?.dataset.serieActividad || "todas";
  const temaAnterior = lienzo.querySelector("[data-tema-supervision][aria-pressed='true']")?.dataset.temaSupervision || "uso";
  const focoTema = lienzo.contains(document.activeElement) ? document.activeElement?.dataset?.temaSupervision : null;
  const focoSerie = lienzo.contains(document.activeElement) ? document.activeElement?.dataset?.serieActividad : null;
  const focoRecargar = lienzo.contains(document.activeElement) && document.activeElement?.hasAttribute("data-recargar");
  const focoTitulo = lienzo.querySelector(".analyst-dashboard h1") === document.activeElement;
  const focoDetalle = lienzo.contains(document.activeElement) && document.activeElement?.tagName === "SUMMARY"
    ? document.activeElement.closest("[data-detalle]")?.dataset.detalle : null;
  const detallesAbiertos = [...lienzo.querySelectorAll("[data-detalle][open]")].map((detalle) => detalle.dataset.detalle);
  const scrollAnterior = window.scrollY;

  lienzo.innerHTML = `<div class="analyst-dashboard">
    <div class="title-row"><div><h1>Panel de análisis</h1>
      <p class="sub">KPIs del producto de datos · mercado del ${esc(d.captura_texto)} · modelo entrenado con la ${esc(m.entrenado_con)}</p></div>
      <div class="title-actions"><span class="pill ${desactualizado ? "warn" : "pos"}">${desactualizado ? `Datos con ${num(d.dias_desde_captura)} días` : "Datos al día"}</span>
        <span class="meta" data-refresco-estado>Consultado a las ${consultado} · se consulta cada 10 segundos mientras ves el panel</span>
        <button class="btn" type="button" data-recargar>Actualizar ahora</button></div></div>

    ${simulacion ? `<div class="demo-banner" role="note"><strong>Base de demostración.</strong> ${num(p.simulacion.usuarios_simulados)} cuentas simuladas y ${cuentasNoSimuladas(p.simulacion.usuarios_reales)}. Las publicaciones, mensajes y guardados de esta base pueden incluir actividad de ensayo; no son ventas ni clientes captados.</div>` : ""}

    <section class="panel business-panel activity-panel" aria-labelledby="t-actividad">
      <header><h2 id="t-actividad">Actividad diaria de la aplicación</h2><span class="meta">Últimos ${num(actividad.length)} días de esta base</span></header>
      <p>Elige una serie para ver cuentas, departamentos, publicaciones vigentes, mensajes y guardados según sus fechas de registro.</p>
      ${actividad.length ? `<div class="chart-controls" role="group" aria-label="Serie de actividad">
        ${SERIES_ACTIVIDAD.map(([id, label]) => `<button class="btn" type="button" data-serie-actividad="${id}" aria-pressed="${id === serieAnterior}" aria-controls="grafico-actividad">${label}</button>`).join("")}
      </div>` : ""}
      <div class="chart-scroll" id="grafico-actividad" data-grafico-actividad aria-live="polite">
        ${graficoActividad(actividad, serieAnterior, simulacion)}
      </div>
      ${actividad.length ? tablaActividad(actividad) : ""}
      <p class="panel-note">La serie de cuentas separa simuladas y no simuladas. Departamentos y publicaciones muestran los que aún existen, agrupados por fecha de registro o publicación actual. Mensajes incluye el historial de consultas. Ninguna serie cuenta alquileres cerrados.</p>
    </section>

    <section class="panel supervision-panel" aria-labelledby="t-supervision">
      <header><h2 id="t-supervision">Asistente de supervisión</h2><span class="meta">Lectura automática del tablero</span></header>
      <p>Elige qué quieres revisar. La guía usa solo los indicadores disponibles; no responde como un chat ni sustituye una revisión con usuarios.</p>
      <div class="supervision-temas" role="group" aria-label="Tema del asistente de supervisión">
        ${TEMAS_SUPERVISION.map(([id, label]) => `<button class="btn" type="button" data-tema-supervision="${id}" aria-pressed="${id === temaAnterior}" aria-controls="respuesta-supervision">${label}</button>`).join("")}
      </div>
      <div class="supervision-respuesta" id="respuesta-supervision" data-respuesta-supervision aria-live="polite">
        ${lecturaSupervision(temaAnterior, p, m, d, r)}
      </div>
      <p class="panel-note">Los conteos de uso salen de la base. Las evaluaciones del modelo y del recomendador permanecen guardadas hasta que el equipo las repita.</p>
    </section>

    <h2 class="section-title">Uso del producto</h2>
    <div class="kpis kpis-wrap">
      ${kpi("Cuentas en esta base", num(p.usuarios), simulacion
        ? `${num(p.simulacion.usuarios_simulados)} simuladas · ${cuentasNoSimuladas(p.simulacion.usuarios_reales)}`
        : `${num(p.usuarios_nuevos_7_dias)} nuevas en 7 días`, true)}
      ${kpi("Completan el cuestionario", porcentaje(p.tasa_perfil_porcentaje), `${num(p.perfiles_completados)} perfiles de inquilino`)}
      ${kpi("Guardan algún departamento", porcentaje(p.tasa_perfil_a_guardado_porcentaje), `${num(p.usuarios_con_perfil_y_guardados)} de quienes tienen perfil · ${num(p.guardados)} guardados en total`)}
      ${kpi("Departamentos publicados", `${num(p.departamentos_publicados)} <small>de ${num(p.departamentos)}</small>`, `${porcentaje(p.tasa_publicacion_porcentaje)} de los registrados · ${num(p.propietarios)} propietarios`)}
    </div>
    <div class="kpis kpis-wrap" style="margin-top:var(--gap)">
      ${kpi("Mensajes a propietarios", num(p.mensajes_interesados), `${num(p.mensajes_7_dias)} en 7 días`)}
      ${kpi("Publicados que reciben mensajes", porcentaje(p.tasa_publicado_con_interes_porcentaje), `${num(p.publicados_con_interes)} departamentos`)}
      ${kpi("Publican a precio propio", num(p.publicados_a_precio_propio), "en vez de un precio sugerido")}
      ${kpi("Precio publicado vs. esperado", p.diferencia_media_publicado_vs_esperado_porcentaje == null ? "—" : `${p.diferencia_media_publicado_vs_esperado_porcentaje > 0 ? "+" : ""}${num(p.diferencia_media_publicado_vs_esperado_porcentaje, 1)}%`, "promedio de los publicados")}
    </div>

    <section class="panel" style="margin-top:var(--gap)" aria-labelledby="t-flujo">
      <header><h2 id="t-flujo">De registro a contacto</h2><span class="meta">Departamentos registrados en DepaRent</span></header>
      <div class="etapas">
        ${etapa("Registrados", p.departamentos, p.departamentos)}
        ${etapa("Publicados", p.departamentos_publicados, p.departamentos)}
        ${etapa("Publicados con mensajes", p.publicados_con_interes, p.departamentos)}
      </div>
      <p class="panel-note">Cada barra cuenta departamentos, no alquileres cerrados. Los datos cambian al registrar, publicar o recibir un mensaje y el panel los consulta cada 10 segundos mientras está abierto.</p>
    </section>

    <section class="panel business-panel pareto-panel" aria-labelledby="t-pareto">
      <header><h2 id="t-pareto">Publicaciones por distrito</h2><span class="meta">Barras ordenadas y porcentaje acumulado</span></header>
      <div class="chart-scroll">${graficoPareto(p.distritos_publicados, simulacion)}</div>
      <p class="panel-note">Muestra solo departamentos actualmente publicados en esta base. Si la demostración está activa, puede incluir publicaciones de ensayo.</p>
    </section>

    <h2 class="section-title">Calidad del modelo de precio</h2>
    <div class="kpis kpis-wrap">
      ${kpi("Error medio (MAE)", ultima ? soles(ultima.modelo.mae_soles) : "—", ultima ? `Validación del ${esc(ultima.captura)} · ${num(ultima.evaluados)} anuncios` : "", true)}
      ${kpi("Mejor que el baseline", mejora == null ? "—" : `${num(mejora, 0)}%`, ultima ? `menos error que la mediana del distrito (${soles(ultima.baseline_distrital.mae_soles)})` : "")}
      ${kpi("Error porcentual (MAPE)", ultima ? porcentaje(ultima.modelo.mape_porcentaje) : "—", ultima ? `R² ${num(ultima.modelo.r2, 3)}` : "")}
      ${kpi("Cobertura del rango", ultima ? porcentaje(ultima.cobertura_rango_porcentaje) : "—", ultima ? `objetivo ${porcentaje(ultima.cobertura_objetivo_porcentaje, 0)} · MAE ${ultima.cambio_mae_porcentaje > 0 ? "+" : ""}${num(ultima.cambio_mae_porcentaje, 1)}% vs. septiembre` : "")}
    </div>
    <section class="panel" style="margin-top:var(--gap)" aria-labelledby="t-grafico-error">
      <header><h2 id="t-grafico-error">Error medio por captura</h2><span class="meta">Menor es mejor · soles al mes</span></header>
      <div class="error-chart" role="group" aria-label="Comparación del error medio del modelo y la mediana distrital en prueba, octubre y noviembre">
        ${barrasError(filasValidacion, maxMae || 1)}
      </div>
      <p class="panel-note error-chart-note"><span class="leyenda"><i></i>Modelo</span> <span class="leyenda base"><i></i>Mediana distrital</span> · Estas evaluaciones están guardadas; no se recalculan por cada visita.</p>
    </section>
    <section class="panel business-panel coverage-panel" aria-labelledby="t-cobertura">
      <header><h2 id="t-cobertura">Cobertura del rango por evaluación</h2><span class="meta">Porcentaje de anuncios dentro del rango</span></header>
      ${graficoCobertura(filasValidacion)}
      <p class="panel-note">Son evaluaciones guardadas. Compara cada porcentaje con el objetivo declarado para el rango; una captura no garantiza resultados futuros.</p>
    </section>
    <section class="panel" style="margin-top:var(--gap)" aria-labelledby="t-val">
      <header><h2 id="t-val">Error medio por evaluación</h2><span class="meta">Modelo frente a la mediana del distrito (baseline)</span></header>
      <div class="table-wrap"><table class="list-table kpi-table">
        <thead><tr><th>Evaluación</th><th class="n">Anuncios</th><th>Modelo vs. baseline</th><th class="n">MAE modelo</th><th class="n">MAE baseline</th><th class="n">MAPE</th><th class="n">Cobertura</th></tr></thead>
        <tbody>${filasValidacion.map((v) => `<tr>
          <td>${esc(v.captura)}</td><td class="n more" data-label="Anuncios">${num(v.evaluados)}</td>
          <td class="barras-celda hide-phone"><div class="barra"><span style="width:${(100 * v.modelo.mae_soles) / maxMae}%"></span></div>
            <div class="barra base"><span style="width:${(100 * v.baseline_distrital.mae_soles) / maxMae}%"></span></div></td>
          <td class="n key" data-label="MAE modelo"><b>${soles(v.modelo.mae_soles)}</b></td>
          <td class="n more" data-label="MAE baseline">${soles(v.baseline_distrital.mae_soles)}</td>
          <td class="n more" data-label="MAPE">${porcentaje(v.modelo.mape_porcentaje)}</td>
          <td class="n more" data-label="Cobertura">${porcentaje(v.cobertura_rango_porcentaje)}</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="panel-note"><span class="leyenda"><i></i>Modelo</span> <span class="leyenda base"><i></i>Baseline: mediana del distrito</span> · El modelo está congelado: cada fila lo prueba con anuncios que no vio al entrenar.</p>
    </section>

    <div class="grid" style="margin-top:var(--gap)">
      <section class="panel span-3" aria-labelledby="t-datos">
        <header><h2 id="t-datos">Datos del mercado</h2><span class="meta">Captura del ${esc(d.captura)}</span></header>
        <div class="rows kv">
          <div class="row"><span>Días desde la última captura</span><b class="num">${num(d.dias_desde_captura)}</b></div>
          <div class="row"><span>Anuncios descargados</span><b class="num">${num(d.anuncios_en_captura)}</b></div>
          <div class="row"><span>Válidos tras limpiar</span><b class="num">${num(d.validos)} <small class="hint">(${porcentaje(d.porcentaje_validos)})</small></b></div>
          <div class="row"><span>Únicos (sin duplicados)</span><b class="num">${num(d.unicos)}</b></div>
          <div class="row"><span>En la búsqueda de la app</span><b class="num">${num(d.en_la_app)}</b></div>
          <div class="row"><span>Distritos cubiertos</span><b class="num">${num(d.distritos)}</b></div>
          <div class="row"><span>Precio mediano pedido</span><b class="num">${soles(d.precio_mediano_soles)}</b></div>
        </div>
      </section>
      <section class="panel span-3" aria-labelledby="t-dist">
        <header><h2 id="t-dist">Anuncios por distrito</h2><span class="meta">Los ${d.anuncios_por_distrito.length} con más anuncios</span></header>
        <div class="rows kv">${d.anuncios_por_distrito.map((x) => `<div class="row dist-row"><span>${esc(titulo(x.distrito))}</span>
          <div class="barra"><span style="width:${(100 * x.anuncios) / maxDistrito}%"></span></div><b class="num">${num(x.anuncios)}</b></div>`).join("")}</div>
      </section>
    </div>

    ${r ? `<h2 class="section-title">Recomendador para inquilinos</h2>
    <div class="kpis kpis-wrap">
      ${kpi("Precisión en los 12 primeros", porcentaje(100 * r.recomendador.precision, 0), `vs. ${porcentaje(100 * r.mejor_alternativa[1].precision, 0)} al ${esc(NOMBRES_ALTERNATIVA[r.mejor_alternativa[0]] || r.mejor_alternativa[0])}`, true)}
      ${kpi("Cumplen lo pedido", porcentaje(100 * r.recomendador.cumplimiento, 0), "presupuesto, dormitorios y distritos")}
      ${kpi("Calidad del orden (nDCG)", num(r.recomendador.ndcg, 3), "1 es el orden ideal")}
      ${kpi("Perfiles con algún acierto", porcentaje(100 * r.recomendador.acierto, 0), `${num(r.perfiles_evaluados)} perfiles de prueba · ${num(r.recomendador.distritos, 1)} distritos por lista`)}
    </div>` : ""}
    <p class="panel-note">Los KPIs de uso salen de la base de cuentas y no incluyen nombres ni correos. Los del modelo y del recomendador salen de las evaluaciones guardadas en el repositorio (semanas 10 y 12).</p>
    </div>`;
  lienzo.querySelectorAll("[data-tema-supervision]").forEach((boton) => boton.addEventListener("click", () => {
    lienzo.querySelectorAll("[data-tema-supervision]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === boton)));
    lienzo.querySelector("[data-respuesta-supervision]").innerHTML =
      lecturaSupervision(boton.dataset.temaSupervision, p, m, d, r);
  }));
  lienzo.querySelectorAll("[data-serie-actividad]").forEach((boton) => boton.addEventListener("click", () => {
    lienzo.querySelectorAll("[data-serie-actividad]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === boton)));
    lienzo.querySelector("[data-grafico-actividad]").innerHTML =
      graficoActividad(actividad, boton.dataset.serieActividad, simulacion);
  }));
  detallesAbiertos.forEach((id) => { const detalle = lienzo.querySelector(`[data-detalle="${id}"]`); if (detalle) detalle.open = true; });
  if (focoTema) lienzo.querySelector(`[data-tema-supervision="${focoTema}"]`)?.focus({ preventScroll: true });
  else if (focoSerie) lienzo.querySelector(`[data-serie-actividad="${focoSerie}"]`)?.focus({ preventScroll: true });
  else if (focoRecargar) lienzo.querySelector("[data-recargar]")?.focus({ preventScroll: true });
  else if (focoDetalle) lienzo.querySelector(`[data-detalle="${focoDetalle}"] summary`)?.focus({ preventScroll: true });
  else if (focoTitulo) {
    const tituloPanel = lienzo.querySelector(".analyst-dashboard h1");
    tituloPanel.tabIndex = -1;
    tituloPanel.focus({ preventScroll: true });
  }
  if (teniaDatos) window.scrollTo(0, scrollAnterior);
  lienzo.querySelector("[data-recargar]").addEventListener("click", () => vistaAnalista(lienzo));
  ultimoLienzo = lienzo;
  ultimaFirma = firma;
  programarRefresco(lienzo);
}
