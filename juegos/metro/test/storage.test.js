// Pruebas del desbloqueo: node --test
import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) };
const setUrl = (search) => (globalThis.location = { search });

let n = 0;
const load = () => import(`../js/storage.js?t=${n++}`);

function reset(search = "") {
  store.clear();
  delete globalThis.CERDA;
  setUrl(search);
}

test("modo independiente: el juego está abierto sin haber superado el 3", async () => {
  reset();
  const { isUnlocked } = await load();
  assert.equal(isUnlocked(), true);
});

test("modo integrado: bloqueado hasta superar el juego 3", async () => {
  reset("?integrated=1");
  const { isUnlocked } = await load();
  assert.equal(isUnlocked(), false);
  store.set("cerda_progress", JSON.stringify({ games: { 3: { status: "completed" } } }));
  assert.equal(isUnlocked(), true);
});

test("modo integrado con window.CERDA: bloqueado, y ?dev=1 lo abre", async () => {
  reset();
  globalThis.CERDA = { integrated: true };
  const { isUnlocked } = await load();
  assert.equal(isUnlocked(), false);
  setUrl("?dev=1");
  assert.equal(isUnlocked(), true);
});
