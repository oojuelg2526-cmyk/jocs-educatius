// Pruebas del guardado y del bloqueo: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const codigo = fs.readFileSync(path.join(__dirname, "..", "js", "storage.js"), "utf8");

// Carga storage.js con un localStorage falso. `independiente` cambia la constante JUEGO_INDEPENDIENTE.
function cargar(independiente, search) {
  const datos = {};
  const contexto = vm.createContext({
    localStorage: {
      getItem: (k) => (k in datos ? datos[k] : null),
      setItem: (k, v) => { datos[k] = String(v); },
    },
    location: { search: search || "" },
  });
  vm.runInContext(codigo.replace(/const JUEGO_INDEPENDIENTE = (true|false);/, "const JUEGO_INDEPENDIENTE = " + independiente + ";"), contexto);
  return { datos, run: (c) => vm.runInContext(c, contexto) };
}

test("juego independiente: siempre abierto", () => {
  assert.equal(cargar(true).run("isUnlocked()"), true);
});

test("juego integrado: bloqueado hasta superar el juego 3", () => {
  const juego = cargar(false);
  assert.equal(juego.run("isUnlocked()"), false);
  juego.datos.juego3Superado = "true";
  assert.equal(juego.run("isUnlocked()"), true);
});

test("juego integrado: ?dev=1 lo abre", () => {
  assert.equal(cargar(false, "?dev=1").run("isUnlocked()"), true);
});

test("al superar el nivel 3 se guarda juego4Superado y el progreso con el formato del equipo", () => {
  const juego = cargar(true);
  juego.run("saveLevelDone(1, 1000); saveLevelDone(2, 900)");
  assert.equal(juego.datos.juego4Superado, undefined);
  juego.run("saveLevelDone(3, 800); saveLevelDone(3, 700)"); // la segunda puntuación, peor, no cuenta
  assert.equal(juego.datos.juego4Superado, "true");
  const game = JSON.parse(juego.datos.cerda_progress).games[4];
  assert.equal(game.status, "completed");
  assert.equal(game.last_level_completed, 3);
  assert.equal(game.best_score, 2700);
  assert.equal(juego.run("lastLevelCompleted()"), 3);
});

test("el session_id tiene forma de UUID versión 4", () => {
  const juego = cargar(true);
  for (let i = 0; i < 50; i++) {
    assert.match(juego.run("newId()"), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  }
});

test("la sesión guarda las métricas del intento y se sustituye al guardarla otra vez", () => {
  const juego = cargar(true);
  const datos = JSON.parse(juego.run(`(function () {
    const s = newSession();
    addAttempt(s, { level: 1, won: true, moves: 18, helps: 0, seconds: 40, score: 1210, stars: 3 });
    saveSession(s, Date.now() - 5000);
    addAttempt(s, { level: 2, won: false, moves: 5, helps: 1, seconds: 20, score: 0, stars: 0 });
    saveSession(s, Date.now() - 9000);
    return JSON.stringify(JSON.parse(localStorage.getItem("cerda_sessions")));
  })()`));
  assert.equal(datos.length, 1);
  assert.equal(datos[0].attempts.length, 2);
  assert.equal(datos[0].final_score, 1210);
  assert.equal(datos[0].level_reached, 2);
  assert.deepEqual(Object.keys(datos[0].attempts[0]).sort(), ["completed", "help_clicks", "level", "level_time", "moves_count", "score", "stars"]);
});
