// Une todo: lee las teclas, lleva el reloj y decide qué se ve en cada momento.
import { createGame, move, chooseLine, useHelp, toggleRush, tickSecond, result, currentCell } from "./game.js";
import { LEVELS } from "./levels.js";
import { LANG_CODES, getLang, setLang, t } from "./lang.js";
import { isUnlocked, lastLevelCompleted, saveLevelDone, username } from "./storage.js";
import { newSession, addAttempt, saveSession } from "./metrics.js";
import * as ui from "./ui.js";

const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };

let game = null;
let session = newSession(username());
let secondTimer = null;
let rushTimer = null;
let finished = false;

function stopTimers() {
  clearInterval(secondTimer);
  clearInterval(rushTimer);
}

// Empieza (o reinicia) un nivel.
function startLevel(n) {
  stopTimers();
  ui.hideCard();
  finished = false;
  game = createGame(LEVELS[n - 1]);
  ui.buildBoard(game);
  ui.renderMission(game);
  ui.renderLevelTabs(n, lastLevelCompleted(), startLevel);
  ui.render(game);
  ui.showMessage(t("msg_start", { station: t(currentCell(game).nameKey), line: `L${game.line}` }));

  // cada segundo pasa un segundo; la hora punta abre y cierra el paso cada 3 s
  secondTimer = setInterval(() => {
    tickSecond(game);
    ui.render(game);
    if (game.status === "timeout") endLevel();
  }, 1000);
  if (game.rushCells.size) {
    rushTimer = setInterval(() => {
      toggleRush(game);
      ui.render(game);
    }, 3000);
  }
}

// Se ha ganado o se ha acabado el tiempo.
function endLevel() {
  if (finished) return;
  finished = true;
  stopTimers();
  const res = result(game);
  addAttempt(session, res);
  saveSession(session);

  if (!res.won) {
    ui.showCard({
      title: t("timeout_title"),
      text: t("timeout_text", { n: game.level.timeLimit }),
      buttons: [{ label: t("again"), primary: true, onClick: () => startLevel(game.level.id) }],
    });
    return;
  }

  saveLevelDone(res.level, res.score);
  const last = res.level === LEVELS.length;
  ui.renderLevelTabs(res.level, lastLevelCompleted(), startLevel);
  const extra = document.createElement("div");
  extra.append(ui.starsElement(res.stars));
  if (last) extra.append(ui.planElement());
  ui.showCard({
    title: last ? t("final_title") : t("win_title"),
    text: last ? t("final_text") : t("win_text", { moves: res.moves, points: res.score }),
    extra,
    buttons: [
      last
        ? { label: t("again"), primary: true, onClick: () => startLevel(1) }
        : { label: t("next"), primary: true, onClick: () => startLevel(res.level + 1) },
      { label: t("close"), onClick: ui.hideCard },
    ],
  });
}

// Un movimiento: se lo pasamos a las reglas y contamos al jugador lo que ha pasado.
function step(dir) {
  if (!game || finished || game.status !== "playing") return;
  const res = move(game, dir);
  const messages = {
    wall: ["msg_wall", "warn"],
    closed: ["msg_closed", "warn"],
    rush: ["msg_rush", "warn"],
    "change-line": ["msg_change_line", "warn"],
    piece: ["msg_piece", "good"],
  };
  if (res.event === "missing-pieces") ui.showMessage(t("msg_missing", { n: res.left }), "warn");
  else if (messages[res.event]) ui.showMessage(t(messages[res.event][0]), messages[res.event][1]);
  else if (res.station) ui.showMessage(t(res.station.nameKey.replace("st_", "fact_")));
  ui.render(game);
  if (game.status === "won") endLevel();
}

function showLocked() {
  ui.showCard({ title: t("locked_title"), text: t("locked_text"), buttons: [] });
}

// ----- eventos -----
document.addEventListener("keydown", (e) => {
  const dir = KEYS[e.key] ?? KEYS[e.key.toLowerCase?.()];
  if (!dir || e.target.matches?.("select, input")) return;
  e.preventDefault();
  step(dir);
});

document.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => step(b.dataset.dir)));

document.getElementById("line-selector").addEventListener("click", (e) => {
  const b = e.target.closest("[data-line]");
  if (!b || !game || finished) return;
  if (chooseLine(game, Number(b.dataset.line))) {
    ui.showMessage(t("msg_line", { line: `L${game.line}` }));
    ui.render(game);
  }
});

document.getElementById("help").addEventListener("click", () => {
  if (!game || finished) return;
  useHelp(game);
  ui.flashNames();
  ui.render(game);
});

document.getElementById("restart").addEventListener("click", () => game && startLevel(game.level.id));

const langSelect = document.getElementById("lang");
langSelect.innerHTML = LANG_CODES.map((c) => `<option value="${c}">${{ es: "Castellano", ca: "Català", en: "English" }[c]}</option>`).join("");
langSelect.addEventListener("change", () => {
  setLang(langSelect.value);
  localStorage.setItem("cerda_lang", getLang());
  ui.applyTexts();
  if (game) startLevelKeepingProgress();
});

// Al cambiar de idioma se vuelve a dibujar el nivel sin perder la partida.
function startLevelKeepingProgress() {
  ui.buildBoard(game);
  ui.renderMission(game);
  ui.renderLevelTabs(game.level.id, lastLevelCompleted(), startLevel);
  ui.render(game);
}

window.addEventListener("resize", () => game && ui.render(game));

// ----- arranque -----
setLang(localStorage.getItem("cerda_lang") || document.documentElement.lang || "es");
langSelect.value = getLang();
ui.applyTexts();
if (isUnlocked()) startLevel(Math.min(LEVELS.length, lastLevelCompleted() + 1));
else showLocked();
