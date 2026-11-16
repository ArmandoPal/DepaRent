import { llamar, obtenerOpciones, sesion } from "./api.js";
import { $, esc, num, pct, soles, titulo, valoracionSencilla } from "./util.js";

// Caso de ejemplo de la portada: solo los cuatro datos que el cartel deja ver.
const EQUIPO = [
  ["Adrian Urbina Mendoza", "Coordinación, datos y mantenimiento"],
  ["Armando Martinez Palomino", "Fuentes externas"],
  ["Breysi Salazar Medina", "Modelado"],
  ["Luciana Yangali Cáceres", "Producto y diseño"],
];

const EJEMPLO = { distrito_norm: "miraflores", area_total: 90, dormitorios: 3, banos: 2 };
const DISTRITOS_CARTA = ["miraflores", "lince", "san miguel"];
const LETRAS = ["D", "e", "p", "a", "R", "e", "n", "t"];

export async function vistaInicio(main) {
  const opciones = await obtenerOpciones().catch(() => null);
  // Mercado: la captura que muestra la app. Modelo: entrenado con septiembre y validado con la captura más reciente.
  const captura = opciones?.mercado?.captura_texto;
  const val = opciones?.validacion;
  const mesVal = val?.mes;
  const errorTexto = val ? `Al comprobarlo con ${num(val.evaluados)} anuncios nuevos de ${esc(mesVal)}, nos equivocamos en promedio <b>${soles(val.mae_soles)} al mes</b>.`
    : "La validación del modelo no está disponible en este momento.";
  const conCuenta = Boolean(sesion());
  main.innerHTML = `
    <div class="home">
      <section class="home-hero">
        <h1 class="lines home-title">
          <span class="line"><span data-line style="--i:0">Se alquila.</span></span>
          <span class="line"><span data-line style="--i:1">¿A cuánto?</span></span>
        </h1>
        <div class="home-intro">
          <p class="home-lead">Estima un alquiler con rango y comparables. Busca departamentos según tu presupuesto en Lima.</p>
          <nav class="home-choices" aria-label="Qué quieres hacer">
            <a href="#/probar">Quiero estimar <span aria-hidden="true">↗</span></a>
            <a href="#/buscar">Quiero buscar <span aria-hidden="true">↗</span></a>
          </nav>
          <p class="home-choice-note">Prueba sin cuenta. También puedes <a href="${conCuenta ? "#/para-ti" : "#/para-ti-demo"}">ver opciones para ti</a>.</p>
        </div>
        <p class="home-fact">${errorTexto}</p>
        <div class="hero-stage">
        <img class="hero-foto" src="assets/balcon-en-calle-jiron-ancash-lima-peru.jpg" width="1280" height="1983" fetchpriority="high"
          alt="Balcón de madera sobre un muro rojo en el Jirón Áncash, centro de Lima">
        <form class="cartel" data-ui aria-label="Estimador de alquiler" novalidate>
          <p class="cartel-kind">Departamento en</p>
          <label class="cartel-district"><span class="sr-only">Distrito</span>
            <select name="distrito_norm">${(opciones?.distritos || ["miraflores"]).filter((d) => d !== "otros")
              .map((d) => `<option value="${esc(d)}" ${d === EJEMPLO.distrito_norm ? "selected" : ""}>${esc(titulo(d))}</option>`).join("")}</select>
          </label>
          <div class="cartel-fields">
            <label><input name="area_total" type="number" inputmode="numeric" min="25" max="450" value="${EJEMPLO.area_total}"><span>m²</span></label>
            <label><input name="dormitorios" type="number" inputmode="numeric" min="0" max="10" value="${EJEMPLO.dormitorios}"><span>dorm.</span></label>
            <label><input name="banos" type="number" inputmode="numeric" min="0" max="10" value="${EJEMPLO.banos}"><span>baños</span></label>
          </div>
          <output class="cartel-price" aria-live="polite"><span data-precio><span class="moneda">S/</span>…</span><small>al mes</small></output>
          <p class="cartel-range" data-rango>Calculando con el modelo…</p>
          <p class="cartel-limit">Rango orientativo: en alquileres altos, la cobertura observada fue menor que el promedio. Revisa los comparables antes de publicar.</p>
          <a class="cartel-link" data-analisis-completo href="#/probar">Ver el análisis de estos datos</a>
          <p class="cartel-foot">Modelo DepaRent, entrenado con anuncios de septiembre${mesVal ? ` y validado con los de ${esc(mesVal)}` : "; validación no disponible ahora"}</p>
        </form>
        </div>
      </section>

      <section class="home-prices" aria-labelledby="titulo-precios">
        <div class="stack">
          <span class="stack-line stack-deco" data-palabra="Competitivo." aria-hidden="true"></span>
          <h2 id="titulo-precios" class="stack-line stack-strong">Tres precios.</h2>
          <span class="stack-line stack-deco" data-palabra="Renta superior." aria-hidden="true"></span>
        </div>
        <div class="prices-row">
        <figure class="price-object" data-ui data-reveal style="--i:1">
          <figcaption>Mismo ejemplo del cartel: 90 m² en Miraflores</figcaption>
          <ol class="price-object-list" data-escenarios>
            <li><span>Competitivo</span><b>S/ —</b></li><li><span>Equilibrado</span><b>S/ —</b></li><li><span>Renta superior</span><b>S/ —</b></li>
          </ol>
        </figure>
        <div class="price-facts" data-reveal style="--i:3">
          <p>No te damos un solo número. El precio equilibrado redondea la estimación del cartel a S/ 10; el competitivo se acerca a los anuncios parecidos más baratos y el de renta superior, a los más caros. Tú decides cuánto pedir.</p>
          <p data-motivo>La tendencia del distrito decide cuál sugerimos: si la serie del BCRP proyecta alza, hay margen para pedir más.</p>
        </div>
        </div>
      </section>

      <section class="home-lima" aria-labelledby="titulo-lima">
        <div class="home-lima-head">
          <p class="home-lima-kicker">Vivir en Lima</p>
          <h2 id="titulo-lima">Cada barrio cuenta algo distinto.</h2>
          <p>Estas fotografías muestran la ciudad. Para conocer los departamentos publicados, usa la búsqueda y revisa cada anuncio.</p>
        </div>
        <div class="home-lima-grid">
          <figure class="home-lima-photo" data-reveal style="--i:0">
            <img src="assets/magdalena-edificios.jpg" width="1280" height="720" loading="lazy" decoding="async" alt="Calle arbolada y edificios de departamentos en Magdalena del Mar, Lima">
            <figcaption><strong>Magdalena del Mar</strong><span>Edificios y vida de barrio</span></figcaption>
          </figure>
          <figure class="home-lima-photo" data-reveal style="--i:1">
            <img src="assets/san-miguel-edificios.jpg" width="1280" height="1280" loading="lazy" decoding="async" alt="Edificios residenciales junto a la avenida La Marina en San Miguel, Lima">
            <figcaption><strong>San Miguel</strong><span>Vivienda junto a una avenida principal</span></figcaption>
          </figure>
          <figure class="home-lima-photo" data-reveal style="--i:2">
            <img src="assets/lince-edificio.jpg" width="1280" height="1707" loading="lazy" decoding="async" alt="Edificio de departamentos y corredor de transporte en Lince, Lima">
            <figcaption><strong>Lince</strong><span>Un edificio junto al corredor de transporte</span></figcaption>
          </figure>
        </div>
        <a class="home-lima-action" href="#/buscar">Explorar departamentos <span aria-hidden="true">↗</span></a>
      </section>

      <section class="home-steps" aria-labelledby="titulo-pasos">
        ${["describes", "comparamos", "ubicamos", "publicas"].map((paso, i) => `
          <div class="step-field step-${paso}">
            ${i === 0 ? '<h2 id="titulo-pasos" class="step-title">Así funciona</h2>' : ""}
            <article class="ficha" data-ui data-paso="${paso}" data-reveal style="--i:${i}">
              <p class="ficha-name">Depa familiar en Miraflores</p>
              <p class="ficha-row">90 m² · 3 dorm. · 2 baños</p>
            </article>
            <p class="step-clause">${["Primero lo describes: área, dormitorios y amenidades.", "Luego lo comparamos con sus anuncios más parecidos.",
              "Después lo ubicamos frente al transporte y su distrito.", "Al final, lo publicas al precio que elijas."][i]}</p>
          </div>`).join("")}
      </section>

      <section class="home-proof" aria-labelledby="titulo-medimos">
        <div class="proof-card" data-reveal>
          <h2 id="titulo-medimos">Lo que medimos</h2>
          <img class="proof-foto" src="assets/buildings-in-miraflores-district-lima-peru.jpg" width="1920" height="1440" loading="lazy" decoding="async"
            alt="Edificios de departamentos sobre el acantilado de Miraflores, bajo el cielo gris de Lima">
          <p>Modelo entrenado con 3,128 anuncios de septiembre&nbsp;·&nbsp;${val ? `probado con ${num(val.evaluados)} anuncios nuevos de ${esc(mesVal)}&nbsp;·&nbsp;` : ""}3,233 paraderos de la ATU&nbsp;·&nbsp;13 series del BCRP</p>
          <p>${val ? `En ${esc(mesVal)}, el error medio fue ${soles(val.mae_soles)} y el precio anunciado cayó en el rango estimado ${Math.round(val.cobertura * 100)} de cada 100 veces.&nbsp;·&nbsp;` : "La validación reciente no está disponible ahora.&nbsp;·&nbsp;"}8 departamentos parecidos para comparar</p>
          <h3>Y lo que no</h3>
          <p>Son precios pedidos, no contratos&nbsp;·&nbsp;${captura ? `la búsqueda es una foto del mercado del ${esc(captura)}&nbsp;·&nbsp;` : ""}paraderos del inventario de 2021&nbsp;·&nbsp;no es una tasación</p>
        </div>
      </section>

      <section class="home-carta" aria-labelledby="titulo-carta">
        <img class="carta-fondo" src="assets/lima-peru-apartments.jpg" width="1630" height="1225" loading="lazy" decoding="async"
          alt="Edificios de departamentos con balcones en Lima">
        <div class="carta" data-reveal>
          <h2 id="titulo-carta">La carta de alquileres</h2>
          <p class="carta-note">Para quien busca: hasta cuatro departamentos de dos o más dormitorios por distrito, ordenados por precio pedido y comparados con la estimación del modelo.</p>
          <div class="carta-groups" data-carta>${DISTRITOS_CARTA.map((d) => `<section class="carta-group"><h3>${esc(titulo(d))}</h3><p class="carta-wait">Cargando…</p></section>`).join("")}</div>
          <p class="carta-close">${captura ? `Anuncios del ${esc(captura)}<br>` : ""}<a href="#/buscar">Buscar con tus propios filtros</a></p>
        </div>
      </section>

      <section class="home-about" aria-labelledby="titulo-equipo">
        <div class="about-head">
          <h2 id="titulo-equipo" class="about-title">Quiénes somos</h2>
          <p class="about-intro" data-reveal><b>DepaRent</b> es el proyecto de cuatro estudiantes de Ciencia de Datos de UTEC
            para el curso DS3022 Desarrollo de Producto de Datos, ciclo 2026-2.</p>
        </div>
        <ul class="about-team">
          ${EQUIPO.map(([nombre, rol], i) => `<li class="miembro" data-reveal style="--i:${i}">
            <span class="miembro-num">0${i + 1}</span><b class="miembro-nombre">${esc(nombre)}</b><span class="miembro-rol">${esc(rol)}</span></li>`).join("")}
        </ul>
        <div class="about-foot" data-reveal>
          <p>Partimos de la pregunta que se hace cualquier propietario antes de pegar el cartel en la ventana: <b>¿a cuánto lo alquilo?</b>
            Reunimos miles de anuncios, paraderos y trece series de precios, y construimos un modelo que estima el alquiler y dice cuánto se equivoca.</p>
          <p>No reemplaza a una tasación: es una segunda opinión con datos.</p>
          <a class="about-link" href="#/probar">Pruébalo con tu departamento</a>
        </div>
      </section>

      <section class="home-reply" aria-labelledby="titulo-respuesta">
        <img class="reply-fondo" src="assets/malecon-de-miraflores-lima.jpg" width="1920" height="1440" loading="lazy" decoding="async"
          alt="El malecón de Miraflores y el mar bajo el cielo nublado">
        <p class="reply-aside" data-reveal>¿Buscas dónde vivir? No necesitas cuenta: filtra por distrito y presupuesto, y compara cada precio pedido con una estimación orientativa. <a href="#/buscar">Buscar departamentos</a></p>
        <div class="reply-card" data-reveal style="--i:1">
          <h2 id="titulo-respuesta">Publica a tu precio</h2>
          <p>Guarda tus departamentos, revisa su análisis cuando quieras y publícalos con el precio que elijas.</p>
          <a class="reply-action" href="${conCuenta ? "#/mis-departamentos" : "#/ingresar?modo=registro"}">${conCuenta ? "Ir a mis departamentos" : "Crear mi cuenta"}</a>
        </div>
      </section>

      <footer class="home-footer">
        <p class="blocks" role="img" aria-label="DepaRent">${LETRAS.map((l, i) => `<span class="bloque bloque-${i % 4}" style="--h:${[100, 72, 86, 64, 96, 70, 82, 90][i]}%" aria-hidden="true">${l}</span>`).join("")}</p>
        <nav class="footer-cols" aria-label="Pie de página">
          <div><h3>Propietarios</h3><a href="#/ingresar?modo=registro">Crear cuenta</a><a href="#/ingresar">Ingresar</a><a href="#/probar">Probar sin cuenta</a></div>
          <div><h3>Inquilinos</h3><a href="#/buscar">Buscar departamentos</a><a href="${conCuenta ? "#/para-ti" : "#/para-ti-demo"}">Ver opciones para ti</a></div>
          <div><h3>Datos</h3><p>Anuncios de Adondevivir y Urbania: modelo con septiembre de 2026${captura ? `, búsqueda con el ${esc(captura)}` : ""}</p><p>Paraderos ATU, mayo de 2021</p><p>Series BCRP, 2013 a 2026</p></div>
          <div><h3>Curso</h3><p>DS3022 Desarrollo de Producto de Datos</p><p>UTEC, Lima · 2026-2</p></div>
        </nav>
        <p class="credits">Fotos de Wikimedia Commons:
          <a href="https://commons.wikimedia.org/wiki/File:Balc%C3%B3n_en_calle_Jir%C3%B3n_Ancash,_Lima,_Per%C3%BA,_2015-07-28,_DD_82.JPG">«Balcón en calle Jirón Ancash»</a> de Diego Delso, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Buildings_in_Miraflores_district,_Lima,_Peru.jpg">«Buildings in Miraflores district»</a> de Ianyou78, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Lima,_Peru_Apartments.jpg">«Lima, Peru Apartments»</a> de Quado678, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Malec%C3%B3n_de_Miraflores_-_Lima.jpg">«Malecón de Miraflores»</a> de Angela Vanessa Ortiz, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Lima,_Per%C3%BA_-_Edificios_de_Magdalena_del_mar.jpg">«Edificios de Magdalena del Mar»</a> de Unitumu, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Apartment_complex_in_San_Miguel,_Lima,_Peru_-_2.jpg">«Apartment complex in San Miguel»</a> de Cifras Confiables, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Edificios_en_Lima_Per%C3%BA_23.jpg">«Edificios en Lima Perú 23»</a> de Ciudades, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Lima,_Peru_-_Streets_of_Barranco.jpg">«Streets of Barranco»</a> de Donairesunovi, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:Lima_Peru_city_-_Modern_Apartment_-_outside.jpg">«Modern Apartment»</a> de Protontorniyo, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>;
          <a href="https://commons.wikimedia.org/wiki/File:San_Isidro,_Lima,_Peru_-_residential_buildings_skyline.jpg">«San Isidro residential buildings»</a> de Juaniotolp, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>.
          Muestran Lima, no los departamentos de los anuncios.</p>
        <div class="footer-last"><p>Prototipo académico. Precios pedidos en anuncios, no contratos ni tasaciones.</p><a class="footer-top" href="#/">Volver arriba</a></div>
      </footer>
    </div>`;

  activarEstimador($(".cartel", main));
  cargarEjemplo(main);
  cargarCarta($("[data-carta]", main));
  $(".footer-top", main).addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({ top: 0 }); });
}

