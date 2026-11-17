/* Iconos de línea, dibujados a mano en una cuadrícula de 24 px. Heredan el color del texto (currentColor).
   Pruebas con propietarios (P5 y P6): pidieron menos texto y más elementos visuales que orienten. */

const TRAZOS = {
  ubicacion: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  tamano: '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="2 3"/>',
  cama: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M3 18v2M21 18v2"/><path d="M6 9V6.5A1.5 1.5 0 0 1 7.5 5h3A1.5 1.5 0 0 1 12 6.5V9"/>',
  bano: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 3.5-1.3M8 19l-1 2M16 19l1 2"/>',
  auto: '<path d="M5 16V12l2-5h10l2 5v4M3 16h18v2H3zM7 16v2M17 16v2"/><circle cx="7.5" cy="13" r=".8"/><circle cx="16.5" cy="13" r=".8"/>',
  edificio: '<path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  estrella: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z"/>',
  moneda: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.5 5.8 4.3 0 1.2-1.2 2.1-2.9 2.1-1.3 0-2.4-.6-2.9-1.5M12 6.3v1.5M12 16.6v1.4"/>',
  casa: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
  buscar: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  corazon: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  publicar: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 14v5h14v-5"/>',
  grafico: '<path d="M4 20V4M4 20h16M8 16l3.5-4 3 2.5L20 8"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  persona: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
  familia: '<circle cx="8" cy="8" r="2.8"/><circle cx="16.5" cy="9.5" r="2.2"/><path d="M3 19c.6-3.3 2.6-5.3 5-5.3s4.4 2 5 5.3M13.5 19c.4-2.4 1.6-3.8 3-3.8s2.7 1.4 3.2 3.8"/>',
  mascota: '<ellipse cx="12" cy="16" rx="4" ry="3.4"/><circle cx="6.5" cy="11" r="1.7"/><circle cx="17.5" cy="11" r="1.7"/><circle cx="9.5" cy="6.8" r="1.7"/><circle cx="14.5" cy="6.8" r="1.7"/>',
  bus: '<rect x="5" y="3.5" width="14" height="14" rx="2.5"/><path d="M5 11h14M8 17.5V20M16 17.5V20"/><circle cx="8.5" cy="14.3" r=".8"/><circle cx="15.5" cy="14.3" r=".8"/>',
};

export function icono(nombre, clase = "icono") {
  const trazo = TRAZOS[nombre];
  if (!trazo) return "";
  return `<svg class="${clase}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${trazo}</svg>`;
}

// Icono de cada tipo de hogar del recomendador.
export const ICONO_HOGAR = { familia: "familia", pareja: "corazon", estudiante: "persona", mascota: "mascota", mayor: "persona" };

// Icono de cada campo numérico del formulario.
export const ICONO_CAMPO = {
  area_total: "tamano", dormitorios: "cama", banos: "bano", estacionamientos: "auto",
  antiguedad: "edificio", mantenimiento: "moneda",
};
