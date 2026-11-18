/* Genera PresentationFinal.pptx (pitch final de DepaRent, ~20 min).
   Estilo tomado de deliveries/week10/PresentationWeek10.pptx: naranja del cartel, tinta casi negra, durazno y café;
   títulos en Arial Black, pasos numerados en cuadros naranjas y capturas reales de la app (carpeta capturas/).
   Uso:  NODE_PATH=<carpeta con pptxgenjs y sharp>/node_modules node crear_presentacion.js
   Todas las cifras salen de deliveries/week12/EvaluationReport.md, week10/resultados/ y week12/pruebas_usuarios/. */
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const NOTAS = require("./notas.js");

const AQUI = __dirname;
const CAP = (f) => path.join(AQUI, "capturas", f);

const C = {
  nar: "FF7A1F", narOsc: "C2510A", tinta: "050F16", dur: "FFC59A", cafe: "5A2306",
  gris: "F2F2F0", grisMed: "B9B7B2", txt: "5D5F63", blanco: "FFFFFF", verde: "247B50",
};
const TIT = "Arial Black", CUERPO = "Arial";
const W = 13.333, M = 0.6;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Equipo DepaRent";
pres.title = "DepaRent · Presentación final";
pres.theme = { headFontFace: TIT, bodyFontFace: CUERPO };

const pie = (color) => ({ text: { text: "DepaRent · Presentación final · DS3022 UTEC 2026-2",
  options: { x: M, y: 7.02, w: 8, h: 0.3, fontSize: 10, color, fontFace: CUERPO, margin: 0 } } });
const numero = (color) => ({ x: 12.23, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color, fontFace: CUERPO, align: "right" });
pres.defineSlideMaster({ title: "CLARO", background: { color: C.blanco }, objects: [pie("8A8C90")], slideNumber: numero("8A8C90") });
pres.defineSlideMaster({ title: "OSCURO", background: { color: C.tinta }, objects: [pie("9AA0A6")], slideNumber: numero("9AA0A6") });
pres.defineSlideMaster({ title: "NARANJA", background: { color: C.nar }, objects: [] });
pres.defineSlideMaster({ title: "RESPALDO", background: { color: C.gris },
  objects: [{ text: { text: "Respaldo · solo si preguntan", options: { x: M, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: "8A8C90", fontFace: CUERPO, margin: 0 } } }],
  slideNumber: numero("8A8C90") });

// ---------- ayudas ----------
const texto = (s, t, o) => s.addText(t, { fontFace: CUERPO, color: C.tinta, margin: 0, valign: "top", isTextBox: true, ...o });
const titulo = (s, t, color = C.tinta) => texto(s, t, { x: M, y: 0.42, w: W - 2 * M, h: 0.85, fontFace: TIT, fontSize: 28, color, valign: "middle" });
const caja = (s, x, y, w, h, fill, extra = {}) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, ...extra });
const cuadro = (s, n, x, y, fill = C.nar, color = C.blanco) => {
  caja(s, x, y, 0.36, 0.36, fill);
  texto(s, String(n), { x, y, w: 0.36, h: 0.36, fontSize: 14, bold: true, color, align: "center", valign: "middle" });
};
const flecha = (s, x, y, color = C.narOsc) => texto(s, "→", { x, y, w: 0.4, h: 0.5, fontSize: 26, bold: true, color, align: "center", valign: "middle" });
const medidas = {};
async function medir(f) { const m = await sharp(f).metadata(); medidas[f] = m.width / m.height; }
// Inserta una imagen dentro de la caja (x, y, w, h) sin deformarla; devuelve la altura usada.
function imagen(s, f, x, y, w, h, extra = {}) {
  const r = medidas[f];
  let ww = w, hh = w / r;
  if (hh > h) { hh = h; ww = h * r; }
  s.addImage({ path: f, x, y, w: ww, h: hh, line: { color: "E3E2DE", width: 0.75 }, ...extra });
  return hh;
}
const pie_imagen = (s, t, x, y, w) => texto(s, t, { x, y, w, h: 0.35, fontSize: 12, color: C.txt, italic: true });

