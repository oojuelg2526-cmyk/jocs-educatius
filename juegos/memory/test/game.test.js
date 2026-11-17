// Pruebas de las reglas: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS, MONUMENTS } from "../js/levels.js";
import { createGame, flip, clearMismatch, shuffleHidden, tickSecond, stars, multiplier, result } from "../js/game.js";

// Generador de números repetible, para que las pruebas no cambien de un día a otro.
function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const level = (n) => LEVELS[n - 1];
const pairCards = (g, pair) => g.cards.filter((c) => c.pair === pair);
const pickFirstPair = (g) => pairCards(g, g.monuments[0].id);
const wrongPair = (g) => [pairCards(g, g.monuments[0].id)[0], pairCards(g, g.monuments[1].id)[0]];

test("cada nivel tiene el número de cartas esperado", () => {
  for (const lvl of LEVELS) {
    const g = createGame(lvl, seeded(3));
    assert.equal(g.cards.length, lvl.pairs * 2 + lvl.lupas + lvl.trampas);
    assert.equal(g.cards.filter((c) => c.special === "lupa").length, lvl.lupas);
    assert.equal(g.cards.filter((c) => c.special === "trampa").length, lvl.trampas);
  }
});

test("en el nivel de barrios no se repite barrio (parejas sin ambigüedad)", () => {
  for (let s = 1; s < 40; s++) {
    const g = createGame(level(2), seeded(s));
    assert.equal(new Set(g.monuments.map((m) => m.barrio)).size, 8);
  }
});

test("hay monumentos de sobra para el nivel más grande", () => {
  assert.ok(MONUMENTS.length >= LEVELS.at(-1).pairs);
});

test("acertar una pareja la deja acertada y suma 100 puntos", () => {
  const g = createGame(level(1), seeded());
  const [a, b] = pickFirstPair(g);
  assert.equal(flip(g, a.uid).type, "first");
  const ev = flip(g, b.uid);
  assert.equal(ev.type, "match");
  assert.equal(g.score, 100);
  assert.equal(g.matched, 1);
  assert.equal(a.state, "matched");
});

test("fallar gasta un fallo, bloquea el tablero y reinicia el combo", () => {
  const g = createGame(level(1), seeded());
  const [a, b] = wrongPair(g);
  flip(g, a.uid);
  assert.equal(flip(g, b.uid).type, "mismatch");
  assert.equal(g.errors, 1);
  assert.equal(g.locked, true);
  assert.equal(flip(g, g.cards.find((c) => c.state === "down").uid).type, "ignored");
  clearMismatch(g);
  assert.equal(g.locked, false);
  assert.equal(a.state, "down");
});

test("los aciertos seguidos suben el multiplicador hasta ×4", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 9].map(multiplier), [1, 1, 2, 3, 4, 4]);
  const g = createGame(level(1), seeded());
  const gains = g.monuments.map((m) => {
    const [a, b] = pairCards(g, m.id);
    flip(g, a.uid);
    return flip(g, b.uid).gained;
  });
  assert.deepEqual(gains, [100, 200, 300, 400, 400, 400]);
});

test("ganar el nivel cambia el estado y da puntos extra por el tiempo sobrante", () => {
  const g = createGame(level(2), seeded(5));
  for (const m of g.monuments) {
    const [a, b] = pairCards(g, m.id);
    flip(g, a.uid);
    flip(g, b.uid);
  }
  assert.equal(g.status, "won");
  assert.ok(g.score > 100 + 200 + 300 + 400 * 5); // 150 s × 2 de bonus
  assert.equal(result(g).won, true);
});

test("demasiados fallos pierden el nivel", () => {
  const g = createGame(level(1), seeded());
  const [a, b] = wrongPair(g);
  for (let i = 0; i < level(1).maxErrors; i++) {
    flip(g, a.uid);
    flip(g, b.uid);
    clearMismatch(g);
  }
  assert.equal(g.status, "lost");
  assert.equal(result(g).score, 0);
});

test("el reloj acaba el nivel con tiempo límite y no afecta al nivel 1", () => {
  const g1 = createGame(level(1), seeded());
  for (let i = 0; i < 1000; i++) tickSecond(g1);
  assert.equal(g1.status, "playing");
  const g2 = createGame(level(2), seeded());
  for (let i = 0; i < 150; i++) tickSecond(g2);
  assert.equal(g2.status, "timeout");
});

test("la lupa y la trampa no gastan fallos ni giran carta de pareja", () => {
  const g = createGame(level(2), seeded(7));
  const lupa = g.cards.find((c) => c.special === "lupa");
  const trampa = g.cards.find((c) => c.special === "trampa");
  assert.equal(flip(g, lupa.uid).type, "lupa");
  assert.equal(flip(g, trampa.uid).type, "trampa");
  assert.equal(g.errors, 0);
  assert.equal(g.up.length, 0);
});

test("la trampa solo baraja cartas tapadas y no pierde ninguna", () => {
  const g = createGame(level(3), seeded(9));
  const [a, b] = pickFirstPair(g);
  flip(g, a.uid);
  flip(g, b.uid); // acertada
  const matchedSlot = g.cards.findIndex((c) => c.uid === a.uid);
  const before = g.cards.map((c) => c.uid).sort((x, y) => x - y);
  shuffleHidden(g);
  assert.equal(g.cards[matchedSlot].uid, a.uid);
  assert.deepEqual(g.cards.map((c) => c.uid).sort((x, y) => x - y), before);
});

test("estrellas según los fallos", () => {
  const g = createGame(level(1), seeded());
  g.errors = 0; assert.equal(stars(g), 3);
  g.errors = 2; assert.equal(stars(g), 3);
  g.errors = 4; assert.equal(stars(g), 2);
  g.errors = 8; assert.equal(stars(g), 1);
});
