// Une todo: reloj, clics, sonidos y paso de un nivel a otro.
import { createGame, flip, clearMismatch, tickSecond, result } from "./game.js";
import { LEVELS, PEEK_SECONDS } from "./levels.js";
import { LANG_CODES, getLang, setLang, t } from "./lang.js";
import { lastLevelCompleted, saveLevelDone, username } from "./storage.js";
import { newSession, addAttempt, saveSession } from "./metrics.js";
import * as sound from "./sound.js";
import * as ui from "./ui.js";

const MISS_MS = 900;

let game = null;
let session = newSession(username());
let timer = null;
let finished = false;
let peeking = false;

function startLevel(n) {
  clearInterval(timer);
  ui.hideCard();
  finished = false;
  peeking = false;
  game = createGame(LEVELS[n - 1]);
  ui.buildBoard(game, onFlip);
  ui.renderMission(game);
  ui.renderLevelTabs(n, lastLevelCompleted(), startLevel);
  refresh();
  ui.showMessage(t("msg_start"));
  timer = setInterval(() => {
    if (peeking) return; // la lupa congela el reloj
    tickSecond(game);
    ui.renderStats(game);
    if (game.status === "timeout") endLevel();
  }, 1000);
}

function refresh() {
  ui.renderCards(game, peeking);
  ui.renderStats(game);
  ui.renderBarrios(game);
}

function onFlip(uid) {
  const ev = flip(game, uid);
  if (ev.type === "ignored") return;
  switch (ev.type) {
    case "first":
      sound.play("flip");
      break;
    case "match":
      sound.play(ev.combo >= 2 ? "combo" : "match");
      ui.showMessage(ev.combo >= 2 ? t("msg_combo", { n: Math.min(4, ev.combo), gained: ev.gained }) : t("msg_match", { gained: ev.gained }));
      break;
    case "mismatch":
      sound.play("miss");
      ui.showMessage(t("msg_miss", { n: game.level.maxErrors - game.errors }));
      setTimeout(() => {
        clearMismatch(game);
        refresh();
        if (game.status === "lost") endLevel();
      }, MISS_MS);
      break;
    case "lupa":
      sound.play("lupa");
      peeking = true;
      game.locked = true;
      ui.showMessage(t("msg_peek"));
      refresh();
      setTimeout(() => {
        peeking = false;
        game.locked = false;
        ui.showMessage(t("help_lupa"));
        refresh();
      }, PEEK_SECONDS * 1000);
      break;
    case "trampa":
      sound.play("trampa");
      ui.reorderBoard(game);
      ui.showMessage(t("help_trampa"));
      break;
  }
  refresh();
  if (game.status === "won") endLevel();
}

function endLevel() {
  if (finished) return;
  finished = true;
  clearInterval(timer);
  const res = result(game);
  addAttempt(session, res);
  saveSession(session);

  if (!res.won) {
    sound.play("lose");
    const timeout = game.status === "timeout";
    ui.showCard({
      title: t(timeout ? "timeout_title" : "lost_title"),
      text: timeout ? t("timeout_text", { n: game.level.timeLimit }) : t("lost_text", { n: game.level.maxErrors }),
      buttons: [{ label: t("again"), primary: true, onClick: () => startLevel(game.level.id) }],
    });
    return;
  }

  sound.play("win");
  saveLevelDone(res.level, res.score);
  ui.renderLevelTabs(res.level, lastLevelCompleted(), startLevel);
  const last = res.level === LEVELS.length;
  ui.showCard({
    title: last ? t("final_title") : t("win_title"),
    text: last ? t("final_text") : t("win_text", { errors: res.errors, points: res.score }),
    extra: ui.starsElement(res.stars),
    buttons: [
      last
        ? { label: t("again"), primary: true, onClick: () => startLevel(1) }
        : { label: t("next"), primary: true, onClick: () => startLevel(res.level + 1) },
      { label: t("close"), onClick: ui.hideCard },
    ],
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
  select.value = getLang();
  select.addEventListener("change", () => {
    setLang(select.value);
    document.documentElement.lang = select.value;
    startLevel(game.level.id);
    ui.translatePage();
    updateMute();
  });
  const mute = document.getElementById("mute");
  const updateMute = () => {
    mute.textContent = sound.isMuted() ? "🔇" : "🔊";
    mute.setAttribute("aria-label", t(sound.isMuted() ? "unmute" : "mute"));
  };
  mute.addEventListener("click", () => {
    sound.setMuted(!sound.isMuted());
    updateMute();
  });
  document.getElementById("restart").addEventListener("click", () => startLevel(game.level.id));
  ui.translatePage();
  updateMute();
}

setupControls();
startLevel(Math.min(lastLevelCompleted() + 1, LEVELS.length));