async function main() {
  // Recorte del cartel del inicio de la app (el estimador "Se alquila").
  await sharp(CAP("portada.jpg")).extract({ left: 505, top: 398, width: 395, height: 341 }).toFile(CAP("cartel.jpg"));
  const arq = path.join(AQUI, "..", "architecture", "system_architecture.png");
  for (const f of ["cartel.jpg", "resultado_precio.jpg", "buscar_lince.jpg", "form_paso3.jpg", "recomendados.jpg", "mi_perfil.jpg",
    "antes_semana10.jpg", "panel_uso.jpg", "panel_modelo.jpg", "ficha_los_olivos.jpg"].map(CAP).concat([arq])) await medir(f);

  // ================= BLOQUE 1 · LA PROBLEMÁTICA (Adrian) =================
  pres.addSection({ title: "1 · La problemática" });

  // 1 · Gancho
  let s = pres.addSlide({ masterName: "NARANJA", sectionTitle: "1 · La problemática" });
  texto(s, "DS3022 Desarrollo de Producto de Datos · UTEC · 2026-2", { x: M, y: 0.45, w: 8, h: 0.3, fontSize: 12 });
  texto(s, "¿Cuánto cuesta equivocarse al poner el precio de un alquiler?", { x: M, y: 0.95, w: 7.6, h: 2.3, fontFace: TIT, fontSize: 38, valign: "middle" });
  caja(s, M, 3.55, 3.55, 1.85, C.tinta);
  texto(s, "S/ 1,055", { x: M + 0.25, y: 3.7, w: 3.1, h: 0.75, fontFace: TIT, fontSize: 36, color: C.dur });
  texto(s, "al mes de error si usas el precio típico del distrito", { x: M + 0.25, y: 4.5, w: 3.1, h: 0.75, fontSize: 15, color: C.blanco });
  caja(s, 4.4, 3.55, 3.55, 1.85, C.blanco);
  texto(s, "S/ 534", { x: 4.65, y: 3.7, w: 3.1, h: 0.75, fontFace: TIT, fontSize: 36, color: C.narOsc });
  texto(s, "con DepaRent: 49% menos error", { x: 4.65, y: 4.5, w: 3.1, h: 0.75, fontSize: 15 });
  texto(s, "Error medio por anuncio en 2,063 anuncios nuevos del 17-nov-2026 que el modelo no había visto.", { x: M, y: 5.55, w: 7.4, h: 0.5, fontSize: 13 });
  texto(s, "Adrian Urbina Mendoza · Armando Martinez Palomino · Breysi Salazar Medina · Luciana Yangali Cáceres", { x: M, y: 6.75, w: 9, h: 0.35, fontSize: 12, bold: true });
  imagen(s, CAP("cartel.jpg"), 8.75, 0.9, 3.9, 3.6, { rotate: 3, line: { color: C.tinta, width: 1 } });
  texto(s, "DepaRent", { x: 8.75, y: 4.85, w: 3.95, h: 0.75, fontFace: TIT, fontSize: 34 });
  texto(s, "deparent.onrender.com", { x: 8.75, y: 5.6, w: 3.95, h: 0.4, fontSize: 16, bold: true, underline: { style: "sng" } });
  s.addNotes(NOTAS[0]);

  // 2 · El problema
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "1 · La problemática" });
  titulo(s, "Dos preguntas sin una buena respuesta");
  caja(s, M, 1.6, 7.0, 4.95, C.dur);
  texto(s, "Propietario", { x: M + 0.35, y: 1.85, w: 6.3, h: 0.45, fontFace: TIT, fontSize: 20 });
  texto(s, "«Vi uno parecido a S/ 2,800. Pido lo mismo.»", { x: M + 0.35, y: 2.45, w: 6.3, h: 1.2, fontSize: 28, bold: true });
  texto(s, "Pero ese anuncio puede tener más área, cochera o llevar meses sin alquilarse.", { x: M + 0.35, y: 3.85, w: 6.3, h: 0.9, fontSize: 18 });
  texto(s, "Si pide de más, el depa se queda vacío. Si pide de menos, pierde renta cada mes.", { x: M + 0.35, y: 4.9, w: 6.3, h: 0.9, fontSize: 18, bold: true, color: C.cafe });
  caja(s, 7.9, 1.6, 4.83, 4.95, C.tinta);
  texto(s, "Inquilino", { x: 8.25, y: 1.85, w: 4.2, h: 0.45, fontFace: TIT, fontSize: 20, color: C.blanco });
  texto(s, "«¿Cuál de estos vale lo que piden?»", { x: 8.25, y: 2.45, w: 4.2, h: 1.2, fontSize: 26, bold: true, color: C.blanco });
  texto(s, "Solo en Lince, con 2 dormitorios y hasta S/ 2,500, hay 32 anuncios.", { x: 8.25, y: 3.85, w: 4.2, h: 0.9, fontSize: 18, color: C.dur });
  texto(s, "En toda Lima, 2,998.", { x: 8.25, y: 4.9, w: 4.2, h: 0.5, fontSize: 18, bold: true, color: C.blanco });
  s.addNotes(NOTAS[1]);

  // 3 · La oportunidad
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "1 · La problemática" });
  titulo(s, "Los portales muestran anuncios; falta decidir");
  const pasos3 = [["Mercado", "2,998 anuncios de Adondevivir y Urbania (17-nov)", C.gris, C.tinta],
    ["Contexto", "Transporte cercano y tendencia del precio en el distrito", C.gris, C.tinta],
    ["Recomendación", "Precio esperado, rango y tres precios, u opciones para ti", C.dur, C.tinta],
    ["Decisión", "Cuánto pedir. Dónde mirar.", C.nar, C.tinta]];
  pasos3.forEach(([t, d, fill], i) => {
    const x = M + i * 3.12;
    caja(s, x, 1.85, 2.65, 2.75, fill);
    cuadro(s, i + 1, x + 0.25, 2.1, i === 3 ? C.tinta : C.nar);
    texto(s, t, { x: x + 0.25, y: 2.65, w: 2.2, h: 0.5, fontSize: 19, bold: true });
    texto(s, d, { x: x + 0.25, y: 3.25, w: 2.2, h: 1.3, fontSize: 15 });
    if (i < 3) flecha(s, x + 2.68, 2.95);
  });
  texto(s, [{ text: "Hoy: ", options: { bold: true } }, { text: "se comparan tres anuncios a mano." }], { x: M, y: 5.15, w: 5.8, h: 0.5, fontSize: 19 });
  texto(s, [{ text: "Con DepaRent: ", options: { bold: true, color: C.narOsc } }, { text: "el mercado completo, ordenado y explicado." }], { x: 6.6, y: 5.15, w: 6.1, h: 0.5, fontSize: 19 });
  s.addNotes(NOTAS[2]);

  // ================= BLOQUE 2 · CÓMO LO SOLUCIONAMOS (Armando) =================
  pres.addSection({ title: "2 · Cómo lo solucionamos" });

  // 4 · Solución
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "2 · Cómo lo solucionamos" });
  titulo(s, "DepaRent: apoyo a la decisión para alquilar en Lima");
  texto(s, "Un mismo análisis para los dos lados del alquiler", { x: M, y: 1.22, w: 10, h: 0.4, fontSize: 18, color: C.txt });
  const fila = (y, etiqueta, pasos, fill) => {
    texto(s, etiqueta, { x: M, y, w: 1.9, h: 1.75, fontFace: TIT, fontSize: 17, valign: "middle" });
    pasos.forEach(([t, d], i) => {
      const x = 2.55 + i * 2.6;
      caja(s, x, y, 2.3, 1.75, fill);
      cuadro(s, i + 1, x + 0.18, y + 0.18);
      texto(s, t, { x: x + 0.18, y: y + 0.62, w: 2.0, h: 0.4, fontSize: 16, bold: true });
      texto(s, d, { x: x + 0.18, y: y + 1.02, w: 2.0, h: 0.65, fontSize: 13 });
      if (i < 3) flecha(s, x + 2.15, y + 0.6);
    });
  };
  fila(1.85, "Propietario", [["Describe su depa", "En 3 o 4 pasos cortos"], ["Recibe el análisis", "Precio, rango, parecidos y tendencia"],
    ["Elige un precio", "Competitivo, equilibrado o renta superior"], ["Publica", "Y le llegan los interesados"]], C.dur);
  fila(4.0, "Inquilino", [["Cuenta qué busca", "Hogar, presupuesto y distritos"], ["Recibe opciones", "Con el porqué de cada una"],
    ["Compara", "Precio pedido frente al estimado"], ["Escribe al dueño", "O va al anuncio original"]], C.gris);
  texto(s, "Todo está publicado y se puede usar hoy en deparent.onrender.com.", { x: M, y: 6.1, w: 12, h: 0.4, fontSize: 16, bold: true });
  s.addNotes(NOTAS[3]);

  // 5 · De datos a decisiones
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "2 · Cómo lo solucionamos" });
  titulo(s, "Cómo convierte datos en decisiones");
  [["12,235", "anuncios distintos de Adondevivir y Urbania, del 20-oct al 17-nov", C.nar],
    ["3,233", "paraderos de transporte de la ATU", C.tinta], ["13", "series de precio por distrito del BCRP", C.cafe]]
    .forEach(([n, d, fill], i) => {
      const y = 1.55 + i * 1.55;
      caja(s, M, y, 3.65, 1.35, fill);
      texto(s, n, { x: M + 0.25, y: y + 0.15, w: 3.2, h: 0.55, fontFace: TIT, fontSize: 26, color: C.blanco });
      texto(s, d, { x: M + 0.25, y: y + 0.72, w: 3.2, h: 0.6, fontSize: 13, color: C.blanco });
    });
  flecha(s, 4.35, 3.2);
  caja(s, 4.85, 1.55, 3.4, 4.45, C.tinta);
  texto(s, "Motor de análisis DepaRent", { x: 5.1, y: 1.8, w: 2.95, h: 0.95, fontFace: TIT, fontSize: 19, color: C.blanco });
  texto(s, "Aprendió con 3,128 anuncios de septiembre cuánto cambia el alquiler según el distrito, el área, los dormitorios, las amenidades y el transporte.",
    { x: 5.1, y: 2.85, w: 2.95, h: 2.0, fontSize: 15, color: C.blanco });
  texto(s, "Lo comprobamos con cada captura nueva del mercado.", { x: 5.1, y: 5.0, w: 2.95, h: 0.8, fontSize: 14, color: C.dur, bold: true });
  flecha(s, 8.35, 3.2);
  ["Precio esperado y rango", "8 departamentos parecidos", "Transporte cercano", "Tendencia del distrito", "Tres precios de publicación", "Recomendaciones según tu perfil"]
    .forEach((t, i) => {
      const y = 1.6 + i * 0.73;
      cuadro(s, i + 1, 8.9, y + 0.06);
      texto(s, t, { x: 9.42, y, w: 3.4, h: 0.5, fontSize: 17, valign: "middle" });
    });
  texto(s, "Por dentro: regresión (precio) · agrupamiento (tipo de departamento) · series de tiempo (tendencia) · reglas (precios de publicación) · recomendación por contenido",
    { x: M, y: 6.3, w: 12.1, h: 0.4, fontSize: 12, color: C.txt });
  s.addNotes(NOTAS[4]);

  // 6 · Caso propietario
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "2 · Cómo lo solucionamos" });
  titulo(s, "Caso: un propietario en Jesús María");
  texto(s, "70 m² · 2 dorm. · 2 baños · 8 años · ascensor", { x: M, y: 1.3, w: 4.4, h: 0.35, fontSize: 15, color: C.txt });
  caja(s, M, 1.8, 4.25, 1.25, C.gris);
  texto(s, "Antes", { x: M + 0.25, y: 1.92, w: 3.8, h: 0.3, fontSize: 14, bold: true, color: C.txt });
  texto(s, "«Pido S/ 2,800 porque vi uno a ese precio.»", { x: M + 0.25, y: 2.25, w: 3.8, h: 0.75, fontSize: 18 });
  caja(s, M, 3.2, 4.25, 2.35, C.dur);
  texto(s, "Con DepaRent", { x: M + 0.25, y: 3.32, w: 3.8, h: 0.3, fontSize: 14, bold: true, color: C.cafe });
  texto(s, [
    { text: "Estima S/ 2,528 (rango S/ 1,517 a 3,539)", options: { bullet: true, breakLine: true } },
    { text: "6 de sus 8 parecidos piden menos de S/ 2,800", options: { bullet: true, breakLine: true } },
    { text: "Distrito estable (+0.7%) · error típico ahí: S/ 246", options: { bullet: true } }],
  { x: M + 0.25, y: 3.65, w: 3.85, h: 1.85, fontSize: 15, paraSpaceAfter: 4 });
  caja(s, M, 5.7, 4.25, 0.95, C.nar);
  texto(s, "Publica en S/ 2,530 (equilibrado)", { x: M + 0.25, y: 5.7, w: 3.9, h: 0.95, fontSize: 20, bold: true, valign: "middle" });
  const h6 = imagen(s, CAP("resultado_precio.jpg"), 5.15, 1.35, 7.58, 3.6);
  pie_imagen(s, "Captura real de la app (17-nov). No garantiza el precio: muestra la evidencia para elegirlo.", 5.15, 1.35 + h6 + 0.1, 7.58);
  texto(s, "De una intuición a una decisión con evidencia", { x: 5.15, y: 5.5, w: 7.58, h: 0.9, fontFace: TIT, fontSize: 22, valign: "middle" });
  s.addNotes(NOTAS[5]);

  // 7 · Demo en vivo
  s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "2 · Cómo lo solucionamos" });
  titulo(s, "Demo en vivo · 2 minutos y medio", C.blanco);
  texto(s, "Propietario", { x: M, y: 1.55, w: 5.5, h: 0.45, fontFace: TIT, fontSize: 19, color: C.dur });
  ["«Probar el análisis»", "Cargar el caso de Jesús María", "Precio esperado y rango", "Los 8 parecidos", "Los tres precios de publicación"].forEach((t, i) => {
    cuadro(s, i + 1, M, 2.15 + i * 0.62);
    texto(s, t, { x: M + 0.55, y: 2.12 + i * 0.62, w: 5.0, h: 0.45, fontSize: 18, color: C.blanco, valign: "middle" });
  });
  texto(s, "Inquilino (si hay tiempo)", { x: 6.9, y: 1.55, w: 5.8, h: 0.45, fontFace: TIT, fontSize: 19, color: C.dur });
  ["Buscar con filtros", "«Por debajo de la estimación»", "Una recomendación y su porqué"].forEach((t, i) => {
    cuadro(s, i + 1, 6.9, 2.15 + i * 0.62);
    texto(s, t, { x: 7.45, y: 2.12 + i * 0.62, w: 5.2, h: 0.45, fontSize: 18, color: C.blanco, valign: "middle" });
  });
  texto(s, "deparent.onrender.com", { x: M, y: 5.45, w: 8, h: 0.7, fontFace: TIT, fontSize: 30, color: C.nar });
  s.addNotes(NOTAS[6]);

  // 8 · Caso inquilino
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "2 · Cómo lo solucionamos" });
  titulo(s, "Caso: buscar 2 dormitorios hasta S/ 2,500");
  [["2,998", "anuncios en Lima (17-nov)", 6.0, C.gris],
    ["106", "en Jesús María, Lince o Surquillo, con 2+ dorm., hasta S/ 2,500 y paradero a 300 m", 4.85, C.dur],
    ["30", "piden menos que la estimación: empieza por estos", 3.7, C.nar]].forEach(([n, d, w, fill], i) => {
    const y = 1.55 + i * 1.3;
    caja(s, M, y, w, 1.15, fill);
    texto(s, n, { x: M + 0.22, y, w: 1.3, h: 1.15, fontFace: TIT, fontSize: 26, valign: "middle" });
    texto(s, d, { x: M + 1.55, y, w: w - 1.7, h: 1.15, fontSize: 14, valign: "middle" });
  });
  texto(s, "«Por debajo de la estimación» no significa ganga: puede haber algo que el anuncio no dice (estado, piso, ruido).",
    { x: M, y: 5.6, w: 6.0, h: 0.85, fontSize: 16, italic: true, color: C.cafe });
  const h8 = imagen(s, CAP("buscar_lince.jpg"), 7.0, 1.4, 5.73, 4.6);
  pie_imagen(s, "En la app, el mismo filtro solo en Lince: 32 anuncios, 6 por debajo.", 7.0, 1.4 + h8 + 0.1, 5.73);
  s.addNotes(NOTAS[7]);

  // ================= BLOQUE 3 · INTERFAZ Y PANEL (Luciana) =================
  pres.addSection({ title: "3 · Interfaz y panel" });

  // 9 · Interfaz
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "3 · Interfaz y panel" });
  titulo(s, "La interfaz: una pregunta por pantalla");
  const h9 = imagen(s, CAP("form_paso3.jpg"), M, 1.45, 6.2, 3.2);
  pie_imagen(s, "Propietario · formulario en 3 o 4 pasos, con iconos y validación en cada paso", M, 1.45 + h9 + 0.08, 6.2);
  ["Menos texto y más elementos visuales", "El precio y su rango, grandes y arriba", "Avisos cuando la estimación no es precisa"].forEach((t, i) => {
    cuadro(s, i + 1, M, 5.15 + i * 0.55);
    texto(s, t, { x: M + 0.55, y: 5.12 + i * 0.55, w: 5.6, h: 0.42, fontSize: 17, valign: "middle" });
  });
  const h9b = imagen(s, CAP("recomendados.jpg"), 7.1, 1.45, 5.63, 2.3);
  pie_imagen(s, "Inquilino · recomendaciones con el porqué plegable", 7.1, 1.45 + h9b + 0.08, 5.63);
  const y9 = 1.45 + h9b + 0.55;
  const h9c = imagen(s, CAP("mi_perfil.jpg"), 7.1, y9, 5.63, 2.0);
  pie_imagen(s, "Mi perfil · lo que busca, en tarjetas", 7.1, y9 + h9c + 0.08, 5.63);
  s.addNotes(NOTAS[8]);

  // 10 · Pruebas con usuarios
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "3 · Interfaz y panel" });
  titulo(s, "Lo probamos con 5 personas y cambiamos el producto");
  [["5 personas", "2 inquilinos, 2 propietarios y 1 con los dos roles · 11 al 17-nov", 3.3],
    ["8 de 8", "tareas completadas sin ayuda por los inquilinos", 2.6],
    ["3.9 vs 2.8", "utilidad (1 a 5) del recomendador frente al buscador por precio", 2.95]].forEach(([n, d, w], i, arr) => {
    const x = M + arr.slice(0, i).reduce((a, [, , ww]) => a + ww + 0.25, 0);
    texto(s, n, { x, y: 1.35, w, h: 0.6, fontFace: TIT, fontSize: 26, color: C.narOsc });
    texto(s, d, { x, y: 1.95, w, h: 0.6, fontSize: 13, color: C.txt });
  });
  texto(s, "Lo que nos hicieron cambiar", { x: M, y: 2.85, w: 8.5, h: 0.4, fontSize: 18, bold: true });
  [["«Mucho texto, me abruma» (P5, P6)", "Precio y rango grandes; formulario por pasos"],
    ["«El margen de error es muy amplio» (P6)", "Barra del rango y «¿Por qué es tan amplio?»"],
    ["Confundían el esquema con el plano (P2, P3)", "«Esquema aproximado del departamento»"],
    ["«En Los Olivos el precio parece muy alto» (P7)", "Aviso en los distritos poco precisos"]].forEach(([a, b], i) => {
    const y = 3.35 + i * 0.82;
    caja(s, M, y, 4.0, 0.7, C.gris);
    texto(s, a, { x: M + 0.15, y, w: 3.75, h: 0.7, fontSize: 14, valign: "middle" });
    flecha(s, M + 4.05, y + 0.1);
    caja(s, M + 4.5, y, 4.1, 0.7, C.dur);
    texto(s, b, { x: M + 4.65, y, w: 3.85, h: 0.7, fontSize: 14, bold: true, valign: "middle" });
  });
  texto(s, "Semana 10", { x: 9.75, y: 2.85, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.txt });
  const h10 = imagen(s, CAP("antes_semana10.jpg"), 9.75, 3.15, 2.98, 2.0);
  texto(s, "Hoy", { x: 9.75, y: 3.15 + h10 + 0.15, w: 3, h: 0.3, fontSize: 12, bold: true, color: C.narOsc });
  imagen(s, CAP("resultado_precio.jpg"), 9.75, 3.45 + h10 + 0.15, 2.98, 1.3);
  s.addNotes(NOTAS[9]);

  // 11 · Panel de análisis
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "3 · Interfaz y panel" });
  titulo(s, "El panel de análisis: cómo seguimos el producto");
  const h11 = imagen(s, CAP("panel_uso.jpg"), M, 1.4, 7.2, 4.2);
  texto(s, "Qué mide", { x: 8.1, y: 1.4, w: 4.6, h: 0.4, fontSize: 18, bold: true });
  ["Uso: de registro a publicación y contacto", "Calidad del modelo con cada captura nueva", "Mercado por distrito", "Desempeño del recomendador"].forEach((t, i) => {
    cuadro(s, i + 1, 8.1, 1.95 + i * 0.52);
    texto(s, t, { x: 8.6, y: 1.92 + i * 0.52, w: 4.1, h: 0.42, fontSize: 15, valign: "middle" });
  });
  imagen(s, CAP("panel_modelo.jpg"), 8.1, 4.15, 4.63, 2.0);
  caja(s, M, 1.4 + h11 + 0.2, 7.2, 0.85, C.dur);
  texto(s, [{ text: "Ojo: ", options: { bold: true } }, { text: "las cifras de uso de esta captura son de una base de demostración con 300 cuentas simuladas, no de usuarios reales. El error del modelo (S/ 534) sí es real." }],
    { x: M + 0.2, y: 1.4 + h11 + 0.2, w: 6.85, h: 0.85, fontSize: 13, valign: "middle" });
  s.addNotes(NOTAS[10]);

  // ================= BLOQUE 4 · CONCLUSIONES Y RECOMENDACIONES (Breysi) =================
  pres.addSection({ title: "4 · Conclusiones y recomendaciones" });

  // 12 · ¿Funciona?
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "4 · Conclusiones y recomendaciones" });
  titulo(s, "¿Funciona? Lo medimos con anuncios nuevos");
  texto(s, "Casi la mitad de error que el precio típico del distrito, estable durante 9 semanas, con anuncios que el modelo no había visto", { x: M, y: 1.3, w: 7.6, h: 0.7, fontSize: 17, bold: true });
  s.addChart(pres.charts.BAR, [
    { name: "DepaRent", labels: ["Prueba sep.", "23-oct", "9-nov", "17-nov"], values: [553, 512, 541, 534] },
    { name: "Precio típico del distrito", labels: ["Prueba sep.", "23-oct", "9-nov", "17-nov"], values: [993, 948, 1024, 1055] }],
  { x: M, y: 2.05, w: 7.6, h: 4.0, barDir: "col", barGapWidthPct: 60, chartColors: [C.nar, C.grisMed],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelFontFace: "+mn-lt", dataLabelColor: C.tinta, dataLabelFormatCode: "\"S/ \"#,##0",
    catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", catAxisLabelColor: C.tinta, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 13, legendFontFace: "+mn-lt",
    showTitle: true, title: "Error medio por anuncio (S/ al mes) · menor es mejor", titleFontSize: 13, titleFontFace: "+mn-lt", titleColor: C.txt });
  texto(s, "Recomendaciones: 82% cumplen el perfil", { x: 8.6, y: 1.3, w: 4.13, h: 0.7, fontSize: 18, bold: true });
  s.addChart(pres.charts.BAR, [
    { name: "DepaRent", labels: [""], values: [81.8] }, { name: "Mejor orden del buscador", labels: [""], values: [23.3] }, { name: "Al azar", labels: [""], values: [25.1] }],
  { x: 8.6, y: 2.05, w: 4.13, h: 3.3, barDir: "col", barGapWidthPct: 40, chartColors: [C.nar, C.grisMed, "DEDCD7"],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelFontFace: "+mn-lt", dataLabelColor: C.tinta, dataLabelFormatCode: "0\"%\"",
    valAxisHidden: true, valAxisMaxVal: 100, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisHidden: true,
    showLegend: true, legendPos: "b", legendFontSize: 12, legendFontFace: "+mn-lt" });
  texto(s, "Primeras 12 opciones en 60 perfiles de prueba (precision@12)", { x: 8.6, y: 5.4, w: 4.13, h: 0.5, fontSize: 12, color: C.txt });
  texto(s, "Además: 296 de 296 análisis coherentes · 77 pruebas automáticas · el rango acierta en 94 de cada 100 anuncios",
    { x: M, y: 6.2, w: 12.1, h: 0.4, fontSize: 15, bold: true });
  texto(s, "Fuente: deliveries/week12/EvaluationReport.md y week10/resultados/validacion_2026_11_17 (MAE, 2,063 anuncios)", { x: M, y: 6.6, w: 12.1, h: 0.3, fontSize: 11, color: C.txt });
  s.addNotes(NOTAS[11]);

  // 13 · Por qué no es solo otro portal
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "4 · Conclusiones y recomendaciones" });
  titulo(s, "¿Por qué no es solo otro portal?");
  caja(s, M, 1.5, 4.3, 3.9, C.gris);
  texto(s, "Un portal", { x: M + 0.3, y: 1.7, w: 3.8, h: 0.5, fontFace: TIT, fontSize: 20 });
  texto(s, [{ text: "Muestra anuncios", options: { bullet: true, breakLine: true } }, { text: "Filtros", options: { bullet: true, breakLine: true } },
    { text: "El precio que pide el dueño", options: { bullet: true } }], { x: M + 0.3, y: 2.4, w: 3.8, h: 3, fontSize: 18, paraSpaceAfter: 10, color: C.txt });
  caja(s, 5.2, 1.5, 7.53, 3.9, C.dur);
  texto(s, "DepaRent", { x: 5.5, y: 1.7, w: 7, h: 0.5, fontFace: TIT, fontSize: 20 });
  texto(s, [{ text: "Interpreta el precio con un rango", options: { bullet: true, breakLine: true } },
    { text: "Lo compara con 8 departamentos parecidos", options: { bullet: true, breakLine: true } },
    { text: "Suma transporte y tendencia del distrito", options: { bullet: true, breakLine: true } },
    { text: "Propone tres precios de publicación", options: { bullet: true, breakLine: true } },
    { text: "Recomienda según el perfil del inquilino", options: { bullet: true, breakLine: true } },
    { text: "Avisa cuando la estimación no es precisa", options: { bullet: true } }], { x: 5.5, y: 2.4, w: 7, h: 3.3, fontSize: 18, paraSpaceAfter: 6, bold: true });
  texto(s, "Portal = información · DepaRent = apoyo a la decisión", { x: M, y: 5.75, w: 12.1, h: 0.55, fontFace: TIT, fontSize: 22, align: "center" });
  texto(s, "No compite con los portales: usa sus anuncios y enlaza al original.", { x: M, y: 6.35, w: 12.1, h: 0.35, fontSize: 13, color: C.txt, align: "center" });
  s.addNotes(NOTAS[12]);

  // 14 · Valor para el negocio
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "4 · Conclusiones y recomendaciones" });
  titulo(s, "Valor para el negocio");
  const col14 = [["Lo que ya hace", "medido", C.tinta, C.blanco, ["Baja a la mitad el error de la referencia típica", "Ordena 2,998 anuncios según el perfil", "Muestra evidencia: parecidos, rango y tendencia", "77 pruebas automáticas y 5 pruebas con personas"], 3.75],
    ["Impacto potencial", "hipótesis", C.dur, C.tinta, ["Propietario: menos riesgo de pedir de más o de menos", "Inquilino: menos tiempo en anuncios que no le sirven", "Corredores: precios con evidencia para sus clientes"], 3.95],
    ["Cómo podría monetizarse", "hipótesis", C.gris, C.tinta, ["Gratis para inquilinos (freemium)", "Análisis premium para propietarios", "Suscripción para corredores e inmobiliarias", "Panel o API para empresas (B2B)"], 3.9]];
  let x14 = M;
  col14.forEach(([t, etiqueta, fill, color, items, w]) => {
    caja(s, x14, 1.5, w, 4.75, fill);
    texto(s, t, { x: x14 + 0.25, y: 1.7, w: w - 0.5, h: 0.5, fontFace: TIT, fontSize: 17, color });
    texto(s, etiqueta.toUpperCase() === "MEDIDO" ? "Medido" : "Hipótesis, no validada", { x: x14 + 0.25, y: 2.2, w: w - 0.5, h: 0.3, fontSize: 13, bold: true, color: fill === C.tinta ? C.dur : C.narOsc });
    texto(s, items.map((it, i) => ({ text: it, options: { bullet: true, breakLine: i < items.length - 1 } })), { x: x14 + 0.25, y: 2.7, w: w - 0.5, h: 3.4, fontSize: 16, color, paraSpaceAfter: 8 });
    x14 += w + 0.27;
  });
  texto(s, "No medimos ingresos, conversiones ni ahorro: las dos columnas de la derecha son hipótesis para validar.", { x: M, y: 6.45, w: 12.1, h: 0.4, fontSize: 13, color: C.txt, italic: true });
  s.addNotes(NOTAS[13]);

  // 15 · Limitaciones
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "4 · Conclusiones y recomendaciones" });
  titulo(s, "Lo que DepaRent todavía no sabe");
  texto(s, "Límite", { x: M, y: 1.35, w: 4.2, h: 0.35, fontSize: 14, bold: true, color: C.txt });
  texto(s, "Cómo lo manejamos", { x: 4.95, y: 1.35, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: C.txt });
  [["Aprende precios pedidos, no de contrato", "Lo decimos en cada ficha: no es una tasación"],
    ["Alquileres desde S/ 7,000: el rango acierta 66 de cada 100", "Mostramos el rango y una advertencia"],
    ["Distritos con error alto: Los Olivos, Comas, San Martín de Porres…", "Aviso: «el precio estimado puede no ser exacto»"],
    ["Mercado por capturas (la última, 17-nov), no en tiempo real", "La app muestra la fecha de la captura"]].forEach(([a, b], i) => {
    const y = 1.8 + i * 0.95;
    caja(s, M, y, 4.15, 0.82, C.gris);
    texto(s, a, { x: M + 0.15, y, w: 3.9, h: 0.82, fontSize: 15, bold: true, valign: "middle" });
    texto(s, b, { x: 4.95, y, w: 3.6, h: 0.82, fontSize: 15, valign: "middle" });
  });
  const h15 = imagen(s, CAP("ficha_los_olivos.jpg"), 8.85, 1.8, 3.88, 3.0);
  pie_imagen(s, "El aviso en la ficha de un anuncio de Los Olivos", 8.85, 1.8 + h15 + 0.08, 3.88);
  texto(s, "No queremos que confíes a ciegas: te damos más información para decidir.", { x: M, y: 5.8, w: 12.1, h: 0.7, fontFace: TIT, fontSize: 20, valign: "middle" });
  s.addNotes(NOTAS[14]);

  // 16 · Conclusiones y recomendaciones
  s = pres.addSlide({ masterName: "CLARO", sectionTitle: "4 · Conclusiones y recomendaciones" });
  titulo(s, "Conclusiones y siguientes pasos");
  texto(s, "Conclusiones", { x: M, y: 1.4, w: 5.6, h: 0.45, fontFace: TIT, fontSize: 18 });
  ["El modelo baja a la mitad el error de la referencia típica y se mantuvo estable durante 9 semanas.",
    "Un mismo análisis responde al propietario («¿a cuánto?») y al inquilino («¿cuál?»).",
    "Las pruebas con 5 personas cambiaron el producto: menos texto, más guía y avisos honestos."].forEach((t, i) => {
    cuadro(s, i + 1, M, 2.05 + i * 1.3);
    texto(s, t, { x: M + 0.55, y: 1.98 + i * 1.3, w: 5.0, h: 1.15, fontSize: 17 });
  });
  [["Ahora", "Lima · alquiler · departamentos", C.gris],
    ["Siguiente", "Capturas periódicas y reentrenar · mejorar alquileres altos y distritos con pocos datos · medir el uso real con más personas", C.dur],
    ["Visión", "Otras ciudades y tipos de inmueble · corredores e inmobiliarias", C.nar]].forEach(([t, d, fill], i) => {
    const y = 1.4 + i * 1.65;
    caja(s, 6.8, y, 5.93, 1.45, fill);
    texto(s, t, { x: 7.05, y: y + 0.15, w: 5.4, h: 0.4, fontSize: 17, bold: true });
    texto(s, d, { x: 7.05, y: y + 0.55, w: 5.5, h: 0.85, fontSize: 15 });
  });
  texto(s, "La «Visión» es una dirección posible, no un plan validado.", { x: 6.8, y: 6.4, w: 5.93, h: 0.35, fontSize: 12, color: C.txt, italic: true });
  s.addNotes(NOTAS[15]);

  // 17 · Cierre
  s = pres.addSlide({ masterName: "NARANJA", sectionTitle: "4 · Conclusiones y recomendaciones" });
  texto(s, "DepaRent no decide por ti.", { x: M, y: 0.9, w: 12, h: 1.0, fontFace: TIT, fontSize: 44 });
  texto(s, "Te da contexto, evidencia y alternativas para que decidas mejor.", { x: M, y: 1.95, w: 12, h: 0.6, fontSize: 24 });
  caja(s, M, 3.0, 5.5, 1.7, C.tinta);
  texto(s, "Propietario", { x: M + 0.3, y: 3.15, w: 5, h: 0.45, fontSize: 18, bold: true, color: C.dur });
  texto(s, "decide cuánto pedir", { x: M + 0.3, y: 3.65, w: 5, h: 0.8, fontFace: TIT, fontSize: 26, color: C.blanco });
  caja(s, 6.4, 3.0, 5.5, 1.7, C.blanco);
  texto(s, "Inquilino", { x: 6.7, y: 3.15, w: 5, h: 0.45, fontSize: 18, bold: true, color: C.narOsc });
  texto(s, "decide dónde mirar", { x: 6.7, y: 3.65, w: 5, h: 0.8, fontFace: TIT, fontSize: 26 });
  texto(s, "Pruébalo: deparent.onrender.com", { x: M, y: 5.15, w: 12, h: 0.7, fontFace: TIT, fontSize: 28 });
  texto(s, "Gracias · ¿Preguntas?", { x: M, y: 6.05, w: 6, h: 0.45, fontSize: 18, bold: true });
  texto(s, "Adrian Urbina Mendoza · Armando Martinez Palomino · Breysi Salazar Medina · Luciana Yangali Cáceres", { x: M, y: 6.75, w: 12, h: 0.35, fontSize: 12 });
  s.addNotes(NOTAS[16]);

  // ================= RESPALDO =================
  pres.addSection({ title: "Respaldo" });
  const tabla = (s, filas, anchos, y = 1.45, tam = 13) => s.addTable(filas.map((f, i) => f.map((c) => ({ text: c, options: {
    bold: i === 0, color: i === 0 ? C.blanco : C.tinta, fill: { color: i === 0 ? C.tinta : (i % 2 ? C.blanco : "FAFAF8") }, fontFace: CUERPO, fontSize: tam, valign: "middle", margin: 0.06 } }))),
  { x: M, y, w: anchos.reduce((a, b) => a + b, 0), colW: anchos, border: { type: "solid", pt: 0.5, color: "E3E2DE" }, rowH: 0.42 });

  s = pres.addSlide({ masterName: "RESPALDO", sectionTitle: "Respaldo" });
  titulo(s, "Respaldo · Arquitectura");
  imagen(s, arq, M, 1.35, 12.13, 5.5, { line: { color: C.gris, width: 0 } });
  s.addNotes(NOTAS[17]);

  s = pres.addSlide({ masterName: "RESPALDO", sectionTitle: "Respaldo" });
  titulo(s, "Respaldo · Métricas del modelo de precio");
  tabla(s, [["Corte", "Anuncios", "MAE (IC 95%)", "MAPE", "R²", "Cobertura del rango", "MAE precio típico del distrito"],
    ["Prueba de septiembre (14-sep)", "629", "S/ 553", "18.8%", "0.762", "92.7%", "S/ 993"],
    ["Octubre (23-oct)", "1,712", "S/ 512 (476–551)", "16.4%", "0.785", "94.2%", "S/ 948"],
    ["Noviembre (9-nov)", "2,026", "S/ 541 (503–580)", "16.8%", "0.782", "93.5%", "S/ 1,024"],
    ["Noviembre (17-nov)", "2,063", "S/ 534 (497–573)", "16.4%", "0.797", "93.8%", "S/ 1,055"]], [2.9, 1.1, 1.9, 1.0, 0.9, 1.9, 2.43]);
  texto(s, [{ text: "Recomendador (60 perfiles): ", options: { bold: true } }, { text: "precision@12 81.8% · requisitos cumplidos 93.9% · nDCG@12 0.977 · buscador 16.6–23.3% · al azar 25.1%", options: { breakLine: true } },
    { text: "Perfiles: ", options: { bold: true } }, { text: "k = 4, silhouette 0.21, ARI 1.00 · ", options: {} }, { text: "Tendencia: ", options: { bold: true } }, { text: "SARIMA MAE mediano 2.00 S/ por m² (naive estacional 2.54, naive 2.40)", options: { breakLine: true } },
    { text: "Rango por precio: ", options: { bold: true } }, { text: "desde S/ 7,000 cubre 65.8%; bajo S/ 1,500, 91.3% (noviembre)" }],
  { x: M, y: 4.0, w: 12.1, h: 1.6, fontSize: 14, paraSpaceAfter: 8 });
  texto(s, "Fuente: deliveries/week12/EvaluationReport.md §1–§6b y week10/resultados/validacion_*", { x: M, y: 6.55, w: 12, h: 0.3, fontSize: 11, color: C.txt });
  s.addNotes(NOTAS[18]);

  s = pres.addSlide({ masterName: "RESPALDO", sectionTitle: "Respaldo" });
  titulo(s, "Respaldo · Métodos");
  tabla(s, [["Componente", "Método", "Qué responde", "Cómo se evaluó"],
    ["Precio esperado", "HistGradientBoosting + rango proporcional", "¿Cuánto vale?", "MAE frente a la mediana distrital; validación con capturas nuevas"],
    ["Tipo de departamento", "K-Means (k = 4) sobre características", "¿Con quién compite?", "Silhouette 0.21; estabilidad ARI 1.00"],
    ["Accesibilidad", "Distancia a paraderos ATU (cKDTree en metros)", "¿Está cerca del transporte?", "Reglas verificadas en pruebas automáticas"],
    ["Tendencia", "SARIMA sobre series del BCRP", "¿Sube o baja el distrito?", "MAE 2.00 frente a 2.54 y 2.40 de los naive"],
    ["Precios de publicación", "Reglas sobre precio, parecidos y tendencia", "¿A cuánto publico?", "296 de 296 análisis coherentes"],
    ["Recomendador", "Puntaje por contenido según el perfil", "¿Cuál me conviene?", "precision@12 81.8% en 60 perfiles"]], [2.4, 3.6, 2.5, 3.63], 1.45, 13);
  s.addNotes(NOTAS[19]);

  s = pres.addSlide({ masterName: "RESPALDO", sectionTitle: "Respaldo" });
  titulo(s, "Respaldo · Datos y validación");
  tabla(s, [["Fuente", "Qué aporta", "Fecha", "Uso"],
    ["Adondevivir y Urbania", "3,128 anuncios", "14-sep-2026", "Entrenar los modelos"],
    ["Adondevivir y Urbania", "12,235 anuncios distintos; 8 capturas completas", "20-oct a 17-nov-2026", "Mercado de la app (2,998 únicos del 17-nov) y validación"],
    ["ATU", "3,233 paraderos", "Mayo de 2021", "Accesibilidad"],
    ["BCRP", "13 series trimestrales de precio por m²", "2013-T3 a 2026-T1", "Tendencia del distrito"]], [2.6, 3.9, 2.4, 3.23]);
  texto(s, [{ text: "Validación sin fuga: ", options: { bold: true } },
    { text: "se quitan los anuncios vistos en septiembre y sus duplicados probables entre portales; el modelo no se reentrena. El 17-nov se evaluaron 2,063 anuncios nuevos.", options: { breakLine: true } },
    { text: "Privacidad: ", options: { bold: true } }, { text: "al repositorio no llegan direcciones ni contactos de los anuncios." }],
  { x: M, y: 4.0, w: 12.1, h: 1.4, fontSize: 14, paraSpaceAfter: 8 });
  s.addNotes(NOTAS[20]);

  const salida = path.join(AQUI, "PresentationFinal.pptx");
  await pres.writeFile({ fileName: salida });
  console.log("Escrito", salida);
}

main().catch((e) => { console.error(e); process.exit(1); });
