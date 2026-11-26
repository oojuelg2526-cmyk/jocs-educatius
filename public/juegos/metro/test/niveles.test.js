// Pruebas del juego: node --test
// Los archivos del juego son scripts normales (sin import/export), así que se cargan con vm.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Carga levels.js y game.js en un contexto aparte y devuelve lo que necesitan las pruebas.
const contexto = vm.createContext({});
for (const archivo of ["levels.js", "lang.js", "game.js"]) {
  const codigo = fs.readFileSync(path.join(__dirname, "..", "js", archivo), "utf8");
  vm.runInContext(codigo, contexto);
}
const run = (codigo) => vm.runInContext(codigo, contexto);

// Busca la mejor ruta de un nivel (por anchura) y devuelve cuántos movimientos tiene, o null si no hay solución.
const mejorRuta = (indice) =>
  run(`(function () {
    const inicio = createGame(LEVELS[${indice}]);
    const clave = (g) => g.row + "," + g.col + "," + g.line + "," + g.pieces.map((p) => (p.taken ? 1 : 0)).join("");
    const vistos = {};
    vistos[clave(inicio)] = true;
    let frontera = [inicio];
    for (let pasos = 1; pasos <= 400 && frontera.length > 0; pasos++) {
      const siguiente = [];
      for (const g of frontera) {
        for (const linea of cellAt(g, g.row, g.col).lines) {
          for (const dir of ["up", "down", "left", "right"]) {
            const copia = JSON.parse(JSON.stringify(g));
            if (linea !== copia.line) chooseLine(copia, linea);
            const antes = copia.moves;
            const res = move(copia, dir);
            if (copia.moves === antes) continue;
            if (res.event === "won") return pasos;
            const k = clave(copia);
            if (!vistos[k]) { vistos[k] = true; siguiente.push(copia); }
          }
        }
      }
      frontera = siguiente;
    }
    return null;
  })()`);

test("hay 3 niveles", () => {
  assert.equal(run("LEVELS.length"), 3);
});

test("cada nivel tiene solución y bestMoves es el mínimo", () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(mejorRuta(i), run(`LEVELS[${i}].bestMoves`), `nivel ${i + 1}`);
  }
});

test("las paredes no dejan pasar", () => {
  const res = run(`(function () { const g = createGame(LEVELS[0]); return move(g, "up").event; })()`);
  assert.equal(res, "wall");
});

test("nivel 2: Catalunya está cerrada", () => {
  const res = run(`(function () {
    const g = createGame(LEVELS[1]);
    let r;
    for (let i = 0; i < 6; i++) r = move(g, "right");
    return r.event;
  })()`);
  assert.equal(res, "closed");
});

test("nivel 2: para bajar por la L2 hay que cambiar de línea", () => {
  const antes = run(`move(createGame(LEVELS[1]), "down").event`);
  const despues = run(`(function () { const g = createGame(LEVELS[1]); chooseLine(g, 2); return move(g, "down").event; })()`);
  assert.equal(antes, "line");
  assert.equal(despues, "moved");
});

test("recoger un trozo, y llegar al final sin todos los trozos no gana", () => {
  // desde Universitat, 8 pasos a la izquierda llegan a Rocafort, que tiene un trozo
  const trozo = run(`(function () { const g = createGame(LEVELS[0]); let r; for (let i = 0; i < 8; i++) r = move(g, "left"); return r.event; })()`);
  assert.equal(trozo, "piece");
  // 8 pasos a la derecha llegan a Urquinaona, pero faltan los 3 trozos
  const falta = run(`(function () {
    const g = createGame(LEVELS[0]);
    let r;
    for (let i = 0; i < 8; i++) r = move(g, "right");
    return r.event + ":" + r.left + ":" + g.status;
  })()`);
  assert.equal(falta, "missing-pieces:3:playing");
});

test("nivel 2: Passeig de Gràcia (hora punta) se cierra unos segundos", () => {
  // se baja por la L2 hasta la casilla de encima de Passeig de Gràcia
  const preparar = `const g = createGame(LEVELS[1]); chooseLine(g, 2); for (let i = 0; i < 6; i++) move(g, "down");`;
  // el segundo 11 todavía está abierta, el 12 se cierra y el 18 se vuelve a abrir
  assert.equal(run(`(function () { ${preparar} g.seconds = 11; return move(g, "down").event; })()`), "moved");
  assert.equal(run(`(function () { ${preparar} g.seconds = 12; return move(g, "down").event; })()`), "rush");
  assert.equal(run(`(function () { ${preparar} g.seconds = 17; return move(g, "down").event; })()`), "rush");
  assert.equal(run(`(function () { ${preparar} g.seconds = 18; return move(g, "down").event; })()`), "moved");
});

test("los trozos están en casillas de vía o de estación", () => {
  for (let i = 0; i < 3; i++) {
    const tipos = run(`(function () {
      const g = createGame(LEVELS[${i}]);
      return JSON.stringify(g.pieces.map((p) => cellAt(g, p.r, p.c).type));
    })()`);
    for (const tipo of JSON.parse(tipos)) {
      assert.notEqual(tipo, "wall", `nivel ${i + 1}`);
    }
  }
});

test("todos los textos de los niveles existen en los 3 idiomas", () => {
  const faltan = run(`(function () {
    const missing = [];
    const claves = [];
    for (const level of LEVELS) {
      claves.push(level.nameKey, level.tipKey);
      for (const letra in level.stations) {
        const nombre = level.stations[letra].nameKey;
        claves.push(nombre, nombre.replace("st_", "fact_"));
      }
    }
    for (const k of ["how_title", "how_who", "how_goal", "how_move", "how_lines", "how_obstacles", "how_score", "how_time", "how_start", "how_button", "msg_rush"]) {
      claves.push(k);
    }
    for (const idioma of ["es", "ca", "en"]) {
      for (const k of claves) {
        if (!TEXTS[idioma][k]) missing.push(idioma + ":" + k);
      }
    }
    return JSON.stringify(missing);
  })()`);
  assert.deepEqual(JSON.parse(faltan), []);
});

test("nivel 3: se acaba el tiempo", () => {
  const estado = run(`(function () { const g = createGame(LEVELS[2]); for (let i = 0; i < 300; i++) tickSecond(g); return g.status; })()`);
  assert.equal(estado, "timeout");
});

test("puntos y estrellas", () => {
  const datos = run(`(function () {
    const g = createGame(LEVELS[0]);
    g.moves = 40; g.pieces.forEach((p) => (p.taken = true));
    const tres = stars(g), puntos = score(g);
    g.moves = 46; const dos = stars(g);
    g.moves = 70; const una = stars(g);
    g.moves = 40; g.helps = 1; const conAyuda = stars(g);
    return JSON.stringify([puntos, tres, dos, una, conAyuda]);
  })()`);
  assert.deepEqual(JSON.parse(datos), [1000 - 5 * 40 + 300, 3, 2, 1, 2]);
});
