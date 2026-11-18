// Todo lo que rodea al tablero: pestañas de nivel, misión, marcadores, bocadillo de Cerdà
// y tarjeta de aprendizaje.
import { t } from "./lang.js";
import { LEVELS } from "./levels.js";
import { ICONS } from "./icons.js";
import { stars, multiplier, timeBonus } from "./game.js";
import { pulse, reducedMotion } from "./effects.js";
import { picture } from "./cards.js";
import { $, make, text } from "./dom.js";

const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Pestañas de nivel de la cabecera (los niveles sin desbloquear llevan candado).
export function renderLevelTabs(current, lastDone, onPick) {
  const nav = $("levels");
  nav.replaceChildren();
  nav.setAttribute("aria-label", t("levels_nav"));
  for (const lvl of LEVELS) {
    const locked = lvl.id > lastDone + 1;
    const b = make("button", "tab", `<span class="tab-num">${locked ? ICONS.lock : lvl.id}</span><span class="tab-name">${t(lvl.nameKey)}</span>`);
    b.type = "button";
    b.disabled = locked;
    b.setAttribute("aria-label", `${t("level")} ${lvl.id} · ${t(lvl.nameKey)}${locked ? ` (${t("locked")})` : ""}`);
    if (lvl.id <= lastDone) b.classList.add("done");
    b.setAttribute("aria-current", lvl.id === current ? "true" : "false");
    b.addEventListener("click", () => onPick(lvl.id));
    nav.append(b);
  }
}

// Frase fija encima del tablero: «Une cada monumento con...» y la regla de la pareja.
export function renderMission(game) {
  const { level } = game;
  $("level-name").textContent = `${t("level_of", { n: level.id })} · ${t(level.nameKey)}`;
  $("mission-text").textContent = t(`mission_${level.mode}`);
  $("pair-rule").innerHTML = `<span class="chip chip-image">${ICONS.image}${t("kind_image")}</span><span class="plus" aria-hidden="true">+</span><span class="chip chip-${level.mode}">${ICONS[level.mode]}${t(`kind_${level.mode}`)}</span>`;
  $("pair-rule").setAttribute("aria-label", t("pair_rule", { kind: t(`kind_${level.mode}`) }));
}

// Marcadores del panel. fresh = nivel nuevo (las estrellas vuelven a 3 sin animación).
export function renderStats(game, { fresh = false } = {}) {
  $("points").textContent = game.score;
  $("combo").textContent = `×${multiplier(game.combo)}`;
  $("combo").classList.toggle("hot", game.combo >= 2);
  $("errors").textContent = game.errors;
  renderStars(game, fresh);
  renderClock(game);
  renderProgress(game);
  renderHint(game);
}

// Estrellas en juego: bajan con los fallos (nunca de 1) y la que se pierde da una vuelta.
let shownStars = 3;
function renderStars(game, fresh) {
  const box = $("live-stars");
  if (fresh) {
    box.innerHTML = ICONS.star.repeat(3);
    shownStars = 3;
  }
  const n = stars(game);
  [...box.children].forEach((s, i) => s.classList.toggle("off", i >= n));
  if (n < shownStars) pulse(box.children[n], "lose");
  shownStars = n;
  box.setAttribute("aria-label", t("stars", { n }));
}

// Reloj: en el nivel 1 solo cuenta; en el 2 y el 3 enseña el bonus que queda.
function renderClock(game) {
  const { bonusTime } = game.level;
  $("time-box").classList.toggle("has-bonus", bonusTime > 0);
  $("time-label").textContent = t(bonusTime ? "bonus" : "time");
  $("time").textContent = bonusTime ? `+${timeBonus(game)}` : clock(game.seconds);
  if (bonusTime) $("time-bar").style.setProperty("--left", Math.max(0, 1 - game.seconds / bonusTime));
}

// Barra de progreso: parejas encontradas de las del nivel.
function renderProgress(game) {
  const total = game.level.pairs;
  const label = t("progress", { n: game.matched, total });
  $("progress-fill").style.setProperty("--p", game.matched / total);
  $("progress-text").textContent = label;
  $("progress").setAttribute("aria-valuemax", total);
  $("progress").setAttribute("aria-valuenow", game.matched);
  $("progress").setAttribute("aria-valuetext", label);
}

// Botón de pista con las que quedan.
function renderHint(game) {
  const btn = $("hint");
  btn.innerHTML = `${ICONS.hint}<span>${t("hint")}</span><span class="hint-count">${game.hintsLeft}</span>`;
  btn.setAttribute("aria-label", `${t("hint")} (${t("hint_left", { n: game.hintsLeft })})`);
  btn.disabled = game.hintsLeft <= 0 || game.status !== "playing";
}

// Bocadillo de Cerdà. mood: "" (normal), "happy" (verde) u "oops" (rojo).
export function say(message, mood = "") {
  const bubble = $("message");
  bubble.textContent = message;
  bubble.dataset.mood = mood;
  pulse($("cerda"), "talk");
}

// Tarjeta de aprendizaje al acertar: monumento, barrio y dato. Se va sola a los 6,5 s.
let learnTimer = null;
export function showLearn(m) {
  const toast = $("toast");
  toast.style.setProperty("--hue", m.hue);
  const body = make("div", "toast-body");
  body.append(text("p", "toast-eyebrow", t("learn_title")), text("h3", "toast-title", m.name), learnRow("barrio", m.barrio), learnRow("fact", t(`fact_${m.id}`)));
  const close = make("button", "toast-close", ICONS.close);
  close.type = "button";
  close.setAttribute("aria-label", t("close"));
  close.addEventListener("click", hideLearn);
  toast.replaceChildren(picture(m), body, close);
  toast.hidden = false;
  toast.classList.remove("out");
  pulse(toast, "in");
  clearTimeout(learnTimer);
  learnTimer = setTimeout(hideLearn, 6500);
}

function learnRow(kind, content) {
  const row = make("p", `toast-row r-${kind}`, ICONS[kind]);
  row.append(text("span", "", content));
  return row;
}

export function hideLearn() {
  const toast = $("toast");
  if (toast.hidden) return;
  clearTimeout(learnTimer);
  if (reducedMotion()) {
    toast.hidden = true;
    return;
  }
  toast.classList.add("out");
  setTimeout(() => {
    if (toast.classList.contains("out")) toast.hidden = true;
  }, 300);
}

// Textos fijos de la página (los que llevan data-i18n) y botones con icono.
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
  const label = t(muted ? "unmute" : "mute");
  $("mute").innerHTML = muted ? ICONS.soundOff : ICONS.soundOn;
  $("mute").setAttribute("aria-label", label);
  $("mute").title = label;
}
