// Pruebas de api.js con un servidor y un localStorage falsos: node --test
import test from "node:test";
import assert from "node:assert/strict";

// localStorage falso (en memoria)
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};

// Cada llamada a fetch se apunta y responde lo que diga `reply`.
const calls = [];
let reply = () => ({ status: 200, body: {} });
globalThis.fetch = async (url, options) => {
  calls.push({ url, ...options });
  const r = reply(url, options);
  if (r === "offline") throw new Error("sin red");
  return { status: r.status, json: async () => r.body };
};

// El import va después de preparar los falsos y con un parámetro distinto en cada prueba,
// para que cada una empiece con un api.js nuevo (serverOff a false).
let n = 0;
const load = () => import(`../js/api.js?t=${n++}`);
const session = {
  username: "ana",
  session_id: "11111111-1111-4111-8111-111111111111",
  date_time: "2026-11-13T10:00:00.000Z",
  session_length: 100,
  level_reached: 2,
  final_score: 900,
  attempts: [{ level: 1, level_time: 90, moves_count: 16, help_clicks: 0, score: 900, stars: 3, completed: true }],
};

function reset() {
  store.clear();
  calls.length = 0;
  reply = () => ({ status: 200, body: {} });
  delete globalThis.CERDA;
}

test("sin window.CERDA no se llama al servidor", async () => {
  reset();
  const api = await load();
  assert.equal(await api.sendSession(session), false);
  await api.syncFromServer();
  assert.equal(calls.length, 0);
});

test("envía la sesión con PUT, CSRF y sin username", async () => {
  reset();
  globalThis.CERDA = { user: { username: "ana" } };
  reply = () => ({ status: 200, body: { progress: { status: "unlocked", last_level_completed: 1, best_score: 900 } } });
  const api = await load();
  assert.equal(await api.sendSession(session), true);
  assert.equal(calls[0].method, "PUT");
  assert.equal(calls[0].url, `/api/sessions/${session.session_id}`);
  const body = JSON.parse(calls[0].body);
  assert.equal(body.game, 4);
  assert.equal(body.username, undefined);
  assert.equal(body.attempts.length, 1);
  assert.deepEqual(JSON.parse(store.get("cerda_pending")), []);
  assert.equal(JSON.parse(store.get("cerda_progress")).games[4].last_level_completed, 1);
});

test("sin red la sesión queda pendiente y se reenvía después", async () => {
  reset();
  globalThis.CERDA = { user: { username: "ana" } };
  store.set("cerda_sessions", JSON.stringify([session]));
  reply = () => "offline";
  const api = await load();
  assert.equal(await api.sendSession(session), false);
  assert.deepEqual(JSON.parse(store.get("cerda_pending")), [session.session_id]);

  reply = () => ({ status: 201, body: { progress: { status: "unlocked", last_level_completed: 1, best_score: 900 } } });
  await api.sendPending();
  assert.deepEqual(JSON.parse(store.get("cerda_pending")), []);
});

test("401 pasa a modo local y no vuelve a llamar", async () => {
  reset();
  globalThis.CERDA = { user: { username: "ana" } };
  reply = () => ({ status: 401, body: { error: "unauthenticated" } });
  const api = await load();
  assert.equal(await api.sendSession(session), false);
  await api.sendSession(session);
  assert.equal(calls.length, 1);
});

test("422 no se reintenta", async () => {
  reset();
  globalThis.CERDA = { user: { username: "ana" } };
  reply = () => ({ status: 422, body: { error: "validation" } });
  const api = await load();
  await api.sendSession(session);
  assert.deepEqual(JSON.parse(store.get("cerda_pending")), []);
});

test("al abrir junta el progreso del servidor con el local y se queda con el mejor", async () => {
  reset();
  globalThis.CERDA = { user: { username: "ana" } };
  store.set("cerda_progress", JSON.stringify({ games: { 4: { status: "unlocked", last_level_completed: 2, level_scores: {}, best_score: 500 } } }));
  reply = () => ({
    status: 200,
    body: { games: { 3: { status: "completed", last_level_completed: 3, best_score: 2000 }, 4: { status: "unlocked", last_level_completed: 1, best_score: 900 } } },
  });
  const api = await load();
  await api.syncFromServer();
  const games = JSON.parse(store.get("cerda_progress")).games;
  assert.equal(games[3].status, "completed");
  assert.equal(games[4].last_level_completed, 2); // el local era mejor
  assert.equal(games[4].best_score, 900); // el del servidor era mejor
});
