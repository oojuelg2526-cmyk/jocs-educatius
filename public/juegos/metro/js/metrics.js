// Métricas de cada sesión de juego. Por ahora se guardan en el navegador (cerda_sessions);
// después se enviarán al servidor con el mismo formato.
//
// Comunes: username, session_id, date_time, session_length.
// Propias: level_reached, level_time, moves_count, help_clicks, final_score.

const KEY = "cerda_sessions";

export function newSession(username) {
  return {
    username,
    session_id: crypto.randomUUID(),
    date_time: new Date().toISOString(),
    started: Date.now(),
    level_reached: 1,
    final_score: 0,
    attempts: [], // una fila por intento de nivel
  };
}

// Apunta el resultado de un intento de nivel.
export function addAttempt(session, res) {
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
    session.level_reached = Math.max(session.level_reached, Math.min(3, res.level + 1));
    session.final_score += res.score;
  }
}

// Guarda (o actualiza) la sesión en el navegador.
export function saveSession(session) {
  const { started, ...record } = session;
  record.session_length = Math.round((Date.now() - started) / 1000);
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
