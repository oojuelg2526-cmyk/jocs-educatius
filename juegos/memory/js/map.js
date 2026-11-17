// Mapa esquemático de Barcelona en SVG (sin <canvas>). Cada pareja acertada ilumina su barrio.
// Es un esquema: costa, Montjuïc, Collserola, Ciutat Vella, la cuadrícula del Eixample y la Diagonal.
// [PENDENT] cambiar por los contornos reales de los barrios (Open Data BCN) si da tiempo.
import { t } from "./lang.js";
import { MONUMENTS } from "./levels.js";

const NS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent?.append(node);
  return node;
}

// Fondo del mapa: se dibuja una sola vez.
function drawBase(svg) {
  const defs = el("defs", {}, svg);
  // Manzanas del Eixample con chaflanes, giradas como en el plano real.
  const pat = el("pattern", { id: "map-eixample", width: 10, height: 10, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-44)" }, defs);
  el("path", { d: "M2.5 1h5l1.5 1.5v5L7.5 9h-5L1 7.5v-5z", class: "map-block" }, pat);
  const clip = el("clipPath", { id: "map-eixample-clip" }, defs);
  el("path", { d: "M92 118 L150 92 L232 120 L250 150 L206 168 L150 172 L104 160 Z" }, clip);

  el("rect", { x: 0, y: 0, width: 320, height: 260, class: "map-land" }, svg);
  // Collserola (arriba) y Montjuïc (abajo a la izquierda).
  el("path", { d: "M0 0H320V40C290 58 262 44 236 56S186 46 160 54 110 40 84 52 34 42 0 58Z", class: "map-hill" }, svg);
  el("path", { d: "M0 8C30 24 54 14 80 26S128 18 150 30", class: "map-contour" }, svg);
  el("path", { d: "M52 196C56 176 82 168 100 182S106 214 86 218 50 214 52 196Z", class: "map-hill" }, svg);
  // Ríos Llobregat y Besòs.
  el("path", { d: "M14 60C20 120 8 180 26 248", class: "map-river" }, svg);
  el("path", { d: "M300 40C292 80 304 112 296 140", class: "map-river" }, svg);
  // Eixample, Ciutat Vella y la Diagonal.
  el("rect", { x: 80, y: 80, width: 180, height: 100, fill: "url(#map-eixample)", "clip-path": "url(#map-eixample-clip)" }, svg);
  el("path", { d: "M112 168C122 160 152 158 176 166L170 190C150 196 126 194 112 186Z", class: "map-old" }, svg);
  el("path", { d: "M36 102L150 128L250 150L300 146", class: "map-avenue" }, svg);
  el("path", { d: "M120 172L168 118", class: "map-avenue thin" }, svg);
  // Mar.
  el("path", { d: "M0 248C40 236 64 222 96 212S150 196 186 184 260 156 320 128V260H0Z", class: "map-sea" }, svg);
  el("path", { d: "M200 214q8-4 16 0t16 0M240 196q8-4 16 0t16 0M150 236q8-4 16 0t16 0", class: "map-wave" }, svg);
  const sea = el("text", { x: 250, y: 236, class: "map-label sea" }, svg);
  sea.dataset.i18n = "map_sea";
  const hill = el("text", { x: 196, y: 22, class: "map-label hill" }, svg);
  hill.dataset.i18n = "map_mountain";
  // Rosa de los vientos.
  const rose = el("g", { class: "map-rose", transform: "translate(292 210)" }, svg);
  el("path", { d: "M0-14L3-3 14 0 3 3 0 14-3 3-14 0-3-3Z" }, rose);
  el("text", { x: 0, y: -17, class: "map-label rose-n" }, rose).textContent = "N";
}

export function buildMap(game) {
  const svg = $("map");
  svg.replaceChildren();
  svg.setAttribute("viewBox", "0 0 320 260");
  drawBase(svg);
  const inLevel = new Set(game.monuments.map((m) => m.id));
  for (const m of MONUMENTS) {
    const [x, y] = m.map;
    const g = el("g", { class: `spot${inLevel.has(m.id) ? " target" : ""}`, transform: `translate(${x} ${y})` }, svg);
    g.dataset.id = m.id;
    g.style.setProperty("--hue", m.hue);
    el("title", {}, g).textContent = m.barrio;
    el("circle", { r: 15, class: "halo" }, g);
    el("circle", { r: 9, class: "ring" }, g);
    el("circle", { r: 4.5, class: "dot" }, g);
  }
  translateMap();
  renderMap(game);
}

export function translateMap() {
  for (const node of $("map").querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
}

// Pinta los barrios encontrados. Si se pasa `fresh`, ese barrio hace una animación de aviso.
export function renderMap(game, fresh = null) {
  const found = new Set(game.cards.filter((c) => c.state === "matched").map((c) => c.pair));
  for (const g of $("map").querySelectorAll(".spot")) {
    g.classList.toggle("lit", found.has(g.dataset.id));
    if (g.dataset.id === fresh) {
      g.classList.remove("fresh");
      void g.getBBox(); // reinicia la animación
      g.classList.add("fresh");
    }
  }
  const total = game.monuments.length;
  $("map-count").textContent = t("map_count", { n: found.size, total });
  const caption = $("map-caption");
  const last = fresh ? game.monuments.find((m) => m.id === fresh) : null;
  if (last) {
    caption.textContent = last.barrio;
    caption.classList.remove("pop");
    void caption.offsetWidth;
    caption.classList.add("pop");
  } else if (!found.size) {
    caption.textContent = t("map_empty");
  }
}
