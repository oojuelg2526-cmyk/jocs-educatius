// Todo lo que se dibuja en la página. No decide reglas: solo muestra el estado del juego.
import { currentCell, isPieceAt, score } from "./game.js";
import { LINE_NAMES } from "./levels.js";
import { t } from "./lang.js";

const $ = (id) => document.getElementById(id);
const key = (r, c) => `${r},${c}`;

// Crea las casillas del tablero (un div por casilla dentro de un CSS Grid).
export function buildBoard(game) {
  const board = $("board");
  board.style.setProperty("--cols", game.cols);
  board.style.setProperty("--rows", game.rows);
  board.replaceChildren();

  game.grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      const div = document.createElement("div");
      div.className = "cell " + cell.type;
      div.dataset.pos = key(r, c);
      if (cell.type === "wall") {
        board.append(div);
        return;
      }
      div.append(document.createElement("i")); // marca para trozo, obras u hora punta
      // la vía se une con las casillas vecinas que comparten línea
      [[-1, 0, "to-up"], [1, 0, "to-down"], [0, -1, "to-left"], [0, 1, "to-right"]].forEach(([dr, dc, cls]) => {
        const next = game.grid[r + dr]?.[c + dc];
        if (next && next.type !== "wall" && next.lines.some((l) => cell.lines.includes(l))) div.classList.add(cls);
      });
      if (cell.type === "track") div.classList.add("l" + cell.lines[0]);
      if (cell.type === "station") {
        div.classList.add("l" + cell.lines[0]);
        if (cell.lines.length > 1) div.classList.add("interchange");
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = t(cell.nameKey);
        div.append(name);
        const isKey = cell.id === game.level.start || cell.id === game.level.end || game.level.pieces.some(([pr, pc]) => pr === r && pc === c);
        if (!game.level.hideNames || isKey) div.classList.add("named");
      }
      board.append(div);
    })
  );

  const token = document.createElement("div");
  token.id = "token";
  token.textContent = "🎩";
  token.setAttribute("aria-hidden", "true");
  board.append(token);
}

const cellEl = (r, c) => $("board").querySelector(`[data-pos="${key(r, c)}"]`);

// Pone al día todo lo que cambia durante la partida.
export function render(game) {
  const { r, c } = game.pos;

  // ficha
  const token = $("token");
  const here = cellEl(r, c);
  token.style.left = `${here.offsetLeft}px`;
  token.style.top = `${here.offsetTop}px`;
  token.style.width = token.style.height = `${here.offsetWidth}px`;

  // trozos, estaciones cerradas y hora punta
  game.grid.forEach((row, rr) =>
    row.forEach((cell, cc) => {
      if (cell.type === "wall") return;
      const el = cellEl(rr, cc);
      el.classList.toggle("piece", isPieceAt(game, rr, cc) && !game.collected.has(key(rr, cc)));
      el.classList.toggle("closed", game.closedCells.has(key(rr, cc)));
      el.classList.toggle("rush", game.rushCells.has(key(rr, cc)));
      el.classList.toggle("rush-shut", game.rushCells.get(key(rr, cc)) === false);
    })
  );

  // panel
  $("pieces").textContent = `${game.collected.size} / ${game.level.pieces.length}`;
  $("time").textContent = game.level.timeLimit ? `${Math.max(0, game.level.timeLimit - game.seconds)} s` : clock(game.seconds);
  $("moves").textContent = game.moves;
  $("points").textContent = score(game);

  // selector de línea: solo en una correspondencia
  const lines = currentCell(game).lines;
  const selector = $("line-selector");
  selector.hidden = lines.length < 2;
  selector.querySelector("div").replaceChildren(
    ...lines.map((line) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `line-btn l${line}`;
      b.dataset.line = line;
      b.textContent = LINE_NAMES[line];
      b.setAttribute("aria-pressed", String(line === game.line));
      return b;
    })
  );
}

