// Reglas del juego. No toca la página: solo trabaja con datos (objetos y arrays).

const DIRS = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

// Convierte el mapa de textos en una tabla de casillas (array de arrays).
function makeGrid(level) {
  const grid = [];
  for (let r = 0; r < level.map.length; r++) {
    const row = [];
    for (let c = 0; c < level.map[r].length; c++) {
      const letter = level.map[r][c];
      if (letter === "#") {
        row.push({ type: "wall", lines: [] });
      } else if ("124".includes(letter)) {
        row.push({ type: "track", lines: [Number(letter)] });
      } else {
        const st = level.stations[letter];
        row.push({ type: "station", id: letter, nameKey: st.nameKey, lines: st.lines, r: r, c: c });
      }
    }
    grid.push(row);
  }
  return grid;
}

function findStation(grid, id) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].id === id) {
        return grid[r][c];
      }
    }
  }
  return null;
}

// Crea una partida nueva de un nivel.
function createGame(level) {
  const grid = makeGrid(level);
  const start = findStation(grid, level.start);
  const pieces = level.pieces.map((p) => ({ r: p[0], c: p[1], taken: false }));
  return {
    level: level,
    grid: grid,
    rows: grid.length,
    cols: grid[0].length,
    row: start.r, // dónde está la ficha
    col: start.c,
    line: start.lines[0], // línea en la que viaja ahora
    moves: 0,
    helps: 0,
    seconds: 0,
    pieces: pieces,
    status: "playing", // playing | won | timeout
  };
}

// La casilla de esa posición, o null si se sale del mapa.
function cellAt(game, r, c) {
  if (r < 0 || r >= game.rows || c < 0 || c >= game.cols) {
    return null;
  }
  return game.grid[r][c];
}

// El trozo del plano que hay en esa casilla (o null).
function pieceAt(game, r, c) {
  for (let i = 0; i < game.pieces.length; i++) {
    if (game.pieces[i].r === r && game.pieces[i].c === c) {
      return game.pieces[i];
    }
  }
  return null;
}

function piecesLeft(game) {
  let left = 0;
  game.pieces.forEach((p) => {
    if (!p.taken) {
      left++;
    }
  });
  return left;
}

// ¿Se puede entrar en esa casilla? Devuelve "ok" o el motivo por el que no.
function canEnter(game, r, c) {
  const cell = cellAt(game, r, c);
  if (cell === null || cell.type === "wall") {
    return "wall";
  }
  if (!cell.lines.includes(game.line)) {
    return "line"; // esa vía es de otra línea
  }
  if (cell.type === "station" && game.level.closed.includes(cell.id)) {
    return "closed";
  }
  return "ok";
}

// Mueve la ficha. Devuelve qué ha pasado para que la pantalla lo cuente.
function move(game, dirName) {
  if (game.status !== "playing") {
    return { event: "finished" };
  }
  const dir = DIRS[dirName];
  const r = game.row + dir[0];
  const c = game.col + dir[1];
  const reason = canEnter(game, r, c);
  if (reason !== "ok") {
    return { event: reason }; // wall, line o closed
  }

  game.row = r;
  game.col = c;
  game.moves++;

  let event = "moved";
  const piece = pieceAt(game, r, c);
  if (piece !== null && !piece.taken) {
    piece.taken = true;
    event = "piece";
  }

  const cell = cellAt(game, r, c);
  if (cell.type === "station" && cell.id === game.level.end) {
    const left = piecesLeft(game);
    if (left === 0) {
      game.status = "won";
      return { event: "won" };
    }
    return { event: "missing-pieces", left: left };
  }
  if (cell.type === "station") {
    return { event: event, station: cell };
  }
  return { event: event, station: null };
}

// En una estación con varias líneas se puede elegir por cuál seguir.
function chooseLine(game, line) {
  const here = cellAt(game, game.row, game.col);
  if (here.type !== "station" || !here.lines.includes(line)) {
    return false;
  }
  game.line = line;
  return true;
}

function useHelp(game) {
  game.helps++;
}

// Pasa un segundo (lo llama un temporizador de la pantalla).
// Si el nivel tiene tiempo límite y se acaba, el nivel termina.
function tickSecond(game) {
  if (game.status !== "playing") {
    return;
  }
  game.seconds++;
  if (game.level.timeLimit !== null && game.seconds >= game.level.timeLimit) {
    game.status = "timeout";
  }
}

// Puntos: 1000 al empezar, -5 por movimiento, -50 por ayuda y +100 por trozo.
function score(game) {
  const taken = game.pieces.length - piecesLeft(game);
  const points = 1000 - 5 * game.moves - 50 * game.helps + 100 * taken;
  return Math.max(0, points);
}

// Estrellas según los movimientos de más respecto a la mejor ruta.
function stars(game) {
  const extra = game.moves - game.level.bestMoves;
  if (extra <= 2 && game.helps === 0) {
    return 3;
  }
  if (extra <= 8) {
    return 2;
  }
  return 1;
}

// Resumen del intento para guardarlo.
function result(game) {
  const won = game.status === "won";
  return {
    level: game.level.id,
    won: won,
    moves: game.moves,
    helps: game.helps,
    seconds: game.seconds,
    score: won ? score(game) : 0,
    stars: won ? stars(game) : 0,
  };
}
