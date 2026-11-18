// Las reglas del Memory. No toca la página: así se puede probar con `npm test`.
// Reglas fáciles: no se pierde nunca. Los fallos solo bajan las estrellas y el reloj
// de los niveles 2 y 3 es un bonus de puntos (no hay tiempo límite).
import { MONUMENTS, BONUS_PER_SECOND } from "./levels.js";

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

export function createGame(level, rng = Math.random) {
  const monuments = pickMonuments(level, rng);
  const cards = [];
  // Siempre: una carta con la ilustración y otra con el texto del nivel.
  for (const m of monuments) {
    cards.push({ pair: m.id, kind: "image", state: "down" });
    cards.push({ pair: m.id, kind: level.mode, state: "down" });
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
    bonus: 0,
    seconds: 0,
    hintsLeft: level.hints,
    helps: 0,
    moves: 0,
    locked: false, // true mientras se enseña la lupa o se espera a tapar un fallo
    status: "playing", // playing | won
  };
}

// Multiplicador del combo: ×1 sin racha y como mucho ×4.
export const multiplier = (combo) => Math.min(4, Math.max(1, combo));

// Puntos extra por terminar pronto (solo en los niveles con bonusTime).
export function timeBonus(game) {
  const { bonusTime } = game.level;
  if (!bonusTime) return 0;
  return Math.max(0, bonusTime - game.seconds) * BONUS_PER_SECOND;
}

// Gira una carta. Devuelve qué ha pasado para que la pantalla lo cuente.
export function flip(game, uid) {
  if (game.status !== "playing" || game.locked) return { type: "ignored" };
  const card = game.cards.find((c) => c.uid === uid);
  if (!card || card.state !== "down") return { type: "ignored" };

  if (card.special) {
    card.state = "used"; // no gasta intento ni rompe el combo
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
      game.bonus = timeBonus(game);
      game.score += game.bonus;
      game.status = "won";
    }
    return { type: "match", pair: a.pair, uids: [a.uid, b.uid], combo: game.combo, gained, won };
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
}

// Pista: ilumina una pareja. Si ya hay una carta girada, ilumina la que le falta.
// Gasta una pista y reinicia el combo (es una ayuda, no un acierto).
export function hint(game) {
  if (game.status !== "playing" || game.locked || game.hintsLeft <= 0) return { type: "ignored" };
  let uids;
  if (game.up.length === 1) {
    const open = game.up[0];
    uids = game.cards.filter((c) => c.pair === open.pair && c.uid !== open.uid).map((c) => c.uid);
  } else {
    const pending = game.monuments.filter((m) => game.cards.some((c) => c.pair === m.id && c.state === "down"));
    const m = pending[Math.floor(game.rng() * pending.length)];
    uids = game.cards.filter((c) => c.pair === m.id).map((c) => c.uid);
  }
  game.hintsLeft -= 1;
  game.helps += 1;
  game.combo = 0;
  return { type: "hint", uids, left: game.hintsLeft };
}

// Trampa «Plano desordenado»: baraja de sitio las cartas que aún están tapadas.
export function shuffleHidden(game) {
  const slots = game.cards.map((c, i) => (c.state === "down" ? i : -1)).filter((i) => i >= 0);
  const moved = shuffle(slots.map((i) => game.cards[i]), game.rng);
  slots.forEach((slot, k) => (game.cards[slot] = moved[k]));
}

// Pasa un segundo. Solo cuenta: no hay tiempo límite.
export function tickSecond(game) {
  if (game.status !== "playing") return;
  game.seconds += 1;
}

// Estrellas según los fallos: level.stars = [máximo para 3, máximo para 2]. Siempre al menos 1.
export function stars(game) {
  const [three, two] = game.level.stars;
  if (game.errors <= three) return 3;
  if (game.errors <= two) return 2;
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
    bonus: game.bonus,
    stars: game.status === "won" ? stars(game) : 0,
    bestCombo: game.bestCombo,
  };
}

