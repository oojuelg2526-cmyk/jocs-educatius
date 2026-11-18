// Las cartas y el tablero: cómo se dibuja cada carta y cómo se enseña su estado.
// No decide reglas: solo enseña lo que dice game.js.
import { t } from "./lang.js";
import { monument } from "./levels.js";
import { ICONS, silhouette } from "./icons.js";
import { burst, floatText, pulse, replay, flipMove } from "./effects.js";
import { multiplier } from "./game.js";
import { $, make, text } from "./dom.js";

// Renders que no existen: así no se vuelven a pedir en cada partida.
const missing = new Set();

// Ilustración del monumento: el render img/<id>.png sobre un fondo de su color.
// Mientras no carga (o si no existe) se ve una silueta en SVG con el nombre.
export function picture(m) {
  const pic = make("span", "pic");
  pic.style.setProperty("--hue", m.hue);
  const fallback = make("span", "pic-fallback", silhouette(m.shape));
  fallback.append(text("span", "pic-name", m.name));
  pic.append(fallback);
  if (!missing.has(m.id)) {
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.addEventListener("load", () => pic.classList.add("has-img"));
    img.addEventListener("error", () => {
      missing.add(m.id);
      img.remove();
    });
    img.src = `img/${m.id}.png`;
    pic.append(img);
  }
  return pic;
}

// Texto de la carta según el nivel: nombre, barrio o dato histórico.
export function textOf(kind, m) {
  if (kind === "name") return m.name;
  if (kind === "barrio") return m.barrio;
  return t(`fact_${m.id}`);
}

// Etiqueta de arriba a la izquierda («Monumento», «Barrio»...).
const tag = (kind) => make("span", "tag", `${ICONS[kind]}<span>${t(`kind_${kind}`)}</span>`);

// Cara visible de una carta (también se usa en el ejemplo de las instrucciones).
export function faceContent(card) {
  const front = make("span", "face front");
  if (card.special) {
    front.classList.add(`f-${card.special}`);
    front.append(make("span", "special-icon", ICONS[card.special]), text("strong", "special-title", t(`help_${card.special}_title`)));
    return front;
  }
  const m = monument(card.pair);
  front.classList.add(`f-${card.kind}`);
  front.style.setProperty("--hue", m.hue);
  if (card.kind === "image") front.append(picture(m), tag("image"));
  else front.append(tag(card.kind), text("span", "text", textOf(card.kind, m)));
  front.append(make("span", "found-badge", ICONS.check));
  return front;
}

// Carta completa: un botón con el reverso y la cara (el giro lo hace el CSS).
function cardElement(card, index) {
  const btn = make("button", "card");
  btn.type = "button";
  btn.dataset.uid = card.uid;
  btn.style.setProperty("--i", index);
  const inner = make("span", "inner");
  const back = make("span", "face back");
  back.setAttribute("aria-hidden", "true");
  inner.append(back, faceContent(card));
  btn.append(inner);
  return btn;
}

// Lo que lee el lector de pantalla para cada carta.
function cardLabel(card, n, shown) {
  if (!shown) return t("card_down", { n });
  if (card.special) return t(`help_${card.special}_title`);
  const m = monument(card.pair);
  const what = card.kind === "image" ? t("image_alt", { name: m.name }) : `${t(`kind_${card.kind}`)}: ${textOf(card.kind, m)}`;
  return card.state === "matched" ? `${what} (${t("card_found")})` : what;
}

// Crea las cartas del nivel y las reparte una a una.
export function buildBoard(game, onFlip) {
  const board = $("board");
  board.replaceChildren();
  board.style.setProperty("--cols", game.level.cols);
  board.style.setProperty("--mcols", game.level.mobileCols);
  board.style.setProperty("--rows", Math.ceil(game.cards.length / game.level.cols));
  game.cards.forEach((card, i) => {
    const btn = cardElement(card, i);
    btn.addEventListener("click", () => onFlip(card.uid));
    board.append(btn);
  });
  replay(board, "dealing");
  setTimeout(() => board.classList.remove("dealing"), 1400 + game.cards.length * 60);
}

const cardButton = (uid) => $("board").querySelector(`[data-uid="${uid}"]`);

// Pone cada carta en su estado: tapada, girada, acertada o usada. Con la lupa se ven todas.
export function renderCards(game, peeking = false) {
  [...$("board").children].forEach((btn, i) => {
    const card = game.cards.find((c) => c.uid === Number(btn.dataset.uid));
    const shown = card.state !== "down" || peeking;
    btn.classList.toggle("up", shown);
    btn.classList.toggle("matched", card.state === "matched");
    btn.classList.toggle("used", card.state === "used");
    btn.classList.toggle("peek", peeking && card.state === "down");
    btn.setAttribute("aria-disabled", String(card.state === "matched" || card.state === "used"));
    btn.setAttribute("aria-label", cardLabel(card, i + 1, shown));
  });
}

// Tras la trampa las cartas cambian de sitio: se deslizan hasta su nuevo hueco.
export function reorderBoard(game) {
  const board = $("board");
  const buttons = new Map([...board.children].map((b) => [Number(b.dataset.uid), b]));
  flipMove(board, () => {
    for (const card of game.cards) board.append(buttons.get(card.uid));
  });
}

// Pone una animación (pop, shake, glow) a varias cartas. Con ms, la quita pasado ese tiempo.
export function markCards(uids, className, ms) {
  for (const uid of uids) {
    const btn = cardButton(uid);
    if (!btn) continue;
    pulse(btn, className);
    if (ms) setTimeout(() => btn.classList.remove(className), ms);
  }
}

// Fiesta al acertar: las cartas saltan, salen chispas y suben los puntos.
export function celebrateMatch(ev) {
  const hue = monument(ev.pair).hue;
  const [a, b] = ev.uids.map(cardButton);
  markCards(ev.uids, "pop");
  burst(a, hue);
  burst(b, hue);
  floatText(b, `+${ev.gained}`, "points");
  if (ev.combo >= 2) setTimeout(() => floatText(a, `${t("combo")} ×${multiplier(ev.combo)}`, "combo"), 180);
  pulse($("points"), "bump");
  if (ev.combo >= 2) pulse($("combo"), "bump");
}

// Flechas del teclado para moverse por el tablero.
export function setupBoardKeys() {
  $("board").addEventListener("keydown", (e) => {
    const buttons = [...$("board").children];
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    const cols = buttons.filter((b) => b.offsetTop === buttons[0].offsetTop).length;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
    if (!step) return;
    e.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, i + step))].focus();
  });
}
