// Las reglas del Memory. No toca la página: así se puede probar con `npm test`.
import { MONUMENTS, LEVELS } from "./levels.js";

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Dos monumentos con el mismo barrio harían una pareja ambigua, así que en el nivel
// de barrios se eligen monumentos con barrio distinto.
function pickMonuments(level, rng) {
  const all = shuffle(MONUMENTS, rng);
  if (level.mode !== "barrio") return all.slice(0, level.pairs);
  const seen = new Set();
  const out = [];
  for (const m of all) {
    if (seen.has(m.barrio)) continue;
    seen.add(m.barrio);
    out.push(m);
    if (out.length === level.pairs) break;
  }
  return out;
}

const FACES = {
  name: ["image", "name"],
  barrio: ["name", "barrio"],
  fact: ["name", "fact"],
};

export function createGame(level, rng = Math.random) {
  const [kindA, kindB] = FACES[level.mode];
  const monuments = pickMonuments(level, rng);
  const cards = [];
  for (const m of monuments) {
    cards.push({ pair: m.id, kind: kindA, state: "down" });
    cards.push({ pair: m.id, kind: kindB, state: "down" });
  }
  for (let i = 0; i < level.lupas; i++) cards.push({ special: "lupa", state: "down" });
  for (let i = 0; i < level.trampas; i++) cards.push({ special: "trampa", state: "down" });
  const deck = shuffle(cards, rng).map((c, i) => ({ ...c, uid: i }));
  return {
    level,
    rng,
    cards: deck,
    monuments,
    up: [],
    errors: 0,
    combo: 0,
    bestCombo: 0,
    matched: 0,
    score: 0,
    seconds: 0,
    timeLeft: level.timeLimit,
    helps: 0,
    moves: 0,
    locked: false, // true mientras se enseña la lupa o se espera a tapar un fallo
    status: "playing", // playing | won | lost | timeout
  };
}

export const multiplier = (combo) => Math.min(4, Math.max(1, combo));

// Gira una carta. Devuelve qué ha pasado para que la pantalla lo cuente.
export function flip(game, uid) {
  if (game.status !== "playing" || game.locked) return { type: "ignored" };
  const card = game.cards.find((c) => c.uid === uid);
  if (!card || card.state !== "down") return { type: "ignored" };

  if (card.special) {
    card.state = "used"; // no gasta intento
    game.helps += 1;
    if (card.special === "lupa") return { type: "lupa", uid };
    shuffleHidden(game);
    return { type: "trampa", uid };
  }

  card.state = "up";
  game.up.push(card);
  if (game.up.length < 2) return { type: "first", uid };

  game.moves += 1;
  const [a, b] = game.up;
  if (a.pair === b.pair) {
    a.state = b.state = "matched";
    game.up = [];
    game.matched += 1;
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    const gained = 100 * multiplier(game.combo);
    game.score += gained;
    const won = game.matched === game.level.pairs;
    if (won) {
      game.score += game.timeLeft * 2;
      game.status = "won";
    }
    return { type: "match", pair: a.pair, combo: game.combo, gained, won };
  }

  game.errors += 1;
  game.combo = 0;
  game.locked = true; // hasta que la pantalla tape las dos cartas
  return { type: "mismatch", uids: [a.uid, b.uid] };
}

// La pantalla llama a esto cuando ya ha enseñado el fallo.
export function clearMismatch(game) {
  for (const c of game.up) c.state = "down";
  game.up = [];
  game.locked = false;
  if (game.errors >= game.level.maxErrors && game.status === "playing") game.status = "lost";
}

// Trampa «Plano desordenado»: baraja de sitio las cartas que aún están tapadas.
export function shuffleHidden(game) {
  const slots = game.cards.map((c, i) => (c.state === "down" ? i : -1)).filter((i) => i >= 0);
  const moved = shuffle(slots.map((i) => game.cards[i]), game.rng);
  slots.forEach((slot, k) => (game.cards[slot] = moved[k]));
}

// Pasa un segundo. Con reloj, se acaba el tiempo al llegar a 0.
export function tickSecond(game) {
  if (game.status !== "playing") return;
  game.seconds += 1;
  if (game.level.timeLimit) {
    game.timeLeft -= 1;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.status = "timeout";
    }
  }
}

// 3 estrellas con muy pocos fallos, 1 si se ha ganado por los pelos.
export function stars(game) {
  const ratio = game.errors / game.level.maxErrors;
  if (ratio <= 0.25) return 3;
  if (ratio <= 0.6) return 2;
  return 1;
}

export function result(game) {
  return {
    level: game.level.id,
    won: game.status === "won",
    seconds: game.seconds,
    errors: game.errors,
    moves: game.moves,
    helps: game.helps,
    score: game.status === "won" ? game.score : 0,
    stars: game.status === "won" ? stars(game) : 0,
    bestCombo: game.bestCombo,
  };
}

export { LEVELS };