function activarEstimador(form) {
  const precio = $("[data-precio]", form), rango = $("[data-rango]", form);
  const enlace = $("[data-analisis-completo]", form);
  let espera = null, turno = 0;
  function entrada() {
    const datos = new FormData(form);
    const vivienda = { distrito_norm: datos.get("distrito_norm") };
    for (const campo of ["area_total", "dormitorios", "banos"]) vivienda[campo] = Number(datos.get(campo));
    const valido = [["area_total", 25, 450], ["dormitorios", 0, 10], ["banos", 0, 10]].every(([campo, min, max]) => {
      const texto = datos.get(campo), valor = vivienda[campo];
      return texto != null && texto !== "" && Number.isFinite(valor) && valor >= min && valor <= max
        && (campo === "area_total" || Number.isInteger(valor));
    });
    if (valido) {
      const params = new URLSearchParams({ distrito: vivienda.distrito_norm,
        area: String(vivienda.area_total), dormitorios: String(vivienda.dormitorios), banos: String(vivienda.banos) });
      enlace.href = `#/probar?${params}`;
    } else enlace.removeAttribute("href");
    enlace.setAttribute("aria-disabled", String(!valido));
    enlace.textContent = valido ? "Ver el análisis de estos datos" : "Completa los datos para continuar";
    return vivienda;
  }
  async function calcular() {
    const vivienda = entrada();
    const actual = ++turno;
    try {
      const r = await llamar("/api/estimar", { cuerpo: vivienda });
      if (actual !== turno) return;
      precio.innerHTML = `<span class="moneda">S/</span>${num(r.precio_estimado_soles)}`;
      rango.textContent = `Rango estimado: ${soles(r.limite_inferior_soles)} a ${soles(r.limite_superior_soles)}`;
      form.classList.remove("is-error");
    } catch (e) {
      if (actual !== turno) return;
      precio.innerHTML = '<span class="moneda">S/</span>…';
      rango.textContent = e.estado === 422 ? e.message : "No pudimos calcular ahora. Intenta en unos segundos.";
      form.classList.add("is-error");
    }
  }
  // Sin animación en la cifra: cambia cada vez que el visitante escribe.
  form.addEventListener("input", () => { entrada(); clearTimeout(espera); espera = setTimeout(calcular, 250); });
  form.addEventListener("submit", (e) => { e.preventDefault(); calcular(); });
  calcular();
}

