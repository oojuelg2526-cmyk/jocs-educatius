// Une todo: reloj, clics, sonidos, efectos y paso de un nivel a otro.
import { createGame, flip, clearMismatch, tickSecond, result, hint, stars } from "./game.js";
import { LEVELS, PEEK_SECONDS } from "./levels.js";
import { LANG_CODES, getLang, setLang, t } from "./lang.js";
import { lastLevelCompleted, saveLevelDone, username } from "./storage.js";
import { newSession, addAttempt, saveSession } from "./metrics.js";
import { confetti, reducedMotion } from "./effects.js";
import { buildMap, renderMap, translateMap } from "./map.js";
import * as sound from "./sound.js";
import * as ui from "./ui.js";

const MISS_MS = 1500; // tiempo para ver las dos cartas (el giro incluido) antes de taparlas
const HINT_MS = 2200;

let game = null;
let session = newSession(username());
let timer = null;
let finished = false;
let peeking = false;
let playing = false; // false mientras se leen las instrucciones

function startLevel(n) {
  clearInterval(timer);
  ui.hideLearn();
  finished = false;
  peeking = false;
  playing = false;
  const board = document.getElementById("board");
  const build = () => {
    board.classList.remove("leaving");
    game = createGame(LEVELS[n - 1]);
    ui.buildBoard(game, onFlip);
    ui.renderMission(game);
    ui.renderLevelTabs(n, lastLevelCompleted(), startLevel);
    buildMap(game);
    ui.renderCards(game);
    ui.renderStats(game, { fresh: true });
    ui.say(t("msg_start"));
    ui.showIntro(game.level, play);
  };
  // Transición: las cartas del nivel anterior se van antes de repartir las nuevas.
  if (game && board.children.length && !reducedMotion()) {
    ui.hideCard();
    board.classList.add("leaving");
    setTimeout(build, 350);
  } else {
    ui.hideCard();
    build();
  }
}

// El reloj empieza cuando se cierran las instrucciones.
function play() {
  ui.hideCard();
  if (playing || finished) return;
  playing = true;
  clearInterval(timer);
  timer = setInterval(() => {
    if (peeking || ui.dialogOpen() || document.hidden) return; // la lupa y las ventanas paran el reloj
    tickSecond(game);
    ui.renderStats(game);
  }, 1000);
  document.getElementById("board").querySelector(".card")?.focus({ preventScroll: true });
}

function refresh() {
  ui.renderCards(game, peeking);
  ui.renderStats(game);
}

function onFlip(uid) {
  if (!playing) return;
  const starsBefore = stars(game);
  const ev = flip(game, uid);
  if (ev.type === "ignored") return;
  switch (ev.type) {
    case "first":
      sound.play("flip");
      ui.say(t("msg_first"));
      break;
    case "match": {
      sound.play(ev.combo >= 2 ? "combo" : "match");
      refresh();
      ui.celebrateMatch(ev, game);
      renderMap(game, ev.pair);
      ui.showLearn(ui.byId[ev.pair]);
      const left = game.level.pairs - game.matched;
      ui.say(
        left === 1 ? t("msg_last") : ev.combo >= 2 ? t("msg_combo", { n: Math.min(4, ev.combo), gained: ev.gained }) : t("msg_match", { gained: ev.gained }),
        "happy",
      );
      break;
    }
    case "mismatch":
      sound.play("miss");
      refresh();
      setTimeout(() => ui.markCards(ev.uids, "shake"), 380); // cuando ya se ven las dos
      ui.say(stars(game) < starsBefore ? t("msg_star_lost", { n: stars(game) }) : t("msg_miss"), "oops");
      setTimeout(() => {
        clearMismatch(game);
        refresh();
      }, MISS_MS);
      break;
    case "lupa":
      sound.play("lupa");
      peeking = true;
      game.locked = true;
      ui.say(t("msg_peek"), "happy");
      document.getElementById("board").classList.add("peeking");
      refresh();
      setTimeout(() => {
        peeking = false;
        game.locked = false;
        document.getElementById("board").classList.remove("peeking");
        ui.say(t("msg_peek_end"));
        refresh();
      }, PEEK_SECONDS * 1000);
      break;
    case "trampa":
      sound.play("trampa");
      refresh();
      setTimeout(() => ui.reorderBoard(game), 450); // primero se ve la carta roja
      ui.say(t("msg_trampa"), "oops");
      break;
  }
  refresh();
  if (game.status === "won") setTimeout(endLevel, 900);
}

function onHint() {
  if (!playing) return;
  const ev = hint(game);
  if (ev.type === "ignored") return;
  sound.play("lupa");
  ui.markCards(ev.uids, "glow", HINT_MS);
  ui.say(t("msg_hint"), "happy");
  ui.renderStats(game);
}

function endLevel() {
  if (finished) return;
  finished = true;
  clearInterval(timer);
  ui.hideLearn();
  const res = result(game);
  addAttempt(session, res);
  saveSession(session);
  sound.play("win");
  saveLevelDone(res.level, res.score);
  ui.renderLevelTabs(res.level, lastLevelCompleted(), startLevel);
  const last = res.level === LEVELS.length;
  confetti(last ? 140 : 90);
  ui.showWin({
    res,
    game,
    last,
    onNext: () => startLevel(res.level + 1),
    onAgain: () => startLevel(res.level),
    onFirst: () => startLevel(1),
  });
}

function setupControls() {
  const select = document.getElementById("lang");
  for (const code of LANG_CODES) {
    const o = document.createElement("option");
    o.value = code;
    o.textContent = code.toUpperCase();
    select.append(o);
  }
  try {
    const saved = localStorage.getItem("cerda_lang");
    if (saved) setLang(saved);
  } catch { /* nada */ }
  select.value = getLang();
  document.documentElement.lang = getLang();
  select.addEventListener("change", () => {
    setLang(select.value);
    try { localStorage.setItem("cerda_lang", select.value); } catch { /* nada */ }
    document.documentElement.lang = select.value;
    ui.translatePage();
    translateMap();
    ui.renderMute(sound.isMuted());
    startLevel(game.level.id);
  });
  document.getElementById("mute").addEventListener("click", () => {
    sound.setMuted(!sound.isMuted());
    ui.renderMute(sound.isMuted());
  });
  document.getElementById("restart").addEventListener("click", () => startLevel(game.level.id));
  document.getElementById("hint").addEventListener("click", onHint);
  document.getElementById("help").addEventListener("click", () => ui.showIntro(game.level, play));
  ui.setupBoardKeys();
  ui.setupDialogKeys();
  ui.translatePage();
  ui.renderMute(sound.isMuted());
}

setupControls();
startLevel(Math.min(lastLevelCompleted() + 1, LEVELS.length));
