// Habla con el servidor (Laravel). Si no hay servidor o no hay sesión de login,
// no hace nada y el juego sigue con localStorage. Formato en docs/api-contrato.md.
import { mergeProgress } from "./storage.js";

const GAME = 4;
const PENDING_KEY = "cerda_pending"; // sesiones que aún no han llegado al servidor
const SESSIONS_KEY = "cerda_sessions";

let serverOff = false; // se pone a true si el servidor dice que no hay sesión

// Hay servidor si la vista de Laravel ha puesto window.CERDA con el usuario.
function enabled() {
  return !serverOff && Boolean(globalThis.CERDA?.user);
}

function csrfToken() {
  return globalThis.document?.querySelector('meta[name="csrf-token"]')?.content ?? "";
}

// Una petición JSON. Devuelve { status, data } o null si no hay red.
async function request(method, url, body) {
  try {
    const res = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": csrfToken() },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch {
    return null;
  }
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

function setPending(id, isPending) {
  const rest = readList(PENDING_KEY).filter((x) => x !== id);
  writeList(PENDING_KEY, isPending ? [...rest, id] : rest);
}

// Solo los campos que pide el contrato (sin username: lo pone el servidor).
function toPayload(s) {
  return {
    game: GAME,
    date_time: s.date_time,
    session_length: s.session_length,
    level_reached: s.level_reached,
    final_score: s.final_score,
    attempts: s.attempts,
  };
}

// Envía una sesión. Si falla por culpa del servidor o de la red, queda pendiente.
export async function sendSession(record) {
  if (!enabled()) return false;
  setPending(record.session_id, true);
  const res = await request("PUT", `/api/sessions/${record.session_id}`, toPayload(record));
  if (!res) return false; // sin red: se reintenta otro día
  if (res.status === 401) {
    serverOff = true; // sin login: modo local
    return false;
  }
  if (res.status === 200 || res.status === 201) {
    setPending(record.session_id, false);
    if (res.data.progress) mergeProgress({ [GAME]: res.data.progress });
    return true;
  }
  if (res.status === 403 || res.status === 422) setPending(record.session_id, false); // reintentar no serviría
  return false;
}

// Reenvía las sesiones que se quedaron sin enviar.
export async function sendPending() {
  const all = readList(SESSIONS_KEY);
  for (const id of readList(PENDING_KEY)) {
    const record = all.find((s) => s.session_id === id);
    if (!record) setPending(id, false);
    else if (!(await sendSession(record)) && serverOff) return;
  }
}

// Al abrir: trae el progreso del servidor y lo junta con el local.
export async function syncFromServer() {
  if (!enabled()) return;
  const res = await request("GET", "/api/progress");
  if (res?.status === 401) serverOff = true;
  else if (res?.status === 200) mergeProgress(res.data.games ?? {});
  await sendPending();
}
