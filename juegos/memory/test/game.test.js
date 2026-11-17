// Pruebas de las reglas: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS, MONUMENTS, BONUS_PER_SECOND } from "../js/levels.js";
import { createGame, flip, clearMismatch, shuffleHidden, tickSecond, stars, multiplier, result, hint, timeBonus } from "../js/game.js";

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
const solve = (g) => {
  for (const m of g.monuments) {
    const [a, b] = pairCards(g, m.id);
    flip(g, a.uid);
    flip(g, b.uid);
  }
};

test("cada nivel tiene el número de cartas esperado", () => {
  for (const lvl of LEVELS) {
    const g = createGame(lvl, seeded(3));
    assert.equal(g.cards.length, lvl.pairs * 2 + lvl.lupas + lvl.trampas);
    assert.equal(g.cards.filter((c) => c.special === "lupa").length, lvl.lupas);
    assert.equal(g.cards.filter((c) => c.special === "trampa").length, lvl.trampas);
  }
});

test("la dificultad sube: más parejas en cada nivel", () => {
  assert.deepEqual(LEVELS.map((l) => l.pairs), [4, 6, 8]);
  assert.equal(LEVELS[1].trampas, 0); // en el nivel 2 no hay trampa
});

test("todas las parejas son ilustración ↔ texto del nivel", () => {
  for (const lvl of LEVELS) {
    const g = createGame(lvl, seeded(4));
    for (const m of g.monuments) {
      const kinds = pairCards(g, m.id).map((c) => c.kind).sort();
      assert.deepEqual(kinds, ["image", lvl.mode].sort());
    }
  }
});

test("en el nivel de barrios no se repite barrio (parejas sin ambigüedad)", () => {
  for (let s = 1; s < 40; s++) {
    const g = createGame(level(2), seeded(s));
    assert.equal(new Set(g.monuments.map((m) => m.barrio)).size, level(2).pairs);
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
  assert.deepEqual(ev.uids, [a.uid, b.uid]);
  assert.equal(g.score, 100);
  assert.equal(g.matched, 1);
  assert.equal(a.state, "matched");
});

test("fallar suma un fallo, bloquea el tablero y reinicia el combo", () => {
  const g = createGame(level(1), seeded());
  const [a, b] = wrongPair(g);
  flip(g, a.uid);
  assert.equal(flip(g, b.uid).type, "mismatch");
  assert.equal(g.errors, 1);
  assert.equal(g.combo, 0);
  assert.equal(g.locked, true);
  assert.equal(flip(g, g.cards.find((c) => c.state === "down").uid).type, "ignored");
  clearMismatch(g);
  assert.equal(g.locked, false);
  assert.equal(a.state, "down");
});

test("no se pierde nunca por fallos: se sigue jugando y se puede ganar", () => {
  const g = createGame(level(1), seeded());
  const [a, b] = wrongPair(g);
  for (let i = 0; i < 50; i++) {
    flip(g, a.uid);
    flip(g, b.uid);
    clearMismatch(g);
  }
  assert.equal(g.status, "playing");
  solve(g);
  assert.equal(g.status, "won");
  assert.equal(result(g).stars, 1);
});

test("no hay tiempo límite: el reloj solo cuenta", () => {
  for (const lvl of LEVELS) {
    const g = createGame(lvl, seeded());
    for (let i = 0; i < 5000; i++) tickSecond(g);
    assert.equal(g.status, "playing");
    assert.equal(g.seconds, 5000);
  }
});

test("los aciertos seguidos suben el multiplicador hasta ×4", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 9].map(multiplier), [1, 1, 2, 3, 4, 4]);
  const g = createGame(level(3), seeded());
  const gains = g.monuments.map((m) => {
    const [a, b] = pairCards(g, m.id);
    flip(g, a.uid);
    return flip(g, b.uid).gained;
  });
  assert.deepEqual(gains, [100, 200, 300, 400, 400, 400, 400, 400]);
});

test("el bonus de tiempo se suma al ganar y baja con los segundos", () => {
  const g = createGame(level(2), seeded(5));
  for (let i = 0; i < 20; i++) tickSecond(g);
  const expected = (level(2).bonusTime - 20) * BONUS_PER_SECOND;
  assert.equal(timeBonus(g), expected);
  solve(g);
  assert.equal(g.status, "won");
  assert.equal(result(g).bonus, expected);
  assert.equal(g.score, 100 + 200 + 300 + 400 * 3 + expected);
});

test("el bonus nunca es negativo y el nivel 1 no tiene bonus de reloj", () => {
  const g2 = createGame(level(2), seeded());
  for (let i = 0; i < 1000; i++) tickSecond(g2);
  assert.equal(timeBonus(g2), 0);
  const g1 = createGame(level(1), seeded());
  assert.equal(timeBonus(g1), 0);
});

test("la pista ilumina una pareja que aún está tapada", () => {
  const g = createGame(level(2), seeded(2));
  const ev = hint(g);
  assert.equal(ev.type, "hint");
  assert.equal(ev.uids.length, 2);
  const [a, b] = ev.uids.map((uid) => g.cards.find((c) => c.uid === uid));
  assert.equal(a.pair, b.pair);
  assert.equal(a.state, "down");
  assert.equal(g.hintsLeft, level(2).hints - 1);
});

test("con una carta girada, la pista enseña la que le falta", () => {
  const g = createGame(level(1), seeded(6));
  const [a, b] = pickFirstPair(g);
  flip(g, a.uid);
  assert.deepEqual(hint(g).uids, [b.uid]);
});

test("las pistas se acaban y reinician el combo", () => {
  const g = createGame(level(1), seeded());
  const [a, b] = pickFirstPair(g);
  flip(g, a.uid);
  flip(g, b.uid);
  assert.equal(g.combo, 1);
  for (let i = 0; i < level(1).hints; i++) assert.equal(hint(g).type, "hint");
  assert.equal(g.combo, 0);
  assert.equal(hint(g).type, "ignored");
  assert.equal(g.helps, level(1).hints);
});

test("la lupa y la trampa no gastan fallos ni giran carta de pareja", () => {
  const g = createGame(level(3), seeded(7));
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

test("estrellas según los fallos de cada nivel", () => {
  const g = createGame(level(1), seeded()); // stars: [2, 5]
  g.errors = 0; assert.equal(stars(g), 3);
  g.errors = 2; assert.equal(stars(g), 3);
  g.errors = 3; assert.equal(stars(g), 2);
  g.errors = 5; assert.equal(stars(g), 2);
  g.errors = 30; assert.equal(stars(g), 1);
});
