// Ventanas que tapan el juego: instrucciones de cada nivel y final de nivel.
// Hay una sola ventana (#card) en el HTML; cada función cambia lo que lleva dentro.
import { t } from "./lang.js";
import { monument } from "./levels.js";
import { ICONS } from "./icons.js";
import { multiplier } from "./game.js";
import { pulse, countUp } from "./effects.js";
import { faceContent, textOf } from "./cards.js";
import { $, make, text } from "./dom.js";

let onEscape = null; // qué hace la tecla Escape con la ventana abierta
let lastFocus = null; // dónde estaba el foco antes de abrirla

// Abre la ventana. buttons: [{ label, icon, primary, onClick }].
function openDialog({ eyebrow, title, body, buttons, escape, wide = false }) {
  lastFocus = document.activeElement;
  $("card-eyebrow").textContent = eyebrow;
  $("card-title").textContent = title;
  $("card-body").replaceChildren(...body);
  $("card-buttons").replaceChildren(
    ...buttons.map((b) => {
      const btn = make("button", b.primary ? "btn primary" : "btn", `${b.icon ? ICONS[b.icon] : ""}<span>${b.label}</span>`);
      btn.type = "button";
      btn.addEventListener("click", b.onClick);
      return btn;
    }),
  );
  onEscape = escape;
  $("card").querySelector(".dialog").classList.toggle("wide", wide);
  $("card").hidden = false;
  pulse($("card"), "open");
  $("card-buttons").querySelector(".primary").focus();
}

// Cierra la ventana y devuelve el foco a donde estaba (o a la primera carta).
export function closeDialog() {
  $("card").hidden = true;
  onEscape = null;
  if (lastFocus && document.contains(lastFocus) && lastFocus !== document.body) lastFocus.focus();
  else $("board").querySelector(".card")?.focus({ preventScroll: true });
}

export const dialogOpen = () => !$("card").hidden;

// Escape cierra y Tab no deja salir el foco de la ventana.
export function setupDialogKeys() {
  $("card").addEventListener("keydown", (e) => {
    if (e.key === "Escape" && onEscape) {
      e.preventDefault();
      onEscape();
    }
    if (e.key !== "Tab") return;
    const items = [...$("card").querySelectorAll("button")];
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

// ---------- Instrucciones ----------

// Monumento del ejemplo en cada tipo de nivel.
const EXAMPLE = { name: "sagrada", barrio: "boqueria", fact: "catedral" };

// Ejemplo animado de una pareja: las dos cartas se giran y aparece un ✓ entre ellas.
function exampleElement(mode) {
  const m = monument(EXAMPLE[mode]);
  const mini = (kind) => {
    const inner = make("span", "inner");
    inner.append(make("span", "face back"), faceContent({ pair: m.id, kind }));
    const card = make("span", "ex-card");
    card.append(inner);
    return card;
  };
  const link = make("span", "ex-link", `<span class="ex-plus">+</span><span class="ex-check">${ICONS.check}</span>`);
  link.setAttribute("aria-hidden", "true");
  const wrap = make("div", "example");
  wrap.append(mini("image"), link, mini(mode));
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", `${t("image_alt", { name: m.name })} + ${t(`kind_${mode}`)}: ${textOf(mode, m)}`);
  return wrap;
}

// Lista de reglas: [icono, texto]. Solo salen las que tiene el nivel.
function rulesList(level) {
  const rules = [["check", "rule_easy"], ["restart", "rule_slow"]];
  if (level.bonusTime) rules.push(["clock", "rule_bonus"]);
  rules.push(["hint", "rule_hint"]);
  if (level.lupas) rules.push(["lupa", "rule_lupa"]);
  if (level.trampas) rules.push(["trampa", "rule_trampa"]);
  rules.push(["barrio", "rule_map"]);
  const list = make("ul", "rules");
  for (const [icon, key] of rules) {
    const li = make("li", `rule r-${icon}`, `<span class="rule-icon">${ICONS[icon]}</span>`);
    li.append(text("span", "", t(key)));
    list.append(li);
  }
  return list;
}

export function showIntro(level, onPlay) {
  openDialog({
    eyebrow: t("level_of", { n: level.id }),
    title: t(level.nameKey),
    body: [
      text("p", "intro-text", t(`intro_${level.mode}`)),
      text("p", "section-label", t("intro_example")),
      exampleElement(level.mode),
      text("p", "ex-caption", t("pair_rule", { kind: t(`kind_${level.mode}_long`) })),
      text("p", "section-label", t("intro_rules")),
      rulesList(level),
    ],
    buttons: [{ label: t("play"), primary: true, icon: "play", onClick: onPlay }],
    escape: onPlay,
    wide: true,
  });
}

// ---------- Final de nivel ----------

// Tres estrellas que entran una a una; las ganadas, doradas.
function winStars(n) {
  const row = make("div", "win-stars");
  row.setAttribute("role", "img");
  row.setAttribute("aria-label", t("stars", { n }));
  for (let i = 0; i < 3; i++) {
    const star = make("span", i < n ? "win-star on" : "win-star", ICONS.star);
    star.style.setProperty("--d", `${0.35 + i * 0.35}s`);
    row.append(star);
  }
  return row;
}

// Resumen: lista de [clave del texto, valor]. Los puntos se rellenan después con countUp.
function summary(items) {
  const dl = make("dl", "summary");
  for (const [key, value, id] of items) {
    const dd = text("dd", "", value);
    if (id) dd.id = id;
    const row = make("div");
    row.append(text("dt", "", t(key)), dd);
    dl.append(row);
  }
  return dl;
}

// Calco de la cuadrícula del Eixample (4 × 7 manzanas) que se dibuja solo: premio final.
function calcoElement() {
  let blocks = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const x = 8 + c * 30;
      const y = 8 + r * 30;
      blocks += `<path pathLength="1" style="--d:${(r * 7 + c) * 0.04}s" d="M${x + 5} ${y}h14l5 5v14l-5 5h-14l-5-5v-14z"/>`;
    }
  }
  return make("div", "calco", `<svg viewBox="0 0 224 132" aria-hidden="true">${blocks}</svg>`);
}

// last = era el último nivel: sale el calco y el mensaje final de Cerdà.
export function showWin({ res, game, last, onNext, onAgain, onFirst }) {
  const items = [
    ["sum_pairs", `${game.matched}/${game.level.pairs}`],
    ["sum_errors", res.errors],
    ["sum_combo", `×${multiplier(res.bestCombo)}`],
  ];
  if (game.level.bonusTime) items.push(["sum_bonus", `+${res.bonus}`]);
  items.push(["sum_points", 0, "win-points"]);
  const body = [winStars(res.stars), summary(items)];
  if (last) body.push(calcoElement(), text("p", "final-text", t("final_text")), text("p", "signature", `— ${t("cerda")}`));
  openDialog({
    eyebrow: `${t("level_of", { n: game.level.id })} · ${t(game.level.nameKey)}`,
    title: last ? t("final_title") : t("win_title"),
    body,
    buttons: last
      ? [{ label: t("from_start"), primary: true, icon: "restart", onClick: onFirst }, { label: t("again"), onClick: onAgain }]
      : [{ label: t("next"), primary: true, icon: "play", onClick: onNext }, { label: t("again"), icon: "restart", onClick: onAgain }],
    escape: closeDialog,
  });
  countUp($("win-points"), res.score, 1100);
}
