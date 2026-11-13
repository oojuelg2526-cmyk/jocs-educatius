// Reglas del juego. No toca la página: solo trabaja con datos, así se puede probar sin navegador.

export const DIRS = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const key = (r, c) => `${r},${c}`;

// Convierte el mapa de textos en una tabla de casillas.
function readMap(level) {
  return level.map.map((row, r) =>
    [...row].map((ch, c) => {
      if (ch === "#") return { type: "wall", lines: [] };
      if (/[0-9]/.test(ch)) return { type: "track", lines: [Number(ch)] };
      const st = level.stations[ch];
      return { type: "station", id: ch, nameKey: st.nameKey, lines: st.lines, r, c };
    })
  );
}

function findStation(grid, id) {
  for (const row of grid) {
    for (const cell of row) if (cell.id === id) return cell;
  }
  return null;
}

// Crea una partida nueva de un nivel.
export function createGame(level) {
  const grid = readMap(level);
  const start = findStation(grid, level.start);
  return {
    level,
    grid,
    rows: grid.length,
    cols: grid[0].length,
    pos: { r: start.r, c: start.c },
    line: start.lines[0], // línea en la que viaja ahora
    moves: 0,
    helps: 0,
    seconds: 0,
    collected: new Set(), // trozos ya recogidos ("fila,columna")
    closedCells: new Set(level.closed.map((id) => key(findStation(grid, id).r, findStation(grid, id).c))),
    rushCells: new Map(level.rush.map(([r, c]) => [key(r, c), false])), // false = cerrada ahora mismo
    status: "playing", // playing | won | timeout
  };
}

export const cellAt = (game, r, c) => game.grid[r]?.[c] ?? null;
export const currentCell = (game) => cellAt(game, game.pos.r, game.pos.c);
export const isPieceAt = (game, r, c) => game.level.pieces.some(([pr, pc]) => pr === r && pc === c);
export const piecesLeft = (game) => game.level.pieces.length - game.collected.size;

// ¿Se puede entrar en esa casilla viajando en la línea actual?
export function canEnter(game, r, c) {
  const cell = cellAt(game, r, c);
  if (!cell || cell.type === "wall") return { ok: false, reason: "wall" };
  if (!cell.lines.includes(game.line)) return { ok: false, reason: "wrong-line" };
  if (game.closedCells.has(key(r, c))) return { ok: false, reason: "closed" };
  if (game.rushCells.get(key(r, c)) === false) return { ok: false, reason: "rush" };
  return { ok: true };
}

// Mueve la ficha. Devuelve qué ha pasado para que la pantalla lo cuente.
export function move(game, dirName) {
  if (game.status !== "playing") return { event: "finished" };
  const [dr, dc] = DIRS[dirName];
  const r = game.pos.r + dr;
  const c = game.pos.c + dc;
  const check = canEnter(game, r, c);
  if (!check.ok) {
    // En una correspondencia, "otra línea" es un aviso útil; en cualquier otro sitio, es una pared.
    const here = currentCell(game);
    const target = cellAt(game, r, c);
    const otherLine = check.reason === "wrong-line" && here.type === "station" && here.lines.length > 1 && target.lines.some((l) => here.lines.includes(l));
    return { event: otherLine ? "change-line" : check.reason };
  }

  game.pos = { r, c };
  game.moves += 1;

  let event = "moved";
  if (isPieceAt(game, r, c) && !game.collected.has(key(r, c))) {
    game.collected.add(key(r, c));
    event = "piece";
  }
  const cell = cellAt(game, r, c);
  if (cell.type === "station" && cell.id === game.level.end) {
    if (piecesLeft(game) === 0) {
      game.status = "won";
      return { event: "won" };
    }
    return { event: "missing-pieces", left: piecesLeft(game) };
  }
  return { event, station: cell.type === "station" ? cell : null };
}

// En una correspondencia se puede elegir por qué línea seguir.
export function chooseLine(game, line) {
  const here = currentCell(game);
  if (here.type !== "station" || !here.lines.includes(line)) return false;
  game.line = line;
  return true;
}

export function useHelp(game) {
  game.helps += 1;
}

// La hora punta abre y cierra sus casillas (lo llama un temporizador de la pantalla).
export function toggleRush(game) {
  for (const [k, open] of game.rushCells) {
    const [r, c] = k.split(",").map(Number);
    // Si el jugador está encima, no se la cerramos.
    if (open && game.pos.r === r && game.pos.c === c) continue;
    game.rushCells.set(k, !open);
  }
}

// Pasa un segundo. Si hay tiempo límite y se acaba, el nivel termina.
export function tickSecond(game) {
  if (game.status !== "playing") return;
  game.seconds += 1;
  if (game.level.timeLimit && game.seconds >= game.level.timeLimit) game.status = "timeout";
}

// Puntos: 1000 al empezar, -5 por movimiento, -50 por ayuda y +100 por trozo.
export function score(game) {
  const points = 1000 - 5 * game.moves - 50 * game.helps + 100 * game.collected.size;
  return Math.max(0, points);
}

// Estrellas según los movimientos de más respecto a la mejor ruta.
export function stars(game) {
  const extra = game.moves - game.level.bestMoves;
  if (extra <= 2 && game.helps === 0) return 3;
  if (extra <= 8) return 2;
  return 1;
}

export function result(game) {
  return {
    level: game.level.id,
    won: game.status === "won",
    moves: game.moves,
    helps: game.helps,
    seconds: game.seconds,
    pieces: game.collected.size,
    score: game.status === "won" ? score(game) : 0,
    stars: game.status === "won" ? stars(game) : 0,
  };
}
