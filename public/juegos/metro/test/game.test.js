// Pruebas de las reglas: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS } from "../js/levels.js";
import { createGame, move, chooseLine, toggleRush, tickSecond, useHelp, score, stars, currentCell } from "../js/game.js";

const level = (n) => LEVELS[n - 1];
const play = (game, dirs) => dirs.map((d) => move(game, d));
const repeat = (dir, n) => Array(n).fill(dir);

// Busca la mejor ruta (BFS) para comprobar que cada nivel tiene solución y cuántos movimientos pide.
function bestRoute(lvl) {
  const first = createGame(lvl);
  for (const k of first.rushCells.keys()) first.rushCells.set(k, true); // para esto, la hora punta está abierta
  const id = (g) => `${g.pos.r},${g.pos.c},${g.line},${[...g.collected].sort()}`;
  const seen = new Set([id(first)]);
  let frontier = [first];
  for (let steps = 0; frontier.length && steps < 200; steps++) {
    const next = [];
    for (const g of frontier) {
      const lines = currentCell(g).lines;
      for (const line of lines) {
        for (const dir of ["up", "down", "left", "right"]) {
          const copy = structuredClone(g);
          copy.line = line;
          if (move(copy, dir).event === "won") return steps + 1;
          if (copy.moves === g.moves) continue; // no se movió
          const key = id(copy);
          if (!seen.has(key)) { seen.add(key); next.push(copy); }
        }
      }
    }
    frontier = next;
  }
  return null;
}

test("cada nivel tiene solución y bestMoves es el mínimo", () => {
  for (const lvl of LEVELS) assert.equal(bestRoute(lvl), lvl.bestMoves, `nivel ${lvl.id}`);
});

test("nivel 1: recorrer la L1 recoge el trozo y gana", () => {
  const g = createGame(level(1));
  const events = play(g, repeat("right", 14));
  assert.equal(events.at(-1).event, "won");
  assert.equal(g.status, "won");
  assert.equal(g.moves, 14);
  assert.equal(stars(g), 3);
});

test("llegar al destino sin los trozos no gana y avisa", () => {
  const g = createGame(level(1));
  g.pos = { r: 2, c: 14 }; // justo antes de Urquinaona, sin haber pasado por Catalunya
  const r = move(g, "right");
  assert.equal(r.event, "missing-pieces");
  assert.equal(r.left, 1);
  assert.equal(g.status, "playing");
});

test("las paredes y las vías de otra línea no dejan pasar", () => {
  const g = createGame(level(1));
  assert.equal(move(g, "up").event, "wall"); // encima de Universitat no hay nada
  assert.equal(g.moves, 0);
});

test("nivel 2: Catalunya está cerrada", () => {
  const g = createGame(level(2));
  assert.equal(chooseLine(g, 1), true);
  play(g, repeat("right", 5));
  const r = move(g, "right"); // la estación de Catalunya
  assert.equal(r.event, "closed");
});

test("nivel 2: para cambiar de línea hay que usar el selector", () => {
  const g = createGame(level(2));
  g.line = 1; // empezamos en la L1
  assert.equal(move(g, "down").event, "change-line"); // hacia la L2 sin cambiar de línea
  chooseLine(g, 2);
  assert.equal(move(g, "down").event, "moved");
});

test("nivel 2: la hora punta bloquea y desbloquea", () => {
  const g = createGame(level(2));
  g.pos = { r: 5, c: 7 };
  g.line = 4;
  assert.equal(move(g, "right").event, "rush"); // empieza cerrada
  toggleRush(g);
  assert.equal(move(g, "right").event, "moved");
});

test("nivel 3: se acaba el tiempo", () => {
  const g = createGame(level(3));
  for (let i = 0; i < 89; i++) tickSecond(g);
  assert.equal(g.status, "playing");
  tickSecond(g);
  assert.equal(g.status, "timeout");
});

test("puntos y estrellas", () => {
  const g = createGame(level(1));
  play(g, repeat("right", 14));
  assert.equal(score(g), 1000 - 5 * 14 + 100);
  const h = createGame(level(1));
  useHelp(h);
  play(h, repeat("right", 14));
  assert.equal(stars(h), 2); // con ayuda ya no hay 3 estrellas
  assert.equal(score(h), 1000 - 5 * 14 - 50 + 100);
});
