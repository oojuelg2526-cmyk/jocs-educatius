// Dibuja el tablero y el panel. No decide reglas: solo enseña lo que dice game.js.
import { t } from "./lang.js";
import { MONUMENTS } from "./levels.js";

const $ = (id) => document.getElementById(id);
const byId = Object.fromEntries(MONUMENTS.map((m) => [m.id, m]));

// Ilustración del monumento: img/<id>.svg si existe; si no, un emblema con sus iniciales.
// [PENDENT] sustituir los emblemas por las ilustraciones/renders definitivos.
function imageFace(m) {
  const wrap = document.createElement("div");
  wrap.className = "pic";
  wrap.style.setProperty("--hue", m.hue);
  const img = document.createElement("img");
  img.src = `img/${m.id}.svg`;
  img.alt = t("image_alt", { name: m.name });
  img.addEventListener("error", () => {
    img.remove();
    const emblem = document.createElement("span");
    emblem.className = "emblem";
    emblem.textContent = m.name.split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join("");
    emblem.setAttribute("aria-label", t("image_alt", { name: m.name }));
    wrap.append(emblem);
  });
  wrap.append(img);
  return wrap;
}

function faceText(card) {
  const m = byId[card.pair];
  const span = document.createElement("span");
  span.className = `text ${card.kind}`;
  span.textContent = card.kind === "name" ? m.name : card.kind === "barrio" ? m.barrio : t(`fact_${m.id}`);
  return span;
}

function frontOf(card) {
  const front = document.createElement("div");
  front.className = "face front";
  if (card.special) {
    front.classList.add(card.special);
    const title = document.createElement("strong");
    title.textContent = t(`help_${card.special}_title`);
    front.append(title);
  } else if (card.kind === "image") {
    front.append(imageFace(byId[card.pair]));
  } else {
    front.append(faceText(card));
  }
  return front;
}

export function buildBoard(game, onFlip) {
  const board = $("board");
  board.replaceChildren();
  board.dataset.cards = game.cards.length;
  for (const card of game.cards) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.dataset.uid = card.uid;
    const inner = document.createElement("div");
    inner.className = "inner";
    const back = document.createElement("div");
    back.className = "face back";
    back.setAttribute("aria-hidden", "true");
    inner.append(back, frontOf(card));
    btn.append(inner);
    btn.addEventListener("click", () => onFlip(card.uid));
    board.append(btn);
  }
}

// Pone cada carta en su estado (tapada, girada, acertada, usada).
export function renderCards(game, peeking = false) {
  for (const btn of $("board").children) {
    const card = game.cards.find((c) => c.uid === Number(btn.dataset.uid));
    btn.classList.toggle("up", card.state === "up" || peeking);
    btn.classList.toggle("matched", card.state === "matched");
    btn.classList.toggle("used", card.state === "used");
    btn.disabled = card.state === "matched" || card.state === "used";
  }
}

// Tras la trampa las cartas cambian de sitio: se recolocan los botones.
export function reorderBoard(game) {
  const board = $("board");
  const buttons = new Map([...board.children].map((b) => [Number(b.dataset.uid), b]));
  for (const card of game.cards) board.append(buttons.get(card.uid));
}

export function flashCards(uids, className) {
  for (const btn of $("board").children) {
    if (uids.includes(Number(btn.dataset.uid))) {
      btn.classList.add(className);
      setTimeout(() => btn.classList.remove(className), 600);
    }
  }
}

export function renderStats(game) {
  const left = game.level.maxErrors - game.errors;
  $("errors").textContent = `${game.errors} / ${game.level.maxErrors}`;
  $("errors").classList.toggle("danger", left <= 2);
  $("combo").textContent = `×${Math.min(4, Math.max(1, game.combo))}`;
  $("points").textContent = game.score;
  const time = $("time");
  if (game.level.timeLimit) {
    const s = game.timeLeft;
    time.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    time.classList.toggle("danger", s <= 20);
  } else {
    time.textContent = t("no_clock");
    time.classList.remove("danger");
  }
}

// Panel de barrios: cada pareja acertada ilumina su barrio.
// [PENDENT] sustituir la lista por el mapa de Barcelona con los barrios (Open Data BCN).
export function renderBarrios(game) {
  const list = $("barrios");
  list.replaceChildren();
  const found = new Set(game.cards.filter((c) => c.state === "matched").map((c) => c.pair));
  for (const m of game.monuments) {
    const li = document.createElement("li");
    li.textContent = m.barrio;
    li.classList.toggle("lit", found.has(m.id));
    list.append(li);
  }
}

export function renderLevelTabs(current, lastDone, onPick) {
  const nav = $("levels");
  nav.replaceChildren();
  import("./levels.js").then(({ LEVELS }) => {
    for (const lvl of LEVELS) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tab";
      b.textContent = `${t("level")} ${lvl.id} · ${t(lvl.nameKey)}`;
      b.disabled = lvl.id > lastDone + 1;
      b.setAttribute("aria-current", lvl.id === current ? "true" : "false");
      b.addEventListener("click", () => onPick(lvl.id));
      nav.append(b);
    }
  });
}

export function renderMission(game) {
  $("level-name").textContent = `${t("level")} ${game.level.id} · ${t(game.level.nameKey)}`;
  $("mission-text").textContent = t(`mission_${game.level.mode}`);
}

export function showMessage(text) {
  $("message").textContent = text;
}

export function starsElement(n) {
  const p = document.createElement("p");
  p.className = "stars";
  p.textContent = "★".repeat(n) + "☆".repeat(3 - n);
  p.setAttribute("aria-label", t("stars", { n }));
  return p;
}

export function showCard({ title, text, extra, buttons }) {
  $("card-title").textContent = title;
  $("card-text").textContent = text;
  $("card-extra").replaceChildren(...(extra ? [extra] : []));
  const box = $("card-buttons");
  box.replaceChildren();
  for (const b of buttons) {
    const el = document.createElement("button");
    el.type = "button";
    el.textContent = b.label;
    el.className = b.primary ? "primary" : "";
    el.addEventListener("click", b.onClick);
    box.append(el);
  }
  $("card").hidden = false;
  box.querySelector("button")?.focus();
}

export const hideCard = () => ($("card").hidden = true);

// Traduce los textos fijos del HTML.
export function translatePage() {
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  document.title = t("title");
}
