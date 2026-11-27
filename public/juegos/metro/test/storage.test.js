// Pruebas del guardado y del bloqueo: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const codigo = fs.readFileSync(path.join(__dirname, "..", "js", "storage.js"), "utf8");
const progresion = fs.readFileSync(path.join(__dirname, "..", "..", "..", "js", "progresion.js"), "utf8");
const sesion = fs.readFileSync(path.join(__dirname, "..", "..", "..", "js", "sesion.js"), "utf8");

// Carrega els scripts amb les mateixes claus que utilitza el navegador.
function cargar(search = "") {
  const datos = {};
  const datosSesion = {};
  const contexto = vm.createContext({
    localStorage: {
      getItem: (k) => (k in datos ? datos[k] : null),
      setItem: (k, v) => { datos[k] = String(v); },
    },
    sessionStorage: {
      getItem: (k) => (k in datosSesion ? datosSesion[k] : null),
      setItem: (k, v) => { datosSesion[k] = String(v); },
    },
    location: { search },
    console: { warn() {} },
  });
  vm.runInContext(sesion, contexto);
  vm.runInContext(progresion, contexto);
  vm.runInContext(codigo, contexto);
  return { datos, run: (c) => vm.runInContext(c, contexto) };
}

test("recupera una victòria antiga de Memory sense perdre la partida", () => {
  const juego = cargar();
  const partida = '{"games":{"1":{"status":"completed","best_score":450}}}';
  juego.datos.cerda_progress = partida;
  assert.equal(juego.run("ultimoJuegoSuperado()"), 1);
  assert.equal(juego.datos.juego1Superado, "true");
  assert.equal(juego.datos.cerda_progress, partida);
});

test("respecta l’ordre encara que el navegador tingui una victòria posterior", () => {
  const juego = cargar();
  juego.datos.juego3Superado = "true";
  assert.equal(juego.run("ultimoJuegoSuperado()"), 0);
  juego.datos.juego1Superado = "true";
  assert.equal(juego.run("ultimoJuegoSuperado()"), 1);
  juego.datos.juego2Superado = "true";
  assert.equal(juego.run("ultimoJuegoSuperado()"), 3);
});

test("ignora el paràmetre dev de l’URL", () => {
  assert.equal(cargar("?dev=1").run("ultimoJuegoSuperado()"), 0);
});

test("al superar el nivel 3 se guarda juego4Superado y el progreso con el formato del equipo", () => {
  const juego = cargar();
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
  const juego = cargar();
  for (let i = 0; i < 50; i++) {
    assert.match(juego.run("newId()"), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  }
});

test("la sesión guarda las métricas del intento y se sustituye al guardarla otra vez", () => {
  const juego = cargar();
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

test("el envío al servidor lleva los nombres de /api/guardar-metricas", () => {
  const juego = cargar();
  juego.datos.username = "maria";
  const datos = JSON.parse(juego.run(`(function () {
    const s = newSession();
    const res = { level: 2, won: true, moves: 30, helps: 1, seconds: 75, score: 950, stars: 2 };
    return JSON.stringify(buildPayload(s, res, Date.now() - 60000));
  })()`));
  assert.equal(datos.username, "maria");
  assert.equal(datos.game, "metro");
  assert.equal(datos.level, 2);
  assert.equal(datos.level_time, 75);
  assert.equal(datos.moves_count, 30);
  assert.equal(datos.help_clicks, 1);
  assert.equal(datos.final_score, 950);
  assert.equal(datos.completed, true);
  assert.match(datos.session_id, /^[0-9a-f-]{36}$/);
});

test("el usuario y el session_id vienen de sesion.js y son los mismos en toda la visita", () => {
  const juego = cargar();
  juego.datos.cerda_username = "pau";
  const primera = JSON.parse(juego.run("JSON.stringify(newSession())"));
  const segunda = JSON.parse(juego.run("JSON.stringify(newSession())"));
  assert.equal(primera.username, "pau");
  assert.equal(primera.session_id, segunda.session_id);
  assert.equal(primera.session_id, juego.run('Cerda.sesionActual("metro")'));
});
