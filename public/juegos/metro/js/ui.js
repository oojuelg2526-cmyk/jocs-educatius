// Todo lo que se dibuja en la página. No decide reglas: solo muestra el estado del juego.

function byId(id) {
  return document.getElementById(id);
}

// ¿Las dos casillas comparten alguna línea? (así se sabe si la vía se une con la vecina)
function shareLine(a, b) {
  for (let i = 0; i < a.lines.length; i++) {
    if (contains(b.lines, a.lines[i])) {
      return true;
    }
  }
  return false;
}

// Las estaciones importantes siempre enseñan su nombre: salida, destino y las que tienen un trozo.
function isImportant(game, cell) {
  if (cell.id === game.level.start || cell.id === game.level.end) {
    return true;
  }
  if (pieceAt(game, cell.r, cell.c) !== null) {
    return true;
  }
  return false;
}

// Crea las casillas del tablero (un div por casilla dentro de un CSS Grid).
function buildBoard(game) {
  const board = byId("board");
  board.style.setProperty("--cols", game.cols);
  board.style.setProperty("--rows", game.rows);
  board.innerHTML = "";

  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      const cell = game.grid[r][c];
      const div = document.createElement("div");
      div.className = "cell " + cell.type;
      div.dataset.pos = r + "," + c;
      board.appendChild(div);
      if (cell.type === "wall") {
        continue;
      }

      div.classList.add("l" + cell.lines[0]); // el color de la vía
      div.appendChild(document.createElement("i")); // marca para el trozo o las obras

      // la vía se une con las casillas vecinas que comparten línea
      const around = [
        [r - 1, c, "to-up"],
        [r + 1, c, "to-down"],
        [r, c - 1, "to-left"],
        [r, c + 1, "to-right"],
      ];
      for (let i = 0; i < around.length; i++) {
        const next = cellAt(game, around[i][0], around[i][1]);
        if (next !== null && next.type !== "wall" && shareLine(cell, next)) {
          div.classList.add(around[i][2]);
        }
      }

      if (cell.type === "station") {
        if (cell.lines.length > 1) {
          div.classList.add("interchange");
        }
        if (contains(game.level.closed, cell.id)) {
          div.classList.add("closed");
        }
        if (contains(game.level.rush, cell.id)) {
          div.classList.add("rush"); // borde de rayas: se cierra y se abre con el reloj
        }
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = t(cell.nameKey);
        div.appendChild(name);
        if (game.level.hideNames === false || isImportant(game, cell)) {
          div.classList.add("named");
        }
      }
    }
  }

  const token = document.createElement("div");
  token.id = "token";
  token.textContent = "🎩";
  board.appendChild(token);
}

// Pone al día todo lo que cambia durante la partida.
function render(game) {
  // ficha: se coloca encima de su casilla
  const token = byId("token");
  const here = document.querySelector('[data-pos="' + game.row + "," + game.col + '"]');
  token.style.left = here.offsetLeft + "px";
  token.style.top = here.offsetTop + "px";
  token.style.width = here.offsetWidth + "px";
  token.style.height = here.offsetWidth + "px";

  // primero se quita la marca de trozo a todas las casillas...
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.remove("piece");
  }
  // ...y se pone solo en las que todavía tienen un trozo
  for (let i = 0; i < game.pieces.length; i++) {
    const piece = game.pieces[i];
    if (piece.taken === false) {
      const pieceCell = document.querySelector('[data-pos="' + piece.r + "," + piece.c + '"]');
      pieceCell.classList.add("piece");
    }
  }

  // las estaciones de hora punta se cierran y se abren con el reloj
  for (let i = 0; i < game.level.rush.length; i++) {
    const station = findStation(game.grid, game.level.rush[i]);
    const stationCell = document.querySelector('[data-pos="' + station.r + "," + station.c + '"]');
    if (isRushClosed(game, station.id)) {
      stationCell.classList.add("closed");
    } else {
      stationCell.classList.remove("closed");
    }
  }

  // panel de la derecha
  const taken = game.pieces.length - piecesLeft(game);
  byId("pieces").textContent = taken + " / " + game.pieces.length;
  if (game.level.timeLimit !== null) {
    let secondsLeft = game.level.timeLimit - game.seconds; // cuenta atrás
    if (secondsLeft < 0) {
      secondsLeft = 0;
    }
    byId("time").textContent = secondsLeft + " s";
  } else {
    byId("time").textContent = clock(game.seconds);
  }
  byId("moves").textContent = game.moves;
  byId("points").textContent = score(game);

  renderLineSelector(game);
}

