// Une todo: lee las teclas, lleva el reloj y decide qué se ve en cada momento.

// Qué dirección es cada tecla (siempre en minúsculas)
const KEYS = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
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
const sessionStart = Cerda.inicioSesion("metro"); // cuándo empezó la visita (si se recarga, no cambia)

// ----- empezar un nivel -----

// Cada segundo pasa un segundo; en el nivel con tiempo límite, puede acabarse.
function everySecond() {
  tickSecond(game);
  render(game);
  if (game.status === "timeout") {
    endLevel();
  }
}

// Empieza (o reinicia) el nivel n.
function startLevel(n) {
  clearInterval(timer);
  hideCard();
  finished = false;
  game = createGame(LEVELS[n - 1]);
  buildBoard(game);
  renderMission(game);
  renderLevelTabs(n, lastLevelCompleted());
  render(game);

  const here = cellAt(game, game.row, game.col);
  showMessage(t("msg_start", { station: t(here.nameKey), line: LINE_NAMES[game.line] }));

  timer = setInterval(everySecond, 1000);
}

// ----- botones de las tarjetas -----

function repeatLevel() {
  startLevel(game.level.id);
}

function goNextLevel() {
  startLevel(game.level.id + 1);
}

function goFirstLevel() {
  startLevel(1);
}

// Vuelve a la portada de la web
function goHome() {
  location.assign("../../");
}

// ----- terminar un nivel -----

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
  sendToServer(session, res, sessionStart); // además, a la base de datos

  if (res.won === false) {
    showCard(t("timeout_title"), t("timeout_text", { n: game.level.timeLimit }), [
      { label: t("again"), primary: true, onClick: repeatLevel },
    ]);
    return;
  }

  saveLevelDone(res.level, res.score);
  renderLevelTabs(res.level, lastLevelCompleted());

  if (res.level === LEVELS.length) {
    // último nivel: escena final con el plano completo
    showCard(t("final_title"), t("final_text"), [
      { label: t("again"), primary: true, onClick: goFirstLevel },
      { label: t("home"), onClick: goHome },
      { label: t("close"), onClick: hideCard },
    ], [starsElement(res.stars), planElement()]);
  } else {
    showCard(t("win_title"), t("win_text", { moves: res.moves, points: res.score }), [
      { label: t("next"), primary: true, onClick: goNextLevel },
      { label: t("close"), onClick: hideCard },
    ], [starsElement(res.stars)]);
  }
}

// ----- un movimiento -----

// Se lo pasamos a las reglas (game.js) y contamos al jugador lo que ha pasado.
function step(dir) {
  if (game === null || finished) {
    return;
  }
  const res = move(game, dir);

  if (res.event === "missing-pieces") {
    showMessage(t("msg_missing", { n: res.left }), "warn");
  } else if (MESSAGES[res.event] !== undefined) {
    const message = MESSAGES[res.event];
    showMessage(t(message[0]), message[1]);
  } else if (res.station) {
    // cada estación tiene su "¿Sabías que...?": st_catalunya -> fact_catalunya
    const factKey = res.station.nameKey.replace("st_", "fact_");
    showMessage(t(factKey));
  }

  render(game);
  if (game.status === "won") {
    endLevel();
  }
}

// ----- eventos (lo que hace el jugador) -----

// Teclas
function onKey(e) {
  const dir = KEYS[e.key.toLowerCase()];
  if (dir === undefined || e.target.tagName === "SELECT") {
    return;
  }
  e.preventDefault();
  step(dir);
}
document.addEventListener("keydown", onKey);

// Botones de la cruceta (para el móvil)
function onDirButton(e) {
  step(e.currentTarget.dataset.dir);
}
const dirButtons = document.querySelectorAll("[data-dir]");
for (let i = 0; i < dirButtons.length; i++) {
  dirButtons[i].addEventListener("click", onDirButton);
}

// Botones de nivel (arriba)
function onLevelButton(e) {
  const button = e.target.closest("[data-level]");
  if (button === null) {
    return;
  }
  startLevel(Number(button.dataset.level));
}
byId("levels").addEventListener("click", onLevelButton);

// Botones de línea (solo aparecen en las correspondencias)
function onLineButton(e) {
  const button = e.target.closest("[data-line]");
  if (button === null || game === null || finished) {
    return;
  }
  if (chooseLine(game, Number(button.dataset.line))) {
    showMessage(t("msg_line_now", { line: LINE_NAMES[game.line] }));
    render(game);
  }
}
byId("line-selector").addEventListener("click", onLineButton);

// Botón "Mirar el plano"
function onHelp() {
  if (game === null || finished) {
    return;
  }
  useHelp(game);
  flashNames();
  render(game);
}
byId("help").addEventListener("click", onHelp);

// Botón "Empezar de nuevo"
function onRestart() {
  if (game !== null) {
    startLevel(game.level.id);
  }
}
byId("restart").addEventListener("click", onRestart);

// Selector de idioma
const langSelect = byId("lang");
const LANGUAGE_NAMES = { es: "Castellano", ca: "Català", en: "English" };
for (const code in LANGUAGE_NAMES) {
  langSelect.innerHTML += '<option value="' + code + '">' + LANGUAGE_NAMES[code] + "</option>";
}

function onLanguage() {
  setLang(langSelect.value);
  localStorage.setItem("cerda_lang", langSelect.value);
  document.documentElement.lang = langSelect.value;
  applyTexts();
  if (game === null) {
    mostrarBloqueo();
    return; // juego bloqueado: no hay nivel que dibujar
  }
  // se vuelve a dibujar el nivel (los nombres cambian de idioma) sin perder la partida
  buildBoard(game);
  renderMission(game);
  renderLevelTabs(game.level.id, lastLevelCompleted());
  render(game);
}
langSelect.addEventListener("change", onLanguage);

// Si cambia el tamaño de la ventana, la ficha se vuelve a colocar
function onResize() {
  if (game !== null) {
    render(game);
  }
}
window.addEventListener("resize", onResize);

// ----- arranque -----
function mostrarBloqueo() {
  showCard(t("locked_title"), t("locked_text"), [
    { label: t("home"), primary: true, onClick: goHome },
  ]);
}

// Lo primero que se hace al abrir la página
function startGame() {
  // el idioma guardado (si no hay ninguno válido, catalán)
  let idioma = localStorage.getItem("cerda_lang");
  if (LANGUAGE_NAMES[idioma] === undefined) {
    idioma = "ca";
  }
  setLang(idioma);
  langSelect.value = idioma;
  document.documentElement.lang = idioma;
  applyTexts();

  // el juego 4 solo se abre si se han superado los 3 anteriores
  if (ultimoJuegoSuperado() < 3) {
    mostrarBloqueo();
    return;
  }

  // empieza por el nivel que toca (como mucho, el último)
  let level = lastLevelCompleted() + 1;
  if (level > LEVELS.length) {
    level = LEVELS.length;
  }
  startLevel(level);
}
document.addEventListener("DOMContentLoaded", startGame);
