// Une todo: clics, reloj, sonidos y paso de un nivel a otro.
// Las reglas las decide game.js; la página la pintan cards.js, panel.js, dialogs.js y map.js.
import { createGame, flip, clearMismatch, tickSecond, result, hint, stars, multiplier } from "./game.js";
import { LEVELS, PEEK_SECONDS, monument } from "./levels.js";
import { LANG_CODES, getLang, setLang, t } from "./lang.js";
import { lastLevelCompleted, saveLevelDone, username } from "./storage.js";
import { newSession, addAttempt, saveSession } from "./metrics.js";
import { confetti, reducedMotion } from "./effects.js";
import { buildMap, renderMap } from "./map.js";
import * as sound from "./sound.js";
import * as cards from "./cards.js";
import * as panel from "./panel.js";
import * as dialogs from "./dialogs.js";
import { $ } from "./dom.js";

const MISS_MS = 1500; // tiempo para ver las dos cartas de un fallo (giro incluido) antes de taparlas
const HINT_MS = 2200; // tiempo que brilla la pareja de la pista

const session = newSession(username()); // métricas de esta visita
let game = null; // partida del nivel actual (la crea game.js)
let timer = null; // reloj: suma un segundo cada segundo
let playing = false; // false mientras se leen las instrucciones y al terminar el nivel
let peeking = false; // true mientras la lupa enseña las cartas

// Empieza un nivel. Si había cartas, primero se van y luego se reparten las nuevas.
function startLevel(n) {
  clearInterval(timer);
  playing = false;
  peeking = false;
  panel.hideLearn();
  dialogs.closeDialog();
  const board = $("board");
  if (game && board.children.length && !reducedMotion()) {
    board.classList.add("leaving");
    setTimeout(() => showLevel(n), 350);
  } else {
    showLevel(n);
  }
}

// Crea la partida, pinta todo y abre las instrucciones.
function showLevel(n) {
  $("board").classList.remove("leaving");
  game = createGame(LEVELS[n - 1]);
  cards.buildBoard(game, onFlip);
  panel.renderMission(game);
  panel.renderLevelTabs(n, lastLevelCompleted(), startLevel);
  buildMap(game);
  cards.renderCards(game);
  panel.renderStats(game, { fresh: true });
  panel.say(t("msg_start"));
  dialogs.showIntro(game.level, play);
}

// Botón «Jugar» de las instrucciones: cierra la ventana y pone en marcha el reloj.
function play() {
  dialogs.closeDialog();
  if (playing || game.status === "won") return;
  playing = true;
  timer = setInterval(tick, 1000);
  $("board").querySelector(".card")?.focus({ preventScroll: true });
}

// Un segundo de partida. La lupa, las ventanas y la pestaña oculta paran el reloj.
function tick() {
  if (peeking || dialogs.dialogOpen() || document.hidden) return;
  tickSecond(game);
  panel.renderStats(game);
}

function refresh() {
  cards.renderCards(game, peeking);
  panel.renderStats(game);
}

// Clic en una carta: game.js dice qué ha pasado y aquí se cuenta con sonido y animaciones.
function onFlip(uid) {
  if (!playing) return;
  const starsBefore = stars(game);
  const ev = flip(game, uid);
  if (ev.type === "ignored") return;
  if (ev.type === "first") {
    sound.play("flip");
    panel.say(t("msg_first"));
  }
  if (ev.type === "match") onMatch(ev);
  if (ev.type === "mismatch") onMismatch(ev, starsBefore);
  if (ev.type === "lupa") onLupa();
  if (ev.type === "trampa") onTrampa();
  refresh();
  if (game.status === "won") setTimeout(endLevel, 900);
}

function onMatch(ev) {
  sound.play(ev.combo >= 2 ? "combo" : "match");
  cards.celebrateMatch(ev);
  renderMap(game, ev.pair);
  panel.showLearn(monument(ev.pair));
  let message = t("msg_match", { gained: ev.gained });
  if (ev.combo >= 2) message = t("msg_combo", { n: multiplier(ev.combo), gained: ev.gained });
  if (game.matched === game.level.pairs - 1) message = t("msg_last");
  panel.say(message, "happy");
}

function onMismatch(ev, starsBefore) {
  sound.play("miss");
  setTimeout(() => cards.markCards(ev.uids, "shake"), 380); // cuando ya se ven las dos
  panel.say(stars(game) < starsBefore ? t("msg_star_lost", { n: stars(game) }) : t("msg_miss"), "oops");
  setTimeout(() => {
    clearMismatch(game);
    refresh();
  }, MISS_MS);
}

// Lupa: todas las cartas se ven unos segundos y el tablero no deja girar ninguna.
function onLupa() {
  sound.play("lupa");
  peeking = true;
  game.locked = true;
  panel.say(t("msg_peek"), "happy");
  setTimeout(() => {
    peeking = false;
    game.locked = false;
    panel.say(t("msg_peek_end"));
    refresh();
  }, PEEK_SECONDS * 1000);
}

// Plano desordenado: game.js ya ha cambiado el orden; aquí se ven moverse las cartas.
function onTrampa() {
  sound.play("trampa");
  setTimeout(() => cards.reorderBoard(game), 450); // primero se ve la carta roja
  panel.say(t("msg_trampa"), "oops");
}

function onHint() {
  if (!playing) return;
  const ev = hint(game);
  if (ev.type === "ignored") return;
  sound.play("lupa");
  cards.markCards(ev.uids, "glow", HINT_MS);
  panel.say(t("msg_hint"), "happy");
  panel.renderStats(game);
}

// Nivel superado: guarda métricas y progreso, confeti y ventana con el resumen.
function endLevel() {
  if (!playing) return;
  playing = false;
  clearInterval(timer);
  panel.hideLearn();
  const res = result(game);
  addAttempt(session, res);
  saveSession(session);
  saveLevelDone(res.level, res.score);
  sound.play("win");
  panel.renderLevelTabs(res.level, lastLevelCompleted(), startLevel);
  const last = res.level === LEVELS.length;
  confetti(last ? 140 : 90);
  dialogs.showWin({
    res,
    game,
    last,
    onNext: () => startLevel(res.level + 1),
    onAgain: () => startLevel(res.level),
    onFirst: () => startLevel(1),
  });
}

function changeLanguage(code) {
  setLang(code);
  document.documentElement.lang = code;
  panel.translatePage();
  panel.renderMute(sound.isMuted());
  startLevel(game.level.id);
}

function setupControls() {
  const select = $("lang");
  for (const code of LANG_CODES) select.append(new Option(code.toUpperCase(), code));
  select.value = getLang();
  document.documentElement.lang = getLang();
  select.addEventListener("change", () => changeLanguage(select.value));
  $("mute").addEventListener("click", () => {
    sound.setMuted(!sound.isMuted());
    panel.renderMute(sound.isMuted());
  });
  $("restart").addEventListener("click", () => startLevel(game.level.id));
  $("hint").addEventListener("click", onHint);
  $("help").addEventListener("click", () => dialogs.showIntro(game.level, play));
  cards.setupBoardKeys();
  dialogs.setupDialogKeys();
  panel.translatePage();
  panel.renderMute(sound.isMuted());
}

setupControls();
startLevel(Math.min(lastLevelCompleted() + 1, LEVELS.length));
