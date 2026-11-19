// Une todo: lee las teclas, lleva el reloj y decide qué se ve en cada momento.

const KEYS = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
};

// Qué mensaje enseñar cuando un movimiento no sale bien o recoge un trozo: [clave del texto, tipo]
const MESSAGES = {
  wall: ["msg_wall", "warn"],
  line: ["msg_line", "warn"],
  closed: ["msg_closed", "warn"],
  piece: ["msg_piece", "good"],
};

let game = null;
let timer = null;
let finished = false;
const session = newSession(); // una sesión por cada vez que se abre el juego
const sessionStart = Date.now();

// Empieza (o reinicia) el nivel n.
function startLevel(n) {
  clearInterval(timer);
  hideCard();
  finished = false;
  game = createGame(LEVELS[n - 1]);
  buildBoard(game);
  renderMission(game);
  renderLevelTabs(n, lastLevelCompleted(), startLevel);
  render(game);
  const here = cellAt(game, game.row, game.col);
  showMessage(t("msg_start", { station: t(here.nameKey), line: LINE_NAMES[game.line] }));

  // cada segundo pasa un segundo; en el nivel con tiempo límite, puede acabarse
  timer = setInterval(() => {
    tickSecond(game);
    render(game);
    if (game.status === "timeout") {
      endLevel();
    }
  }, 1000);
}

// Se ha ganado el nivel o se ha acabado el tiempo.
function endLevel() {
  if (finished) {
    return;
  }
  finished = true;
  clearInterval(timer);
  const res = result(game);
  addAttempt(session, res);
  saveSession(session, sessionStart);

  if (!res.won) {
    showCard(t("timeout_title"), t("timeout_text", { n: game.level.timeLimit }), [
      { label: t("again"), primary: true, onClick: () => startLevel(game.level.id) },
    ]);
    return;
  }

  saveLevelDone(res.level, res.score);
  renderLevelTabs(res.level, lastLevelCompleted(), startLevel);
  const isLast = res.level === LEVELS.length;
  if (isLast) {
    // último nivel: escena final con el plano completo
    showCard(t("final_title"), t("final_text"), [
      { label: t("again"), primary: true, onClick: () => startLevel(1) },
      { label: t("close"), onClick: hideCard },
    ], [starsElement(res.stars), planElement()]);
  } else {
    showCard(t("win_title"), t("win_text", { moves: res.moves, points: res.score }), [
      { label: t("next"), primary: true, onClick: () => startLevel(res.level + 1) },
      { label: t("close"), onClick: hideCard },
    ], [starsElement(res.stars)]);
  }
}

// Un movimiento: se lo pasamos a las reglas y contamos al jugador lo que ha pasado.
function step(dir) {
  if (game === null || finished) {
    return;
  }
  const res = move(game, dir);
  if (res.event === "missing-pieces") {
    showMessage(t("msg_missing", { n: res.left }), "warn");
  } else if (MESSAGES[res.event]) {
    showMessage(t(MESSAGES[res.event][0]), MESSAGES[res.event][1]);
  } else if (res.station) {
    // cada estación tiene su "¿Sabías que...?": st_catalunya -> fact_catalunya
    showMessage(t(res.station.nameKey.replace("st_", "fact_")));
  }
  render(game);
  if (game.status === "won") {
    endLevel();
  }
}

// ----- eventos -----
document.addEventListener("keydown", (e) => {
  const dir = KEYS[e.key] || KEYS[e.key.toLowerCase()];
  if (!dir || e.target.tagName === "SELECT") {
    return;
  }
  e.preventDefault();
  step(dir);
});

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => step(button.dataset.dir));
});

// Botones de línea (solo aparecen en las correspondencias)
document.getElementById("line-selector").addEventListener("click", (e) => {
  const button = e.target.closest("[data-line]");
  if (button === null || game === null || finished) {
    return;
  }
  if (chooseLine(game, Number(button.dataset.line))) {
    showMessage(t("msg_line_now", { line: LINE_NAMES[game.line] }));
    render(game);
  }
});

document.getElementById("help").addEventListener("click", () => {
  if (game === null || finished) {
    return;
  }
  useHelp(game);
  flashNames();
  render(game);
});

document.getElementById("restart").addEventListener("click", () => startLevel(game.level.id));

// Selector de idioma
const langSelect = document.getElementById("lang");
const NAMES = { es: "Castellano", ca: "Català", en: "English" };
for (const code in NAMES) {
  langSelect.innerHTML += '<option value="' + code + '">' + NAMES[code] + "</option>";
}
langSelect.addEventListener("change", () => {
  setLang(langSelect.value);
  localStorage.setItem("cerda_lang", langSelect.value);
  applyTexts();
  // se vuelve a dibujar el nivel (los nombres cambian de idioma) sin perder la partida
  buildBoard(game);
  renderMission(game);
  renderLevelTabs(game.level.id, lastLevelCompleted(), startLevel);
  render(game);
});

window.addEventListener("resize", () => {
  if (game !== null) {
    render(game);
  }
});

// ----- arranque -----
const savedLang = localStorage.getItem("cerda_lang");
setLang(savedLang || "es");
langSelect.value = savedLang || "es";
applyTexts();
startLevel(Math.min(LEVELS.length, lastLevelCompleted() + 1)); // continúa por el nivel que toca