const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function showMessage(text, kind = "info") {
  const el = $("message");
  el.textContent = text;
  el.dataset.kind = kind;
}

// Enseña los nombres de todas las estaciones durante unos segundos.
export function flashNames(ms = 3000) {
  const board = $("board");
  board.classList.add("show-names");
  setTimeout(() => board.classList.remove("show-names"), ms);
}

export function renderLevelTabs(current, lastDone, onPick) {
  const nav = $("levels");
  nav.replaceChildren(
    ...[1, 2, 3].map((n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = `${t("level")} ${n}`;
      b.disabled = n > lastDone + 1;
      b.setAttribute("aria-current", String(n === current));
      b.addEventListener("click", () => onPick(n));
      return b;
    })
  );
}

// Texto de la misión del nivel.
export function renderMission(game) {
  $("level-name").textContent = `${t("level")} ${game.level.id} · ${t(game.level.nameKey)}`;
  $("mission-text").textContent = t("mission_text", {
    from: t(game.level.stations[game.level.start].nameKey),
    to: t(game.level.stations[game.level.end].nameKey),
  });
}

// Tarjeta central (nivel superado, tiempo agotado, juego bloqueado, final).
export function showCard({ title, text, extra, buttons }) {
  const card = $("card");
  card.replaceChildren();
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  card.append(h, p);
  if (extra) card.append(extra);
  const row = document.createElement("div");
  row.className = "card-buttons";
  (buttons ?? []).forEach(({ label, onClick, primary }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = primary ? "btn" : "btn secondary";
    b.textContent = label;
    b.addEventListener("click", onClick);
    row.append(b);
  });
  card.append(row);
  $("overlay").hidden = false;
  (row.querySelector("button") ?? card).focus?.();
}

export const hideCard = () => ($("overlay").hidden = true);

export function starsElement(n) {
  const el = document.createElement("p");
  el.className = "stars";
  el.setAttribute("aria-label", t("stars", { n }));
  el.textContent = "★".repeat(n) + "☆".repeat(3 - n);
  return el;
}

// El plano completo de Cerdà con sus cuatro piezas (escena final).
export function planElement() {
  const wrap = document.createElement("div");
  wrap.className = "final-plan";
  wrap.innerHTML = `
    <svg viewBox="0 0 400 300" role="img" aria-label="Plano de Cerdà completo">
      <g fill="#efe2bf" stroke="#2b2a28" stroke-width="2">
        <rect x="4" y="4" width="192" height="142"/><rect x="204" y="4" width="192" height="142"/>
        <rect x="4" y="154" width="192" height="142"/><rect x="204" y="154" width="192" height="142"/>
      </g>
      <g stroke="#2b2a28" stroke-width="2"><path d="M30 30h140M30 75h140M30 120h140M60 20v115M100 20v115M140 20v115"/></g>
      <g fill="#a63d2a" stroke="#2b2a28" stroke-width="2"><rect x="226" y="26" width="40" height="40"/><rect x="282" y="26" width="40" height="40"/><rect x="338" y="26" width="40" height="40"/><rect x="226" y="80" width="40" height="40"/><rect x="282" y="80" width="40" height="40"/><rect x="338" y="80" width="40" height="40"/></g>
      <g stroke="#2b2a28" stroke-width="3"><path d="M26 180h90M26 202h140M26 224h120M26 246h100"/></g>
      <text x="26" y="282" font-size="22" font-family="Georgia,serif" fill="#2b2a28">1859</text>
      <circle cx="300" cy="225" r="46" fill="none" stroke="#2b2a28" stroke-width="3"/>
      <circle cx="300" cy="225" r="10" fill="#a63d2a" stroke="#2b2a28" stroke-width="2"/>
      <path d="M300 170v110M245 225h110" stroke="#2b2a28" stroke-width="2"/>
    </svg>`;
  return wrap;
}

// Pone los textos fijos de la página en el idioma actual.
export function applyTexts() {
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.title = t("title");
}

