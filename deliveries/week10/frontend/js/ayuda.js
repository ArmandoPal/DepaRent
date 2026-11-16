/* Ayuda de navegación. Las preguntas se responden aquí, sin enviar texto a la API. */

const TEMAS = [
  {
    id: "estimar",
    pregunta: "¿Cómo estimo un alquiler?",
    respuesta: "Abre «Probar el análisis» e ingresa los datos del departamento. Verás una estimación, un rango y anuncios comparables. Son referencias basadas en precios pedidos, no contratos cerrados.",
    enlace: "#/probar",
    accion: "Probar el análisis",
    patron: /estim|calcular|valor|rango|cuanto.*alquil|precio.*depa|precio.*alquil/,
  },
  {
    id: "buscar",
    pregunta: "¿Cómo busco y comparo?",
    respuesta: "En «Buscar departamentos» filtra por distrito, presupuesto y características. Pulsa «Comparar» en hasta tres anuncios para verlos lado a lado. La captura de mercado es histórica; confirma la disponibilidad antes de decidir.",
    enlace: "#/buscar",
    accion: "Buscar departamentos",
    patron: /busc|compar|filtro|anuncio|disponib/,
  },
  {
    id: "recomendar",
    pregunta: "¿Cómo veo recomendaciones?",
    respuesta: "En «Para ti» puedes probar con tipo de hogar, presupuesto y distrito sin crear una cuenta. Verás opciones y motivos. La prueba no guarda el perfil ni las opciones; para guardarlas, crea una cuenta y configura tu perfil.",
    enlace: "#/para-ti-demo",
    accion: "Probar recomendaciones",
    patron: /recomen|para ti|perfil|opciones para mi/,
  },
  {
    id: "publicar",
    pregunta: "¿Cómo publico mi departamento?",
    respuesta: "Crea una cuenta o ingresa, agrega los datos de tu departamento y revisa el análisis. Después podrás elegir un precio de publicación. El departamento solo aparece para inquilinos cuando lo publicas.",
    enlace: "#/ingresar",
    accion: "Ingresar o crear cuenta",
    patron: /public|propiet|ofrecer|poner.*alquil|registrar.*depa|agregar.*depa/,
  },
  {
    id: "guardar",
    pregunta: "¿Cómo guardo opciones?",
    respuesta: "Necesitas una cuenta y un perfil de búsqueda. En tus recomendaciones usa «Guardar»; luego las encuentras en la pestaña «Guardados». La prueba sin cuenta no conserva las opciones.",
    enlace: "#/ingresar",
    accion: "Ingresar o crear cuenta",
    patron: /guard|favorit|registrarme|crear cuenta|ingres/,
  },
  {
    id: "panel",
    pregunta: "¿Qué muestra el panel de análisis?",
    respuesta: "El panel está reservado a cuentas de analista. Sus conteos de cuentas, publicaciones, guardados y mensajes salen de la base de uso; las métricas del modelo vienen de evaluaciones guardadas. No registra alquileres cerrados ni ingresos.",
    enlace: "#/analista",
    accion: "Abrir panel de análisis",
    patron: /panel|tablero|indicador|supervis|analist/,
  },
];

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function encontrar(texto) {
  return TEMAS.find((tema) => tema.patron.test(normalizar(texto)));
}

function mensaje(lista, texto, quien, tema = null) {
  const bloque = document.createElement("div");
  bloque.className = `ayuda-mensaje ayuda-${quien}`;
  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  bloque.append(parrafo);
  if (tema) {
    const enlace = document.createElement("a");
    enlace.href = tema.enlace;
    enlace.textContent = tema.accion;
    bloque.append(enlace);
  }
  lista.append(bloque);
  while (lista.children.length > 41) lista.children[1]?.remove();
  lista.scrollTop = lista.scrollHeight;
}

