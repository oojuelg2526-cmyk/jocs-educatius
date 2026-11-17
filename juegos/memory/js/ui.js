// Dibuja el tablero, el panel y las tarjetas. No decide reglas: solo enseña lo que dice game.js.
import { t } from "./lang.js";
import { MONUMENTS, LEVELS } from "./levels.js";
import { ICONS, silhouette } from "./icons.js";
import { stars as starsOf, timeBonus } from "./game.js";
import { burst, floatText, pulse, flipMove, countUp, reducedMotion } from "./effects.js";

const $ = (id) => document.getElementById(id);
export const byId = Object.fromEntries(MONUMENTS.map((m) => [m.id, m]));
const make = (tag, className, html) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ---------- Caras de las cartas ----------

// Renders que todavía no existen: así no se piden otra vez en cada partida.
const missing = new Set();

// Ilustración del monumento: el render img/<id>.png sobre un fondo de su color.
// Mientras no exista, se ve una silueta dibujada en SVG y el nombre.
export function picture(m) {
  const pic = make("span", "pic");
  pic.style.setProperty("--hue", m.hue);
  const fallback = make("span", "pic-fallback", silhouette(m.shape));
  fallback.append(make("span", "pic-name", m.name));
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

const tag = (kind) => make("span", "tag", `${ICONS[kind]}<span>${t(`kind_${kind}`)}</span>`);

export function textOf(kind, m) {
  if (kind === "name") return m.name;
  if (kind === "barrio") return m.barrio;
  return t(`fact_${m.id}`);
}

// Cara de una carta (también se usa en el ejemplo de las instrucciones).
export function faceContent(card) {
  const front = make("span", "face front");
  if (card.special) {
    front.classList.add(`f-${card.special}`);
    front.append(make("span", "special-icon", ICONS[card.special]), make("strong", "special-title", t(`help_${card.special}_title`)));
    return front;
  }
  const m = byId[card.pair];
  front.classList.add(`f-${card.kind}`);
  front.style.setProperty("--hue", m.hue);
  if (card.kind === "image") {
    front.append(picture(m), tag("image"));
  } else {
    const text = make("span", "text");
    text.textContent = textOf(card.kind, m);
    front.append(tag(card.kind), text);
  }
  front.append(make("span", "found-badge", ICONS.check));
  return front;
}

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

function cardLabel(card, n) {
  if (card.state === "down") return t("card_down", { n });
  if (card.special) return t(`help_${card.special}_title`);
  const m = byId[card.pair];
  const what = card.kind === "image" ? t("image_alt", { name: m.name }) : `${t(`kind_${card.kind}`)}: ${textOf(card.kind, m)}`;
  return card.state === "matched" ? `${what} (${t("card_found")})` : what;
}

// ---------- Tablero ----------

export function buildBoard(game, onFlip) {
  const board = $("board");
  board.replaceChildren();
  board.style.setProperty("--cols", game.level.cols);
  board.style.setProperty("--mcols", game.level.mobileCols);
  board.style.setProperty("--rows", Math.ceil(game.cards.length / game.level.cols));
  board.dataset.mode = game.level.mode;
  game.cards.forEach((card, i) => {
    const btn = cardElement(card, i);
    btn.addEventListener("click", () => onFlip(card.uid));
    board.append(btn);
  });
  // Reparto: las cartas entran una a una.
  board.classList.remove("dealing");
  void board.offsetWidth;
  board.classList.add("dealing");
  setTimeout(() => board.classList.remove("dealing"), 1400 + game.cards.length * 60);
}

export const cardButton = (uid) => $("board").querySelector(`[data-uid="${uid}"]`);

// Pone cada carta en su estado (tapada, girada, acertada, usada).
export function renderCards(game, peeking = false) {
  const buttons = [...$("board").children];
  buttons.forEach((btn, i) => {
    const card = game.cards.find((c) => c.uid === Number(btn.dataset.uid));
    const shown = card.state !== "down" || peeking;
    btn.classList.toggle("up", shown);
    btn.classList.toggle("matched", card.state === "matched");
    btn.classList.toggle("used", card.state === "used");
    btn.classList.toggle("peek", peeking && card.state === "down");
    const done = card.state === "matched" || card.state === "used";
    btn.setAttribute("aria-disabled", String(done));
    btn.setAttribute("aria-label", cardLabel(peeking && card.state === "down" ? { ...card, state: "up" } : card, i + 1));
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

export function markCards(uids, className, ms) {
  for (const uid of uids) {
    const btn = cardButton(uid);
    if (!btn) continue;
    pulse(btn, className);
    if (ms) setTimeout(() => btn.classList.remove(className), ms);
  }
}

export function celebrateMatch(ev, game) {
  const m = byId[ev.pair];
  const [a, b] = ev.uids.map(cardButton);
  markCards(ev.uids, "pop");
  burst(a, m.hue);
  burst(b, m.hue);
  floatText(b, `+${ev.gained}`, "points");
  if (ev.combo >= 2) setTimeout(() => floatText(a, `${t("combo")} ×${Math.min(4, ev.combo)}`, "combo"), 180);
  pulse($("points"), "bump");
  if (game.combo >= 2) pulse($("combo"), "bump");
}

// Flechas del teclado para moverse por el tablero.
export function setupBoardKeys() {
  $("board").addEventListener("keydown", (e) => {
    const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: "up", ArrowDown: "down" };
    if (!(e.key in keys)) return;
    const buttons = [...$("board").children];
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const firstTop = buttons[0].offsetTop;
    const cols = buttons.filter((b) => b.offsetTop === firstTop).length || 1;
    let j = i;
    if (keys[e.key] === "up") j = i - cols;
    else if (keys[e.key] === "down") j = i + cols;
    else j = i + keys[e.key];
    j = Math.max(0, Math.min(buttons.length - 1, j));
    buttons[j].focus();
  });
}

// ---------- Panel y cabecera ----------

export function renderLevelTabs(current, lastDone, onPick) {
  const nav = $("levels");
  nav.replaceChildren();
  nav.setAttribute("aria-label", t("levels_nav"));
  for (const lvl of LEVELS) {
    const locked = lvl.id > lastDone + 1;
    const b = make("button", "tab");
    b.type = "button";
    b.disabled = locked;
    b.innerHTML = `<span class="tab-num">${locked ? ICONS.lock : lvl.id}</span><span class="tab-name">${t(lvl.nameKey)}</span>`;
    b.setAttribute("aria-label", `${t("level")} ${lvl.id} · ${t(lvl.nameKey)}${locked ? ` (${t("locked")})` : ""}`);
    if (lvl.id <= lastDone) b.classList.add("done");
    b.setAttribute("aria-current", lvl.id === current ? "true" : "false");
    b.addEventListener("click", () => onPick(lvl.id));
    nav.append(b);
  }
}

export function renderMission(game) {
  const { level } = game;
  $("level-name").textContent = `${t("level_of", { n: level.id })} · ${t(level.nameKey)}`;
  $("mission-text").textContent = t(`mission_${level.mode}`);
  $("pair-rule").innerHTML = `<span class="chip chip-image">${ICONS.image}${t("kind_image")}</span><span class="plus" aria-hidden="true">+</span><span class="chip chip-${level.mode}">${ICONS[level.mode]}${t(`kind_${level.mode}`)}</span>`;
  $("pair-rule").setAttribute("aria-label", t("pair_rule", { kind: t(`kind_${level.mode}`) }));
}

let shownStars = 3;
export function renderStats(game, { fresh = false } = {}) {
  const pts = $("points");
  pts.textContent = game.score;
  const combo = $("combo");
  combo.textContent = `×${Math.min(4, Math.max(1, game.combo))}`;
  combo.classList.toggle("hot", game.combo >= 2);
  $("errors").textContent = game.errors;

  // Estrellas en juego: bajan con los fallos (nunca de 1).
  const n = starsOf(game);
  const box = $("live-stars");
  if (fresh || box.children.length !== 3) {
    box.innerHTML = ICONS.star.repeat(3);
    shownStars = 3;
  }
  [...box.children].forEach((s, i) => s.classList.toggle("off", i >= n));
  if (n < shownStars) pulse(box.children[n], "lose");
  shownStars = n;
  box.setAttribute("aria-label", t("stars", { n }));

  // Reloj: en el nivel 1 solo cuenta; en el 2 y el 3 enseña el bonus que queda.
  const time = $("time");
  const label = $("time-label");
  if (game.level.bonusTime) {
    label.textContent = t("bonus");
    time.textContent = `+${timeBonus(game)}`;
    $("time-bar").style.setProperty("--left", Math.max(0, 1 - game.seconds / game.level.bonusTime));
    $("time-box").classList.add("has-bonus");
  } else {
    label.textContent = t("time");
    time.textContent = clock(game.seconds);
    $("time-box").classList.remove("has-bonus");
  }

  // Barra de progreso.
  const total = game.level.pairs;
  $("progress-fill").style.setProperty("--p", game.matched / total);
  $("progress-text").textContent = t("progress", { n: game.matched, total });
  const bar = $("progress");
  bar.setAttribute("aria-valuemax", total);
  bar.setAttribute("aria-valuenow", game.matched);
  bar.setAttribute("aria-valuetext", t("progress", { n: game.matched, total }));

  // Botón de pista.
  const hintBtn = $("hint");
  hintBtn.innerHTML = `${ICONS.hint}<span>${t("hint")}</span><span class="hint-count">${game.hintsLeft}</span>`;
  hintBtn.setAttribute("aria-label", `${t("hint")} (${t("hint_left", { n: game.hintsLeft })})`);
  hintBtn.disabled = game.hintsLeft <= 0 || game.status !== "playing";
}

export const starsLost = (before, game) => starsOf(game) < before;

// Bocadillo de Cerdà.
export function say(text, mood = "") {
  const bubble = $("message");
  bubble.textContent = text;
  bubble.dataset.mood = mood;
  pulse($("cerda"), "talk");
}

// ---------- Tarjeta de aprendizaje (al acertar) ----------

let toastTimer = null;
export function showLearn(m) {
  const toast = $("toast");
  toast.replaceChildren();
  toast.style.setProperty("--hue", m.hue);
  const body = make("div", "toast-body");
  body.append(make("p", "toast-eyebrow", t("learn_title")), make("h3", "toast-title", ""));
  body.querySelector("h3").textContent = m.name;
  const row = (kind, text) => {
    const p = make("p", `toast-row r-${kind}`, ICONS[kind]);
    const span = make("span");
    span.textContent = text;
    p.append(span);
    return p;
  };
  body.append(row("barrio", m.barrio), row("fact", t(`fact_${m.id}`)));
  const close = make("button", "toast-close", ICONS.close);
  close.type = "button";
  close.setAttribute("aria-label", t("close"));
  close.addEventListener("click", hideLearn);
  toast.append(picture(m), body, close);
  toast.hidden = false;
  toast.classList.remove("out");
  pulse(toast, "in");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideLearn, 6500);
}

export function hideLearn() {
  const toast = $("toast");
  if (toast.hidden) return;
  clearTimeout(toastTimer);
  if (reducedMotion()) {
    toast.hidden = true;
    return;
  }
  toast.classList.add("out");
  setTimeout(() => {
    if (toast.classList.contains("out")) toast.hidden = true;
  }, 300);
}

// ---------- Ventanas (instrucciones y final de nivel) ----------

let onEscape = null;
let lastFocus = null;

function openDialog({ eyebrow = "", title, body, buttons, escape, wide = false }) {
  lastFocus = document.activeElement;
  $("card-eyebrow").textContent = eyebrow;
  $("card-title").textContent = title;
  $("card-body").replaceChildren(...body);
  const box = $("card-buttons");
  box.replaceChildren();
  for (const b of buttons) {
    const el = make("button", b.primary ? "btn primary" : "btn", `${b.icon ? ICONS[b.icon] : ""}<span>${b.label}</span>`);
    el.type = "button";
    el.addEventListener("click", b.onClick);
    box.append(el);
  }
  onEscape = escape;
  const overlay = $("card");
  overlay.querySelector(".dialog").classList.toggle("wide", wide);
  overlay.hidden = false;
  pulse(overlay, "open");
  (box.querySelector(".primary") ?? box.querySelector("button"))?.focus();
}

export function hideCard() {
  $("card").hidden = true;
  onEscape = null;
  if (lastFocus && document.contains(lastFocus) && lastFocus !== document.body) lastFocus.focus();
  else $("board").querySelector(".card")?.focus({ preventScroll: true });
}

export const dialogOpen = () => !$("card").hidden;

// Escape cierra y el foco no se escapa de la ventana.
export function setupDialogKeys() {
  $("card").addEventListener("keydown", (e) => {
    if (e.key === "Escape" && onEscape) {
      e.preventDefault();
      onEscape();
    }
    if (e.key !== "Tab") return;
    const items = [...$("card").querySelectorAll("button, [href], select, [tabindex]:not([tabindex='-1'])")];
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

const EXAMPLE = { name: "sagrada", barrio: "boqueria", fact: "catedral" };

// Ejemplo animado de una pareja: las dos cartas se giran y se unen.
function exampleElement(mode) {
  const m = byId[EXAMPLE[mode]];
  const wrap = make("div", "example");
  const mini = (kind) => {
    const c = make("span", `ex-card ex-${kind}`);
    const inner = make("span", "inner");
    const back = make("span", "face back");
    inner.append(back, faceContent({ pair: m.id, kind }));
    c.append(inner);
    return c;
  };
  const link = make("span", "ex-link", `<span class="ex-plus">+</span><span class="ex-check">${ICONS.check}</span>`);
  link.setAttribute("aria-hidden", "true");
  wrap.append(mini("image"), link, mini(mode));
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", `${t("image_alt", { name: m.name })} + ${t(`kind_${mode}`)}: ${textOf(mode, m)}`);
  return wrap;
}

export function showIntro(level, onPlay) {
  const intro = make("p", "intro-text");
  intro.textContent = t(`intro_${level.mode}`);
  const exTitle = make("p", "section-label");
  exTitle.textContent = t("intro_example");
  const caption = make("p", "ex-caption");
  caption.textContent = t("pair_rule", { kind: t(`kind_${level.mode}_long`) });

  const rules = [["check", "rule_easy"], ["restart", "rule_slow"]];
  if (level.bonusTime) rules.push(["clock", "rule_bonus"]);
  rules.push(["hint", "rule_hint"]);
  if (level.lupas) rules.push(["lupa", "rule_lupa"]);
  if (level.trampas) rules.push(["trampa", "rule_trampa"]);
  rules.push(["barrio", "rule_map"]);
  const rulesTitle = make("p", "section-label");
  rulesTitle.textContent = t("intro_rules");
  const list = make("ul", "rules");
  for (const [icon, key] of rules) {
    const li = make("li", `rule r-${icon}`, `<span class="rule-icon">${ICONS[icon]}</span>`);
    const span = make("span");
    span.textContent = t(key);
    li.append(span);
    list.append(li);
  }
  openDialog({
    eyebrow: t("level_of", { n: level.id }),
    title: t(level.nameKey),
    body: [intro, exTitle, exampleElement(level.mode), caption, rulesTitle, list],
    buttons: [{ label: t("play"), primary: true, icon: "play", onClick: onPlay }],
    escape: onPlay,
    wide: true,
  });
}

// Calco de la cuadrícula del Eixample que se dibuja solo (premio final).
function calcoElement() {
  const box = make("div", "calco");
  let blocks = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const x = 8 + c * 30;
      const y = 8 + r * 30;
      blocks += `<path pathLength="1" style="--d:${(r * 7 + c) * 0.04}s" d="M${x + 5} ${y}h14l5 5v14l-5 5h-14l-5-5v-14z"/>`;
    }
  }
  box.innerHTML = `<svg viewBox="0 0 224 132" aria-hidden="true">${blocks}</svg>`;
  return box;
}

export function showWin({ res, game, last, onNext, onAgain, onFirst }) {
  const starsRow = make("div", "win-stars");
  starsRow.setAttribute("role", "img");
  starsRow.setAttribute("aria-label", t("stars", { n: res.stars }));
  for (let i = 0; i < 3; i++) {
    const s = make("span", `win-star${i < res.stars ? " on" : ""}`, ICONS.star);
    s.style.setProperty("--d", `${0.35 + i * 0.35}s`);
    starsRow.append(s);
  }
  const dl = make("dl", "summary");
  const item = (key, value, id) => {
    const div = make("div");
    const dt = make("dt");
    dt.textContent = t(key);
    const dd = make("dd");
    dd.textContent = value;
    if (id) dd.id = id;
    div.append(dt, dd);
    dl.append(div);
  };
  item("sum_pairs", `${game.matched}/${game.level.pairs}`);
  item("sum_errors", res.errors);
  item("sum_combo", `×${Math.min(4, Math.max(1, res.bestCombo))}`);
  if (game.level.bonusTime) item("sum_bonus", `+${res.bonus}`);
  item("sum_points", 0, "win-points");
  const body = [starsRow, dl];
  if (last) {
    const p = make("p", "final-text");
    p.textContent = t("final_text");
    const sign = make("p", "signature");
    sign.textContent = `— ${t("cerda")}`;
    body.push(calcoElement(), p, sign);
  }
  openDialog({
    eyebrow: `${t("level_of", { n: game.level.id })} · ${t(game.level.nameKey)}`,
    title: last ? t("final_title") : t("win_title"),
    body,
    buttons: last
      ? [{ label: t("from_start"), primary: true, icon: "restart", onClick: onFirst }, { label: t("again"), onClick: onAgain }]
      : [{ label: t("next"), primary: true, icon: "play", onClick: onNext }, { label: t("again"), icon: "restart", onClick: onAgain }],
    escape: hideCard,
  });
  countUp($("win-points"), res.score, 1100);
}

// ---------- Textos fijos ----------

export function translatePage() {
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", t(el.dataset.i18nAria));
  document.title = t("title");
  $("help").innerHTML = ICONS.help;
  $("help").setAttribute("aria-label", t("help"));
  $("help").title = t("help");
  $("restart").innerHTML = `${ICONS.restart}<span>${t("restart")}</span>`;
}

export function renderMute(muted) {
  const b = $("mute");
  b.innerHTML = muted ? ICONS.soundOff : ICONS.soundOn;
  b.setAttribute("aria-label", t(muted ? "unmute" : "mute"));
  b.title = t(muted ? "unmute" : "mute");
}
