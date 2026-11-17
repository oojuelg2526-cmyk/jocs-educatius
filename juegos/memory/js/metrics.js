// Métricas de cada sesión. Por ahora se guardan en el navegador (cerda_sessions, el mismo
// formato que el resto de juegos); después se enviarán al servidor.
//
// Comunes: username, session_id, date_time, session_length.
// Propias: attempts, errors_made, level_reached, level_time (+ moves_count, help_clicks, score, stars).

const KEY = "cerda_sessions";

export function newSession(username) {
  return {
    game_id: 1,
    username,
    session_id: crypto.randomUUID(),
    date_time: new Date().toISOString(),
    started: Date.now(),
    level_reached: 1,
    final_score: 0,
    attempts: [], // una fila por intento de nivel
  };
}

export function addAttempt(session, res) {
  session.attempts.push({
    level: res.level,
    level_time: res.seconds,
    errors_made: res.errors,
    moves_count: res.moves,
    help_clicks: res.helps,
    score: res.score,
    stars: res.stars,
    completed: res.won,
  });
  if (res.won) {
    session.level_reached = Math.max(session.level_reached, Math.min(3, res.level + 1));
    session.final_score += res.score;
  }
}

export function saveSession(session) {
  const { started, ...record } = session;
  record.session_length = Math.round((Date.now() - started) / 1000);
  record.attempts_count = record.attempts.length;
  try {
    const all = JSON.parse(localStorage.getItem(KEY)) ?? [];
    const i = all.findIndex((s) => s.session_id === record.session_id);
    if (i >= 0) all[i] = record;
    else all.push(record);
    localStorage.setItem(KEY, JSON.stringify(all.slice(-50)));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
  return record;
}