async function cargarEjemplo(main) {
  let a;
  try {
    a = await llamar("/api/analizar", { cuerpo: { vivienda: EJEMPLO } });
  } catch {
    $("[data-motivo]", main).textContent = "No pudimos cargar el ejemplo ahora. Puedes probar el análisis con tus propios datos.";
    return;
  }
  $("[data-escenarios]", main).innerHTML = a.publicacion.escenarios.map((s) =>
    `<li class="${s.sugerido ? "is-sugerido" : ""}"><span>${esc(s.escenario)}${s.sugerido ? " · sugerido" : ""}</span><b>${soles(s.precio_soles)}</b></li>`).join("");
  $("[data-motivo]", main).textContent = a.publicacion.motivo;
  const sugerido = a.publicacion.escenarios.find((s) => s.sugerido);
  const c = a.perfil, acc = a.accesibilidad, t = a.tendencia;
  const filas = {
    comparamos: [`Perfil: ${c.perfil.perfil}`, `8 parecidos piden ${soles(c.precio_p25_soles)} a ${soles(c.precio_p75_soles)}`],
    ubicamos: [`Perfil: ${c.perfil.perfil}`, `Paradero a ${num(acc.dist_paradero_min_m)} m · acceso ${acc.nivel.toLowerCase()}`,
      `Distrito ${t.tendencia.toLowerCase()} (${pct(t.cambio_porcentaje)})`],
    publicas: [`Paradero a ${num(acc.dist_paradero_min_m)} m · tendencia ${t.tendencia.toLowerCase()}`,
      `Precio sugerido: ${soles(sugerido.precio_soles)}`, `${sugerido.escenario}, ${pct(sugerido.diferencia_vs_esperado_porcentaje)} sobre lo esperado`],
  };
  for (const [paso, lineas] of Object.entries(filas)) {
    const ficha = $(`[data-paso="${paso}"]`, main);
    ficha.insertAdjacentHTML("beforeend", lineas.map((l, i) => `<p class="ficha-row ${paso === "publicas" && i === 1 ? "ficha-strong" : ""}">${esc(l)}</p>`).join(""));
  }
}

async function cargarCarta(contenedor) {
  const grupos = await Promise.all(DISTRITOS_CARTA.map((d) =>
    llamar("/api/buscar", { cuerpo: { distritos: [d], dormitorios_min: 2, area_min: 45, orden: "precio", limite: 4 } }).catch(() => null)));
  contenedor.innerHTML = DISTRITOS_CARTA.map((d, i) => {
    const r = grupos[i];
    const items = r?.resultados?.length ? r.resultados.map((x) => `
      <li><span class="carta-item">${num(x.dormitorios)} dorm. · ${num(x.area_total)} m²${x.nombre ? ` · ${esc(x.nombre)}` : ""}</span>
        <span class="carta-price">${soles(x.precio_soles)}</span>
        <span class="carta-desc">${esc(valoracionSencilla(x.valoracion))} (${pct(x.diferencia_estimado_porcentaje)}) · paradero a ${num(x.dist_paradero_min_m)} m</span></li>`).join("")
      : `<li class="carta-wait">${r ? "Sin anuncios con estos filtros." : "No pudimos cargar los anuncios ahora."}</li>`;
    return `<section class="carta-group"><h3>${esc(titulo(d))}</h3><ul>${items}</ul></section>`;
  }).join("");
}
