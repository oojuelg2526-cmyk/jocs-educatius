// Guarda el progreso en el navegador. Más adelante este mismo formato irá a la base de datos
// (tabla user_game_progress): estado, último nivel superado y mejor puntuación.

const KEY = "cerda_progress";
const GAME_ID = 4;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { games: {} };
  } catch {
    return { games: {} };
  }
}

function save(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* sin almacenamiento: el juego funciona igual, pero no recuerda el progreso */
  }
}

// El juego 4 se abre al superar el juego 3. Con ?dev=1 se abre siempre (para probar).
export function isUnlocked() {
  if (new URLSearchParams(location.search).has("dev")) return true;
  return load().games?.[3]?.status === "completed";
}

export function lastLevelCompleted() {
  return load().games?.[GAME_ID]?.last_level_completed ?? 0;
}

export function username() {
  return globalThis.CERDA?.user?.username || localStorage.getItem("cerda_username") || "invitado";
}

const RANK = { locked: 0, unlocked: 1, completed: 2 };

// Junta el progreso del servidor con el local: en cada dato se queda con el mejor.
// games tiene el formato de GET /api/progress: { "3": { status, last_level_completed, best_score }, ... }
export function mergeProgress(games) {
  const progress = load();
  for (const [id, server] of Object.entries(games)) {
    const local = progress.games[id] ?? { status: "locked", last_level_completed: 0, level_scores: {}, best_score: 0 };
    if (RANK[server.status] > RANK[local.status]) local.status = server.status;
    local.last_level_completed = Math.max(local.last_level_completed, server.last_level_completed ?? 0);
    local.best_score = Math.max(local.best_score ?? 0, server.best_score ?? 0);
    progress.games[id] = local;
  }
  save(progress);
}

// Apunta que se ha superado un nivel con esa puntuación.
export function saveLevelDone(levelId, points) {
  const progress = load();
  const game = progress.games[GAME_ID] ?? { status: "unlocked", last_level_completed: 0, level_scores: {} };
  game.last_level_completed = Math.max(game.last_level_completed, levelId);
  game.level_scores[levelId] = Math.max(game.level_scores[levelId] ?? 0, points);
  game.best_score = Object.values(game.level_scores).reduce((a, b) => a + b, 0);
  if (game.last_level_completed >= 3) game.status = "completed";
  progress.games[GAME_ID] = game;
  save(progress);
}
