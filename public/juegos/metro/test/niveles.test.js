// Pruebas del juego: node --test
// Los archivos del juego son scripts normales (sin import/export), así que se cargan con vm.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Carga levels.js, lang.js y game.js en un contexto aparte y devuelve lo que necesitan las pruebas.
const contexto = vm.createContext({});
for (const archivo of ["levels.js", "lang.js", "game.js"]) {
  const codigo = fs.readFileSync(path.join(__dirname, "..", "js", archivo), "utf8");
  vm.runInContext(codigo, contexto);
}
const run = (codigo) => vm.runInContext(codigo, contexto);

// Funciones de ayuda que se usan dentro de las pruebas (los mapas son los reales, así que no se cuentan casillas a mano)
run(`
  // La letra de una estación por su clave de nombre (en el nivel 3 Passeig de Gràcia tiene dos letras: se coge la primera)
  function letraDe(nivel, claveNombre) {
    for (const letra in LEVELS[nivel].stations) {
      if (LEVELS[nivel].stations[letra].nameKey === claveNombre) return letra;
    }
    return null;
  }
  // Pone la ficha en una casilla vecina de (r, c) por la que se pueda entrar, y devuelve la dirección para entrar
  function acercar(g, r, c) {
    const destino = cellAt(g, r, c);
    const dirs = { up: [1, 0], down: [-1, 0], left: [0, 1], right: [0, -1] }; // desde dónde se entra yendo hacia esa dirección
    for (const dir in dirs) {
      const vecina = cellAt(g, r + dirs[dir][0], c + dirs[dir][1]);
      if (vecina === null || vecina.type === "wall") continue;
      for (const linea of vecina.lines) {
        if (destino.lines.includes(linea)) {
          g.row = r + dirs[dir][0]; g.col = c + dirs[dir][1]; g.line = linea;
          return dir;
        }
      }
    }
    return null;
  }
`);

