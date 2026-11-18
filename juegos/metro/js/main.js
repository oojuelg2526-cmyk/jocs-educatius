// Une todo: lee las teclas, lleva el reloj y decide qué se ve en cada momento.

const KEYS = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
};

let game = null;
let timer = null;
let finished = false;
let startTime = Date.now();

// Empieza (o reinicia) el nivel.
function startLevel() {
  clearInterval(timer);
  hideCard();
  finished = false;
  startTime = Date.now();
  game = createGame(LEVEL);
  buildBoard(game);
  renderMission(game);
  render(game);
  showMessage(t("msg_start", { station: t(LEVEL.stations[LEVEL.start]) }));

  // cada segundo pasa un segundo
  timer = setInterval(() => {
    tickSecond(game);
    render(game);
  }, 1000);
}

// Se ha ganado el nivel.
function endLevel() {
  if (finished) {
    return;
  }
  finished = true;
  clearInterval(timer);
  const res = result(game);
  saveSession(res, startTime);
  saveBestScore(res.score);

  showCard(t("win_title"), t("win_text", { moves: res.moves, points: res.score }), [
    { label: t("again"), primary: true, onClick: startLevel },
    { label: t("close"), onClick: hideCard },
  ]);
  showStars(res.stars);
}

// Un movimiento: se lo pasamos a las reglas y contamos al jugador lo que ha pasado.
function step(dir) {
  if (game === null || finished) {
    return;
  }
  const res = move(game, dir);
  if (res.event === "wall") {
    showMessage(t("msg_wall"), "warn");
  } else if (res.event === "piece") {
    showMessage(t("msg_piece"), "good");
  } else if (res.event === "missing-pieces") {
    showMessage(t("msg_missing", { n: res.left }), "warn");
  } else if (res.station) {
    // cada estación tiene su "¿Sabías que...?": fact_U, fact_C, fact_R
    showMessage(t("fact_" + res.station.id));
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

document.getElementById("help").addEventListener("click", () => {
  if (game === null || finished) {
    return;
  }
  useHelp(game);
  flashNames();
  render(game);
});

document.getElementById("restart").addEventListener("click", startLevel);

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
  buildBoard(game); // los nombres de las estaciones cambian de idioma
  renderMission(game);
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
startLevel();
