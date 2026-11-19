// Todo lo que se dibuja en la página. No decide reglas: solo muestra el estado del juego.

function $(id) {
  return document.getElementById(id);
}

// ¿Las dos casillas comparten alguna línea? (así se sabe si la vía se une con la vecina)
function shareLine(a, b) {
  for (let i = 0; i < a.lines.length; i++) {
    if (b.lines.includes(a.lines[i])) {
      return true;
    }
  }
  return false;
}

// Las estaciones importantes siempre enseñan su nombre: salida, destino y las que tienen un trozo.
function isImportant(game, cell) {
  return cell.id === game.level.start || cell.id === game.level.end || pieceAt(game, cell.r, cell.c) !== null;
}

// Crea las casillas del tablero (un div por casilla dentro de un CSS Grid).
function buildBoard(game) {
  const board = $("board");
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
      around.forEach((a) => {
        const next = cellAt(game, a[0], a[1]);
        if (next !== null && next.type !== "wall" && shareLine(cell, next)) {
          div.classList.add(a[2]);
        }
      });

      if (cell.type === "station") {
        if (cell.lines.length > 1) {
          div.classList.add("interchange");
        }
        if (game.level.closed.includes(cell.id)) {
          div.classList.add("closed");
        }
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = t(cell.nameKey);
        div.appendChild(name);
        if (!game.level.hideNames || isImportant(game, cell)) {
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
  const token = $("token");
  const here = document.querySelector('[data-pos="' + game.row + "," + game.col + '"]');
  token.style.left = here.offsetLeft + "px";
  token.style.top = here.offsetTop + "px";
  token.style.width = here.offsetWidth + "px";
  token.style.height = here.offsetWidth + "px";

  // trozos del plano que quedan por recoger
  document.querySelectorAll(".cell").forEach((el) => el.classList.remove("piece"));
  game.pieces.forEach((p) => {
    if (!p.taken) {
      document.querySelector('[data-pos="' + p.r + "," + p.c + '"]').classList.add("piece");
    }
  });

  // panel
  $("pieces").textContent = game.pieces.length - piecesLeft(game) + " / " + game.pieces.length;
  if (game.level.timeLimit !== null) {
    $("time").textContent = Math.max(0, game.level.timeLimit - game.seconds) + " s"; // cuenta atrás
  } else {
    $("time").textContent = clock(game.seconds);
  }
  $("moves").textContent = game.moves;
  $("points").textContent = score(game);

  renderLineSelector(game);
}

// El selector de línea solo aparece en una estación con varias líneas.
function renderLineSelector(game) {
  const lines = cellAt(game, game.row, game.col).lines;
  $("line-selector").hidden = lines.length < 2;
  const box = $("line-selector").querySelector("div");
  box.innerHTML = "";
  if (lines.length < 2) {
    return;
  }
  lines.forEach((line) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "line-btn l" + line;
    b.dataset.line = line;
    b.textContent = LINE_NAMES[line];
    b.setAttribute("aria-pressed", String(line === game.line));
    box.appendChild(b);
  });
}

// Segundos -> "mm:ss"
function clock(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function showMessage(text, kind) {
  const el = $("message");
  el.textContent = text;
  el.dataset.kind = kind || "info";
}

// Enseña los nombres de todas las estaciones durante unos segundos.
function flashNames() {
  const board = $("board");
  board.classList.add("show-names");
  setTimeout(() => board.classList.remove("show-names"), 3000);
}

// Los botones "Nivel 1, 2, 3". Un nivel está bloqueado hasta superar el anterior.
function renderLevelTabs(current, lastDone, onPick) {
  const nav = $("levels");
  nav.innerHTML = "";
  [1, 2, 3].forEach((n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t("level") + " " + n;
    b.disabled = n > lastDone + 1;
    b.setAttribute("aria-current", String(n === current));
    b.addEventListener("click", () => onPick(n));
    nav.appendChild(b);
  });
}

// Texto de la misión del nivel.
function renderMission(game) {
  const level = game.level;
  $("level-name").textContent = t("level") + " " + level.id + " · " + t(level.nameKey);
  $("mission-text").textContent = t("mission_text", {
    from: t(level.stations[level.start].nameKey),
    to: t(level.stations[level.end].nameKey),
  });
}

// Tarjeta central (nivel superado, tiempo agotado, final). `extras` son elementos opcionales (estrellas, plano).
function showCard(title, text, buttons, extras) {
  const card = $("card");
  card.innerHTML = "";
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  card.appendChild(h);
  card.appendChild(p);
  if (extras) {
    extras.forEach((el) => card.appendChild(el));
  }
  const row = document.createElement("div");
  row.className = "card-buttons";
  buttons.forEach((info) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = info.primary ? "btn" : "btn secondary";
    b.textContent = info.label;
    b.addEventListener("click", info.onClick);
    row.appendChild(b);
  });
  card.appendChild(row);
  $("overlay").hidden = false;
  const first = row.querySelector("button");
  if (first !== null) {
    first.focus();
  }
}

function hideCard() {
  $("overlay").hidden = true;
}

// Las estrellas conseguidas, por ejemplo ★★☆
function starsElement(n) {
  const el = document.createElement("p");
  el.className = "stars";
  el.setAttribute("aria-label", t("stars", { n: n }));
  el.textContent = "★".repeat(n) + "☆".repeat(3 - n);
  return el;
}

// El plano completo de Cerdà con sus cuatro piezas (escena final).
function planElement() {
  const wrap = document.createElement("div");
  wrap.className = "final-plan";
  wrap.innerHTML =
    '<svg viewBox="0 0 400 300" role="img" aria-label="Plano de Cerdà completo">' +
    '<g fill="#efe2bf" stroke="#2b2a28" stroke-width="2">' +
    '<rect x="4" y="4" width="192" height="142"/><rect x="204" y="4" width="192" height="142"/>' +
    '<rect x="4" y="154" width="192" height="142"/><rect x="204" y="154" width="192" height="142"/></g>' +
    '<g stroke="#2b2a28" stroke-width="2"><path d="M30 30h140M30 75h140M30 120h140M60 20v115M100 20v115M140 20v115"/></g>' +
    '<g fill="#a63d2a" stroke="#2b2a28" stroke-width="2"><rect x="226" y="26" width="40" height="40"/><rect x="282" y="26" width="40" height="40"/><rect x="338" y="26" width="40" height="40"/><rect x="226" y="80" width="40" height="40"/><rect x="282" y="80" width="40" height="40"/><rect x="338" y="80" width="40" height="40"/></g>' +
    '<g stroke="#2b2a28" stroke-width="3"><path d="M26 180h90M26 202h140M26 224h120M26 246h100"/></g>' +
    '<text x="26" y="282" font-size="22" font-family="Georgia,serif" fill="#2b2a28">1859</text>' +
    '<circle cx="300" cy="225" r="46" fill="none" stroke="#2b2a28" stroke-width="3"/>' +
    '<circle cx="300" cy="225" r="10" fill="#a63d2a" stroke="#2b2a28" stroke-width="2"/>' +
    '<path d="M300 170v110M245 225h110" stroke="#2b2a28" stroke-width="2"/></svg>';
  return wrap;
}

// Pone los textos fijos de la página en el idioma actual.
function applyTexts() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.title = t("title");
}
