// Puntos del mapa de Barcelona. El dibujo del mapa está en index.html; aquí solo se ponen
// los barrios (un punto por monumento) y se iluminan los de las parejas acertadas.
// [PENDENT] cambiar por los contornos reales de los barrios (Open Data BCN) si da tiempo.
import { t } from "./lang.js";
import { MONUMENTS } from "./levels.js";
import { replay } from "./effects.js";
import { $ } from "./dom.js";

const svg = (name, attrs) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

// Pone los 12 puntos. Los del nivel actual («target») llevan un círculo que gira.
export function buildMap(game) {
  const map = $("map");
  for (const old of map.querySelectorAll(".spot")) old.remove();
  const inLevel = game.monuments.map((m) => m.id);
  for (const m of MONUMENTS) {
    const [x, y] = m.map;
    const g = svg("g", { class: inLevel.includes(m.id) ? "spot target" : "spot", transform: `translate(${x} ${y})` });
    g.dataset.id = m.id;
    g.style.setProperty("--hue", m.hue);
    const title = svg("title", {});
    title.textContent = m.barrio;
    g.append(title, svg("circle", { r: 15, class: "halo" }), svg("circle", { r: 9, class: "ring" }), svg("circle", { r: 4.5, class: "dot" }));
    map.append(g);
  }
  renderMap(game);
}

// Ilumina los barrios encontrados. fresh = el que se acaba de acertar (hace un aviso).
export function renderMap(game, fresh = null) {
  const found = new Set(game.cards.filter((c) => c.state === "matched").map((c) => c.pair));
  for (const g of $("map").querySelectorAll(".spot")) {
    g.classList.toggle("lit", found.has(g.dataset.id));
    if (g.dataset.id === fresh) replay(g, "fresh");
  }
  $("map-count").textContent = t("map_count", { n: found.size, total: game.monuments.length });
  const caption = $("map-caption");
  if (fresh) {
    caption.textContent = game.monuments.find((m) => m.id === fresh).barrio;
    replay(caption, "pop");
  } else if (!found.size) {
    caption.textContent = t("map_empty");
  }
}