export function iniciarAyuda() {
  if (document.getElementById("ayuda-deparent")) return;

  const contenedor = document.createElement("div");
  contenedor.id = "ayuda-deparent";
  contenedor.className = "ayuda-deparent";
  contenedor.innerHTML = `
    <button class="ayuda-abrir" type="button" aria-controls="ayuda-panel" aria-expanded="false">
      <span class="ayuda-icono" aria-hidden="true">?</span> Ayuda
    </button>
    <section class="ayuda-panel" id="ayuda-panel" role="dialog" aria-labelledby="ayuda-titulo" hidden>
      <header class="ayuda-cabecera">
        <div><h2 id="ayuda-titulo">¿En qué te ayudo?</h2><p>Guía automática de DepaRent</p></div>
        <button class="ayuda-cerrar" type="button" aria-label="Cerrar ayuda">Cerrar</button>
      </header>
      <div class="ayuda-mensajes" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="ayuda-preguntas" aria-label="Preguntas frecuentes">
        ${TEMAS.slice(0, 4).map((tema) => `<button type="button" data-tema="${tema.id}">${tema.pregunta}</button>`).join("")}
      </div>
      <form class="ayuda-formulario">
        <label for="ayuda-pregunta">Tu pregunta</label>
        <div><input id="ayuda-pregunta" type="text" maxlength="180" autocomplete="off" placeholder="Escribe una pregunta sobre la página">
          <button type="submit">Enviar</button></div>
      </form>
      <p class="ayuda-aviso">Respuestas sobre cómo usar la página. No es atención humana ni IA generativa; tus preguntas no se envían al servidor.</p>
    </section>`;
  document.body.append(contenedor);

  const abrir = contenedor.querySelector(".ayuda-abrir");
  const panel = contenedor.querySelector(".ayuda-panel");
  const cerrar = contenedor.querySelector(".ayuda-cerrar");
  const lista = contenedor.querySelector(".ayuda-mensajes");
  const entrada = contenedor.querySelector("#ayuda-pregunta");
  const formulario = contenedor.querySelector(".ayuda-formulario");

  mensaje(lista, "Puedo orientarte para estimar, buscar, comparar, recibir recomendaciones o publicar. Elige una pregunta o escribe la tuya.", "guia");

  function mostrar(abierto, devolverFoco = false) {
    panel.hidden = !abierto;
    abrir.setAttribute("aria-expanded", String(abierto));
    if (abierto) entrada.focus();
    else if (devolverFoco) abrir.focus();
  }

  function responder(pregunta) {
    const texto = pregunta.trim().slice(0, 180);
    if (!texto) return;
    mensaje(lista, texto, "usuario");
    const tema = encontrar(texto);
    if (tema) mensaje(lista, tema.respuesta, "guia", tema);
    else mensaje(lista, "Puedo ayudarte a estimar un alquiler, buscar y comparar anuncios, ver recomendaciones, guardar opciones o publicar un departamento. Prueba una de las preguntas de arriba.", "guia");
    entrada.value = "";
    entrada.focus();
  }

  abrir.addEventListener("click", () => mostrar(panel.hidden, !panel.hidden));
  cerrar.addEventListener("click", () => mostrar(false, true));
  panel.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      evento.preventDefault();
      mostrar(false, true);
      return;
    }
    // En teléfono el panel ocupa la pantalla: el tabulador permanece dentro.
    if (evento.key !== "Tab" || !window.matchMedia("(max-width: 640px)").matches) return;
    const controles = [...panel.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')]
      .filter((control) => control.getClientRects().length > 0);
    const primero = controles[0], ultimo = controles.at(-1);
    if (!primero) return;
    if (!panel.contains(document.activeElement)) {
      evento.preventDefault();
      (evento.shiftKey ? ultimo : primero).focus();
    } else if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    responder(entrada.value);
  });
  contenedor.querySelectorAll("[data-tema]").forEach((boton) => boton.addEventListener("click", () => {
    const tema = TEMAS.find((item) => item.id === boton.dataset.tema);
    if (tema) responder(tema.pregunta);
  }));
  window.addEventListener("hashchange", () => {
    if (!panel.hidden) mostrar(false);
  });
}
