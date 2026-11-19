// Guarda el progreso y las partidas en el navegador (localStorage).

const PROGRESS_KEY = "cerda_progress";
const SESSIONS_KEY = "cerda_sessions";

// ----- progreso: hasta qué nivel has llegado y la mejor puntuación de cada uno -----

function loadProgress() {
  const saved = localStorage.getItem(PROGRESS_KEY);
  const progress = saved === null ? {} : JSON.parse(saved);
  if (!progress.last_level_completed) {
    progress.last_level_completed = 0;
  }
  if (!progress.scores) {
    progress.scores = {};
  }
  return progress;
}

function lastLevelCompleted() {
  return loadProgress().last_level_completed;
}

// Apunta que se ha superado un nivel con esos puntos.
function saveLevelDone(level, points) {
  const progress = loadProgress();
  if (level > progress.last_level_completed) {
    progress.last_level_completed = level;
  }
  if (!progress.scores[level] || points > progress.scores[level]) {
    progress.scores[level] = points;
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// ----- sesiones: una por cada vez que se abre el juego, con un intento por nivel jugado -----

// Datos comunes de la sesión: username, session_id y date_time.
// session_length se calcula al guardar.
function newSession() {
  return {
    username: "invitado",
    session_id: Date.now(),
    date_time: new Date().toISOString(),
    level_reached: 1,
    final_score: 0,
    attempts: [],
  };
}

// Añade el resultado de un intento de nivel (las métricas propias del juego).
function addAttempt(session, res) {
  session.attempts.push({
    level: res.level,
    level_time: res.seconds,
    moves_count: res.moves,
    help_clicks: res.helps,
    score: res.score,
    stars: res.stars,
    completed: res.won,
  });
  if (res.won) {
    session.final_score += res.score;
    if (res.level + 1 > session.level_reached) {
      session.level_reached = Math.min(3, res.level + 1);
    }
  }
}

// Guarda la sesión (si ya estaba guardada, la sustituye).
function saveSession(session, startedAt) {
  session.session_length = Math.round((Date.now() - startedAt) / 1000);
  let sessions = [];
  const saved = localStorage.getItem(SESSIONS_KEY);
  if (saved !== null) {
    sessions = JSON.parse(saved);
  }
  let found = false;
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].session_id === session.session_id) {
      sessions[i] = session;
      found = true;
    }
  }
  if (!found) {
    sessions.push(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
