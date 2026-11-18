// Guarda el progreso y las partidas en el navegador (localStorage).

const PROGRESS_KEY = "cerda_progress";
const SESSIONS_KEY = "cerda_sessions";

// Lee una lista guardada (o una lista vacía si no hay nada).
function loadList(key) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

// Apunta el resultado de una partida: sesión con las métricas del juego.
function saveSession(res, startTime) {
  const sessions = loadList(SESSIONS_KEY);
  sessions.push({
    username: "invitado",
    session_id: Date.now(),
    date_time: new Date(startTime).toISOString(),
    session_length: Math.round((Date.now() - startTime) / 1000),
    level_reached: res.level,
    level_time: res.seconds,
    moves_count: res.moves,
    help_clicks: res.helps,
    final_score: res.score,
    stars: res.stars,
  });
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// Guarda la mejor puntuación del nivel.
function saveBestScore(points) {
  let best = 0;
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (saved !== null) {
    best = JSON.parse(saved).best_score;
  }
  if (points > best) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ last_level_completed: 1, best_score: points }));
  }
}
