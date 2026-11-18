// Todo lo que se dibuja en la página. No decide reglas: solo muestra el estado del juego.

function $(id) {
  return document.getElementById(id);
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

      div.classList.add("l1"); // todas las vías de este nivel son de la L1
      div.appendChild(document.createElement("i")); // marca para el trozo del plano

      // la vía se une con las casillas vecinas que no son pared
      if (r > 0 && game.grid[r - 1][c].type !== "wall") div.classList.add("to-up");
      if (r < game.rows - 1 && game.grid[r + 1][c].type !== "wall") div.classList.add("to-down");
      if (c > 0 && game.grid[r][c - 1].type !== "wall") div.classList.add("to-left");
      if (c < game.cols - 1 && game.grid[r][c + 1].type !== "wall") div.classList.add("to-right");

      if (cell.type === "station") {
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = t(cell.nameKey);
        div.appendChild(name);
        div.classList.add("named");
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
  const allCells = document.querySelectorAll(".cell");
  allCells.forEach((el) => el.classList.remove("piece"));
  game.pieces.forEach((p) => {
    if (!p.taken) {
      document.querySelector('[data-pos="' + p.r + "," + p.c + '"]').classList.add("piece");
    }
  });

  // panel
  $("pieces").textContent = game.pieces.length - piecesLeft(game) + " / " + game.pieces.length;
  $("time").textContent = clock(game.seconds);
  $("moves").textContent = game.moves;
  $("points").textContent = score(game);
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

// Texto de la misión del nivel.
function renderMission(game) {
  $("level-name").textContent = t("level") + " " + game.level.id + " · " + t(game.level.nameKey);
  $("mission-text").textContent = t("mission_text", {
    from: t(game.level.stations[game.level.start]),
    to: t(game.level.stations[game.level.end]),
  });
}

// Tarjeta central (nivel superado).
function showCard(title, text, buttons) {
  const card = $("card");
  card.innerHTML = "";
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  card.appendChild(h);
  card.appendChild(p);
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
  row.querySelector("button").focus();
}

function hideCard() {
  $("overlay").hidden = true;
}

// Las estrellas conseguidas, por ejemplo ★★☆
function showStars(n) {
  const el = document.createElement("p");
  el.className = "stars";
  el.setAttribute("aria-label", t("stars", { n: n }));
  el.textContent = "★".repeat(n) + "☆".repeat(3 - n);
  $("card").insertBefore(el, $("card").querySelector(".card-buttons"));
}

// Pone los textos fijos de la página en el idioma actual.
function applyTexts() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.title = t("title");
}