// Busca la mejor ruta de un nivel (por anchura) y devuelve cuántos movimientos tiene, o null si no hay solución.
// Para ir rápido solo se copia lo que cambia (posición, línea, movimientos y trozos); el mapa no se copia.
const mejorRuta = (indice) =>
  run(`(function () {
    const copiar = (g) => Object.assign({}, g, { pieces: g.pieces.map((p) => Object.assign({}, p)) });
    const inicio = createGame(LEVELS[${indice}]);
    const clave = (g) => g.row + "," + g.col + "," + g.line + "," + g.pieces.map((p) => (p.taken ? 1 : 0)).join("");
    const vistos = {};
    vistos[clave(inicio)] = true;
    let frontera = [inicio];
    for (let pasos = 1; pasos <= 600 && frontera.length > 0; pasos++) {
      const siguiente = [];
      for (const g of frontera) {
        for (const linea of cellAt(g, g.row, g.col).lines) {
          for (const dir of ["up", "down", "left", "right"]) {
            const copia = copiar(g);
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
  // desde la salida, alguna de las 4 direcciones da a una pared
  const eventos = run(`(function () {
    const res = [];
    for (const dir of ["up", "down", "left", "right"]) res.push(move(createGame(LEVELS[0]), dir).event);
    return JSON.stringify(res);
  })()`);
  assert.ok(JSON.parse(eventos).includes("wall"));
});

test("la salida es Universitat y el destino Urquinaona en los 3 niveles", () => {
  const datos = run(`JSON.stringify(LEVELS.map((l) => [l.stations[l.start].nameKey, l.stations[l.end].nameKey]))`);
  for (const par of JSON.parse(datos)) assert.deepEqual(par, ["st_universitat", "st_urquinaona"]);
});

test("nivel 2: Catalunya está cerrada", () => {
  const res = run(`(function () {
    const g = createGame(LEVELS[1]);
    const c = findStation(g.grid, letraDe(1, "st_catalunya"));
    return canEnter(g, c.r, c.c);
  })()`);
  assert.equal(res, "closed");
});

test("nivel 2: para subir a otra línea hay que cambiar de línea en Universitat", () => {
  // Universitat tiene la L1 y la L2: por una vía de la L2 solo se entra después de elegir la L2
  const datos = run(`(function () {
    const g = createGame(LEVELS[1]);
    const sin = [], con = [];
    for (const dir of ["up", "down", "left", "right"]) {
      sin.push(move(createGame(LEVELS[1]), dir).event);
      const h = createGame(LEVELS[1]);
      chooseLine(h, 2);
      con.push(move(h, dir).event);
    }
    return JSON.stringify({ sin: sin, con: con });
  })()`);
  const { sin, con } = JSON.parse(datos);
  assert.ok(sin.includes("line"), "con la L1 una de las vías es de otra línea");
  assert.ok(con.includes("moved"), "con la L2 se puede entrar por esa vía");
});

test("recoger un trozo, y llegar al final sin todos los trozos no gana", () => {
  // en el nivel 1 se pone la ficha al lado del primer trozo y se entra: es un trozo
  const trozo = run(`(function () {
    const g = createGame(LEVELS[0]);
    const p = g.pieces[0];
    const dir = acercar(g, p.r, p.c);
    return move(g, dir).event;
  })()`);
  assert.equal(trozo, "piece");
  // al lado de Urquinaona, sin ningún trozo, se avisa de cuántos faltan y el nivel sigue
  const falta = run(`(function () {
    const g = createGame(LEVELS[0]);
    const fin = findStation(g.grid, LEVELS[0].end);
    const dir = acercar(g, fin.r, fin.c);
    const r = move(g, dir);
    return r.event + ":" + r.left + ":" + g.status;
  })()`);
  assert.equal(falta, "missing-pieces:3:playing");
});

test("con todos los trozos, entrar en Urquinaona gana", () => {
  for (let i = 0; i < 3; i++) {
    const estado = run(`(function () {
      const g = createGame(LEVELS[${i}]);
      g.pieces.forEach((p) => (p.taken = true));
      const fin = findStation(g.grid, LEVELS[${i}].end);
      const dir = acercar(g, fin.r, fin.c);
      const r = move(g, dir);
      return r.event + ":" + g.status;
    })()`);
    assert.equal(estado, "won:won", `nivel ${i + 1}`);
  }
});

test("nivel 3: se acaba el tiempo", () => {
  const estado = run(`(function () { const g = createGame(LEVELS[2]); for (let i = 0; i < LEVELS[2].timeLimit; i++) tickSecond(g); return g.status; })()`);
  assert.equal(estado, "timeout");
});

test("puntos y estrellas", () => {
  const datos = run(`(function () {
    const g = createGame(LEVELS[0]);
    const mejor = LEVELS[0].bestMoves;
    g.moves = mejor; g.pieces.forEach((p) => (p.taken = true));
    const tres = stars(g), puntos = score(g);
    g.moves = mejor + 6; const dos = stars(g);
    g.moves = mejor + 30; const una = stars(g);
    g.moves = mejor; g.helps = 1; const conAyuda = stars(g);
    return JSON.stringify([puntos, tres, dos, una, conAyuda, mejor]);
  })()`);
  const [puntos, tres, dos, una, conAyuda, mejor] = JSON.parse(datos);
  assert.deepEqual([puntos, tres, dos, una, conAyuda], [1000 - 5 * mejor + 300, 3, 2, 1, 2]);
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

test("los nombres y datos curiosos de las estaciones existen en los 3 idiomas, y los textos del juego también", () => {
  const faltan = run(`(function () {
    const missing = [];
    const claves = [];
    for (const level of LEVELS) {
      claves.push(level.nameKey, level.tipKey);
      for (const letra in level.stations) {
        const nombre = level.stations[letra].nameKey;
        claves.push(nombre, nombre.replace("st_", "fact_")); // el nombre y su dato curioso
      }
    }
    for (const k of ["how_title", "how_who", "how_goal", "how_move", "how_map", "how_lines", "how_obstacles", "how_score", "how_time", "how_start", "how_button", "msg_all_pieces"]) {
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

test("las líneas de cada estación son las reales (L1 a L4)", () => {
  // se juntan las líneas de todas las estaciones con el mismo nombre en todos los niveles
  const lineas = JSON.parse(run(`(function () {
    const out = {};
    for (const level of LEVELS) {
      for (const letra in level.stations) {
        const st = level.stations[letra];
        if (!out[st.nameKey]) out[st.nameKey] = [];
        for (const l of st.lines) if (!out[st.nameKey].includes(l)) out[st.nameKey].push(l);
      }
    }
    for (const k in out) out[k].sort();
    return JSON.stringify(out);
  })()`));
  assert.deepEqual(lineas.st_passeig, [2, 3, 4]);
  assert.deepEqual(lineas.st_catalunya, [1, 3]);
  assert.deepEqual(lineas.st_universitat, [1, 2]);
  assert.deepEqual(lineas.st_urquinaona, [1, 4]);
  assert.deepEqual(lineas.st_liceu, [3]);
  assert.deepEqual(lineas.st_joanic, [4]);
});
