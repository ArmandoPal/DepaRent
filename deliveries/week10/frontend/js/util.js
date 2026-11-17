export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const num = (v, dec = 0) => v == null ? "—" : Number(v).toLocaleString("es-PE", { maximumFractionDigits: dec });
export const soles = (v, dec = 0) => v == null ? "—" :
  "S/ " + Number(v).toLocaleString("es-PE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const pct = (v) => (v > 0 ? "+" : "") + num(v, 1) + "%";
export const titulo = (t) => String(t ?? "").replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export const ETIQUETAS_AMENIDAD = {
  ascensor: "Ascensor", balcon: "Balcón", terraza: "Terraza", piscina: "Piscina", gimnasio: "Gimnasio", pet_friendly: "Admite mascotas",
};

export function html(cadena) {
  const plantilla = document.createElement("template");
  plantilla.innerHTML = cadena.trim();
  return plantilla.content;
}

export function tabla(filas, columnas) {
  columnas = columnas || Object.keys(filas[0] || {});
  const celda = (v) => esc(typeof v === "number" ? num(v, 2) : v ?? "—");
  return `<div class="table-wrap"><table><thead><tr>${columnas.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
    filas.map((f) => "<tr>" + columnas.map((c) => `<td>${celda(f[c])}</td>`).join("") + "</tr>").join("") +
    "</tbody></table></div>";
}

export function mensaje(contenedor, texto, tipo = "error") {
  contenedor.innerHTML = texto ? `<p class="${tipo}" role="alert">${esc(texto)}</p>` : "";
}

export async function conBoton(boton, textoOcupado, tarea) {
  const original = boton.textContent;
  boton.disabled = true;
  boton.textContent = textoOcupado;
  try {
    return await tarea();
  } finally {
    boton.disabled = false;
    boton.textContent = original;
  }
}

// Filas de tabla que abren otra pantalla: la fila entera es el blanco del clic; el enlace de la primera celda sirve al teclado.
export function enlazarFilas(raiz) {
  raiz.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", (e) => {
    if (!e.target.closest("a")) location.hash = tr.dataset.href;
  }));
}

// Copia el enlace de la pantalla actual y confirma en el mismo botón (sin ventanas emergentes).
export async function copiarEnlace(boton) {
  const original = boton.textContent;
  let copiado = false;
  try {
    await navigator.clipboard.writeText(location.href);
    copiado = true;
  } catch {
    // Sin permiso de portapapeles (página sin foco, http sin TLS): copia con una selección temporal.
    const campo = Object.assign(document.createElement("textarea"), { value: location.href });
    campo.setAttribute("readonly", "");
    campo.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(campo);
    campo.select();
    copiado = document.execCommand("copy");
    campo.remove();
  }
  boton.textContent = copiado ? "Enlace copiado" : "Copia la dirección del navegador";
  setTimeout(() => { boton.textContent = original; }, 2000);
}

// Detalle técnico (método, supuestos) plegado: el texto principal queda en lenguaje cotidiano.
export const notaTecnica = (texto) => texto
  ? `<details class="tech"><summary>Detalle técnico</summary><p>${esc(texto)}</p></details>` : "";

// La API clasifica cada precio pedido en relación con su estimación; la pantalla conserva ese matiz.
export const valoracionSencilla = (v) => ({
  "Por debajo del estimado": "Por debajo de la estimación",
  "Por encima del estimado": "Por encima de la estimación",
  "En línea con el estimado": "Cerca de la estimación",
}[v] || v);

// Distritos más próximos a uno dado, por la distancia entre los centros que entrega /api/opciones.
// Pruebas con usuarios (P3): sin resultados en un distrito, ofrecer vecinos antes de sugerir subir el presupuesto.
export function distritosCercanos(centros, distrito, n = 6) {
  const origen = centros?.[distrito];
  if (!origen) return [];
  const km = ([la1, lo1], [la2, lo2]) => Math.hypot((la2 - la1) * 111, (lo2 - lo1) * 111 * Math.cos((la1 * Math.PI) / 180));
  return Object.entries(centros)
    .filter(([d, c]) => d !== distrito && d !== "otros" && c)
    .map(([d, c]) => [d, km(origen, c)])
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([d]) => d);
}

// Cuenta cuántas opciones hay en cada distrito vecino (consulta por distrito) y devuelve los que tienen alguna.
export async function vecinosConOpciones(centros, distrito, contar, maximo = 3) {
  const candidatos = distritosCercanos(centros, distrito);
  const conteos = await Promise.all(candidatos.map((d) => contar(d).then((n) => [d, n]).catch(() => [d, 0])));
  return conteos.filter(([, n]) => n > 0).slice(0, maximo);
}

export function botonesVecinos(vecinos, distrito, atributo) {
  if (!vecinos.length) return "";
  return `<p>Con los mismos filtros sí hay opciones en distritos cercanos a ${esc(titulo(distrito))}:</p>
    <div class="vecinos">${vecinos.map(([d, n]) => `<button class="btn" type="button" ${atributo}="${esc(d)}">${esc(titulo(d))} · ${num(n)} ${n === 1 ? "opción" : "opciones"}</button>`).join("")}</div>`;
}

const CAMPOS_AVISO = {
  area_total: "el área", dormitorios: "los dormitorios", banos: "los baños", estacionamientos: "los estacionamientos",
  antiguedad: "la antigüedad", mantenimiento: "el mantenimiento",
};

// Avisos del modelo (texto fijo en modelo.py, que está congelado) dichos en lenguaje cotidiano.
export function avisoSencillo(texto) {
  const fuera = /^(\w+) está fuera del rango observado en entrenamiento\.$/.exec(texto || "");
  if (fuera) return `El valor de ${CAMPOS_AVISO[fuera[1]] || fuera[1]} es poco común en los anuncios que conocemos: toma el precio con cautela.`;
  if ((texto || "").startsWith("Revisa esta combinación")) {
    return "Revisa los datos: 30 m² o menos con 6 o más dormitorios, baños o estacionamientos es una combinación muy poco común.";
  }
  return texto;
}

/* Distritos donde la estimación falla mucho (Los Olivos, Comas, San Martín de Porres...): el modelo suele
   quedar por encima del precio real. Aviso visible, no una nota técnica. */
export function avisoDistritoPocoConfiable(ev) {
  if (!ev?.poco_confiable) return "";
  const nombre = ev.distrito === "otros" ? "este distrito" : titulo(ev.distrito);
  return `<div class="aviso-distrito" role="note"><b>⚠ El precio estimado en ${esc(nombre)} puede no ser exacto</b>
    <span>El equipo de DepaRent ha detectado que en este distrito la estimación no es tan precisa y suele salir más alta que el precio real.
    Tómala como una referencia aproximada y guíate más por los departamentos parecidos.</span></div>`;
}