// El selector de línea solo aparece en una estación con varias líneas.
function renderLineSelector(game) {
  const lines = cellAt(game, game.row, game.col).lines;
  const box = byId("line-selector").querySelector("div");
  box.innerHTML = "";

  if (lines.length < 2) {
    byId("line-selector").hidden = true;
    return;
  }
  byId("line-selector").hidden = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "line-btn l" + line;
    button.dataset.line = line;
    button.textContent = LINE_NAMES[line];
    button.setAttribute("aria-pressed", String(line === game.line));
    box.appendChild(button);
  }
}

// Un número siempre con dos cifras: 5 -> "05"
function twoDigits(n) {
  if (n < 10) {
    return "0" + n;
  }
  return String(n);
}

// Segundos -> "mm:ss"
function clock(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return twoDigits(min) + ":" + twoDigits(sec);
}

function showMessage(text, kind) {
  if (kind === undefined) {
    kind = "info";
  }
  const el = byId("message");
  el.textContent = text;
  el.dataset.kind = kind;
}

// Quita los nombres de las estaciones (se llama a los 3 segundos).
function hideNames() {
  byId("board").classList.remove("show-names");
}

// Enseña los nombres de todas las estaciones durante 3 segundos.
function flashNames() {
  byId("board").classList.add("show-names");
  setTimeout(hideNames, 3000);
}

// Los botones "Nivel 1, 2, 3". Un nivel está bloqueado hasta superar el anterior.
// Al pulsar uno se encarga main.js (con data-level).
function renderLevelTabs(current, lastDone) {
  const nav = byId("levels");
  nav.innerHTML = "";
  for (let n = 1; n <= LEVELS.length; n++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t("level") + " " + n;
    button.dataset.level = n;
    button.disabled = n > lastDone + 1;
    button.setAttribute("aria-current", String(n === current));
    nav.appendChild(button);
  }
}

// Texto de la misión del nivel.
function renderMission(game) {
  const level = game.level;
  const from = t(level.stations[level.start].nameKey);
  const to = t(level.stations[level.end].nameKey);
  byId("level-name").textContent = t("level") + " " + level.id + " · " + t(level.nameKey);
  byId("mission-text").textContent = t("mission_text", { from: from, to: to });
  byId("tip").textContent = t(level.tipKey);
}

// Tarjeta central (nivel superado, tiempo agotado, final).
// `extras` es una lista opcional de elementos (estrellas, plano).
function showCard(title, text, buttons, extras) {
  const card = byId("card");
  card.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = title;
  card.appendChild(heading);

  if (text !== "") {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    card.appendChild(paragraph);
  }

  if (extras !== undefined) {
    for (let i = 0; i < extras.length; i++) {
      card.appendChild(extras[i]);
    }
  }

  const row = document.createElement("div");
  row.className = "card-buttons";
  for (let i = 0; i < buttons.length; i++) {
    const info = buttons[i];
    const button = document.createElement("button");
    button.type = "button";
    if (info.primary) {
      button.className = "btn";
    } else {
      button.className = "btn secondary";
    }
    button.textContent = info.label;
    button.addEventListener("click", info.onClick);
    row.appendChild(button);
  }
  card.appendChild(row);

  byId("overlay").hidden = false;
  const first = row.querySelector("button");
  if (first !== null) {
    first.focus();
  }
}

function hideCard() {
  byId("overlay").hidden = true;
}

// Las estrellas conseguidas, por ejemplo ★★☆
function starsElement(n) {
  let text = "";
  for (let i = 1; i <= 3; i++) {
    if (i <= n) {
      text += "★";
    } else {
      text += "☆";
    }
  }
  const el = document.createElement("p");
  el.className = "stars";
  el.setAttribute("aria-label", t("stars", { n: n }));
  el.textContent = text;
  return el;
}

// El plano completo de Cerdà con sus cuatro piezas (escena final). El dibujo está en img/plano.svg.
function planElement() {
  const image = document.createElement("img");
  image.src = "img/plano.svg";
  image.alt = "Plano de Cerdà completo";

  const wrap = document.createElement("div");
  wrap.className = "final-plan";
  wrap.appendChild(image);
  return wrap;
}

// La lista de instrucciones de "Cómo se juega"
function howToElement() {
  const keys = ["how_who", "how_goal", "how_move", "how_lines", "how_obstacles", "how_score", "how_time"];
  const list = document.createElement("ul");
  list.className = "how-list";
  for (let i = 0; i < keys.length; i++) {
    const item = document.createElement("li");
    item.textContent = t(keys[i]);
    list.appendChild(item);
  }
  return list;
}

// Pone los textos fijos de la página en el idioma actual.
function applyTexts() {
  const elements = document.querySelectorAll("[data-i18n]");
  for (let i = 0; i < elements.length; i++) {
    elements[i].textContent = t(elements[i].dataset.i18n);
  }
  document.title = t("title");
}
