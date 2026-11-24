// Guarda el progreso y las partidas en el navegador (localStorage).
//
// El progreso usa el mismo formato que los otros juegos y la tabla user_game_progress:
//   cerda_progress = { games: { 4: { status, last_level_completed, level_scores, best_score } } }
// Además, al superar el nivel 3 se guarda "juego4Superado" = "true", el aviso que acordó el equipo.

const PROGRESS_KEY = "cerda_progress";
const SESSIONS_KEY = "cerda_sessions";
const GAME_ID = 4;

// Si es true, el juego está siempre abierto (juego independiente).
// Cuando la landing una los 4 juegos hay que poner false: entonces el juego 4 solo se abre
// al superar el juego 3 (juego3Superado). Con ?dev=1 en la dirección se abre siempre, para probar.
const JUEGO_INDEPENDIENTE = true;

// ----- ¿está abierto el juego? -----

function isUnlocked() {
  if (JUEGO_INDEPENDIENTE) {
    return true;
  }
  if (location.search.indexOf("dev=1") !== -1) {
    return true; // para probar: abre el juego siempre
  }
  if (localStorage.getItem("juego3Superado") === "true") {
    return true;
  }
  return false;
}

// ----- progreso: hasta qué nivel has llegado y la mejor puntuación de cada uno -----

function loadProgress() {
  const saved = localStorage.getItem(PROGRESS_KEY);
  let progress = {};
  if (saved !== null) {
    progress = JSON.parse(saved);
  }
  if (!progress.games) {
    progress.games = {};
  }
  if (!progress.games[GAME_ID]) {
    progress.games[GAME_ID] = { status: "unlocked", last_level_completed: 0, level_scores: {}, best_score: 0 };
  }
  return progress;
}

function lastLevelCompleted() {
  return loadProgress().games[GAME_ID].last_level_completed;
}

// Apunta que se ha superado un nivel con esos puntos.
function saveLevelDone(level, points) {
  const progress = loadProgress();
  const game = progress.games[GAME_ID];
  if (level > game.last_level_completed) {
    game.last_level_completed = level;
  }
  if (game.level_scores[level] === undefined || points > game.level_scores[level]) {
    game.level_scores[level] = points;
  }
  // mejor puntuación = suma de la mejor de cada nivel
  game.best_score = 0;
  for (const n in game.level_scores) {
    game.best_score += game.level_scores[n];
  }
  if (game.last_level_completed >= 3) {
    game.status = "completed";
    localStorage.setItem("juego4Superado", "true"); // aviso simple para la landing
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// ----- sesiones: una por cada vez que se abre el juego, con un intento por nivel jugado -----

// Un identificador con forma de UUID (la base de datos guarda session_id como UUID).
function newId() {
  const hex = "0123456789abcdef";
  let id = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      id += "-";
    } else if (i === 14) {
      id += "4"; // versión 4
    } else if (i === 19) {
      const variant = "89ab";
      id += variant[Math.floor(Math.random() * 4)];
    } else {
      id += hex[Math.floor(Math.random() * 16)];
    }
  }
  return id;
}

// Datos comunes de la sesión: username, session_id y date_time.
// session_length se calcula al guardar.
function newSession() {
  // el mismo nombre que usan los otros juegos
  let username = localStorage.getItem("username");
  if (username === null) {
    username = "invitado";
  }
  return {
    username: username,
    session_id: newId(),
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
    // el nivel al que ha llegado (como mucho el 3)
    let next = res.level + 1;
    if (next > 3) {
      next = 3;
    }
    if (next > session.level_reached) {
      session.level_reached = next;
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

// ----- servidor: se envía el resultado de cada nivel a la base de datos -----

// Los datos de un nivel, con los nombres que espera /api/guardar-metricas.
function buildPayload(session, res, startedAt) {
  return {
    username: session.username,
    session_id: session.session_id,
    game: "metro",
    level: res.level,
    date_time: session.date_time,
    session_length: Math.round((Date.now() - startedAt) / 1000),
    level_time: res.seconds,
    moves_count: res.moves,
    help_clicks: res.helps,
    final_score: res.score,
    stars: res.stars,
    completed: res.won,
  };
}

function ignoreError() {
  // no hace nada a propósito
}

// Lo envía. Si falla (sin conexión, por ejemplo), no pasa nada: ya está guardado en el navegador.
function sendToServer(session, res, startedAt) {
  const request = fetch("/api/guardar-metricas", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(buildPayload(session, res, startedAt)),
  });
  request.catch(ignoreError);
}
