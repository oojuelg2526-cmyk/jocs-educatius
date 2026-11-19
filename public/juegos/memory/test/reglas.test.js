// Pruebas de las reglas del Memory. Se lanzan con: npm test
//
// datos.js y reglas.js son scripts normales del navegador (sin import/export).
// Para probarlos en Node se leen como texto y se ejecutan con el módulo «vm» en un
// mismo contexto, igual que hace el navegador al cargar los dos <script> seguidos.
// pantalla.js no se carga porque necesita la página (document).
const test = require("node:test");
// assert normal (no «strict»): los arrays creados dentro de vm son de otro contexto y
// deepStrictEqual los vería distintos aunque tengan los mismos valores.
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const contexto = vm.createContext({});
for (const archivo of ["datos.js", "reglas.js"]) {
  const codigo = fs.readFileSync(path.join(__dirname, "..", "js", archivo), "utf8");
  vm.runInContext(codigo, contexto);
}
// Devuelve una variable o función de los scripts (p. ej. juego("NIVELES"))
const juego = (nombre) => vm.runInContext(nombre, contexto);

const NIVELES = juego("NIVELES");
const crearPartida = juego("crearPartida");
const girarCarta = juego("girarCarta");
const taparFallo = juego("taparFallo");
const usarPista = juego("usarPista");
const contarSegundo = juego("contarSegundo");
const calcularEstrellas = juego("calcularEstrellas");
const calcularPuntos = juego("calcularPuntos");

// Posiciones de las dos cartas de una pareja
function posicionesDe(partida, pareja) {
  const posiciones = [];
  partida.cartas.forEach((carta, i) => {
    if (carta.pareja === pareja) posiciones.push(i);
  });
  return posiciones;
}

// Gira dos cartas que no son pareja (una de cada uno de los dos primeros monumentos)
function fallar(partida) {
  girarCarta(partida, posicionesDe(partida, partida.monumentos[0].id)[0]);
  girarCarta(partida, posicionesDe(partida, partida.monumentos[1].id)[0]);
  taparFallo(partida);
}

test("cada nivel tiene 2 cartas por pareja: 8, 12 y 16", () => {
  const cartas = NIVELES.map((nivel) => crearPartida(nivel).cartas.length);
  assert.deepEqual(cartas, [8, 12, 16]);
});

test("cada pareja es una ilustración y un texto del tipo del nivel", () => {
  for (const nivel of NIVELES) {
    const partida = crearPartida(nivel);
    for (const monumento of partida.monumentos) {
      const tipos = posicionesDe(partida, monumento.id).map((i) => partida.cartas[i].tipo);
      assert.deepEqual(tipos.sort(), ["imagen", nivel.tipo].sort());
    }
  }
});

test("dos cartas del mismo monumento son pareja", () => {
  const partida = crearPartida(NIVELES[0]);
  const [a, b] = posicionesDe(partida, partida.monumentos[0].id);
  assert.equal(girarCarta(partida, a), "primera");
  assert.equal(girarCarta(partida, b), "pareja");
  assert.equal(partida.cartas[a].estado, "acertada");
  assert.equal(partida.aciertos, 1);
});

test("un fallo bloquea el tablero hasta taparlo y suma un fallo", () => {
  const partida = crearPartida(NIVELES[0]);
  girarCarta(partida, posicionesDe(partida, partida.monumentos[0].id)[0]);
  assert.equal(girarCarta(partida, posicionesDe(partida, partida.monumentos[1].id)[0]), "fallo");
  assert.equal(partida.fallos, 1);
  assert.equal(girarCarta(partida, posicionesDe(partida, partida.monumentos[2].id)[0]), "nada");
  taparFallo(partida);
  assert.equal(partida.bloqueada, false);
  assert.equal(partida.cartas.filter((c) => c.estado === "girada").length, 0);
});

test("no se puede girar una carta ya acertada", () => {
  const partida = crearPartida(NIVELES[0]);
  const [a, b] = posicionesDe(partida, partida.monumentos[0].id);
  girarCarta(partida, a);
  girarCarta(partida, b);
  assert.equal(girarCarta(partida, a), "nada");
});

test("al acertar todas las parejas la partida termina", () => {
  const partida = crearPartida(NIVELES[1]);
  for (const monumento of partida.monumentos) {
    const [a, b] = posicionesDe(partida, monumento.id);
    girarCarta(partida, a);
    girarCarta(partida, b);
  }
  assert.equal(partida.terminada, true);
  assert.equal(partida.movimientos, 6);
});

test("las estrellas bajan con los fallos pero nunca de 1", () => {
  const partida = crearPartida(NIVELES[0]); // 3 estrellas hasta 2 fallos, 2 hasta 5
  assert.equal(calcularEstrellas(partida), 3);
  for (let i = 0; i < 3; i++) fallar(partida);
  assert.equal(calcularEstrellas(partida), 2);
  for (let i = 0; i < 10; i++) fallar(partida);
  assert.equal(calcularEstrellas(partida), 1);
});

test("la pista enseña una pareja tapada y se gastan como mucho 3", () => {
  const partida = crearPartida(NIVELES[0]);
  const posiciones = usarPista(partida);
  assert.equal(posiciones.length, 2);
  assert.equal(partida.cartas[posiciones[0]].pareja, partida.cartas[posiciones[1]].pareja);
  usarPista(partida);
  usarPista(partida);
  assert.deepEqual(usarPista(partida), []);
  assert.equal(partida.pistasUsadas, 3);
});

test("con una carta girada, la pista enseña la que le falta", () => {
  const partida = crearPartida(NIVELES[0]);
  const [a, b] = posicionesDe(partida, partida.monumentos[0].id);
  girarCarta(partida, a);
  assert.deepEqual(usarPista(partida), [b]);
});

test("puntos: 100 por pareja, 10 menos por fallo y nunca negativos", () => {
  const partida = crearPartida(NIVELES[0]);
  fallar(partida);
  assert.equal(calcularPuntos(partida), 0);
  const [a, b] = posicionesDe(partida, partida.monumentos[0].id);
  girarCarta(partida, a);
  girarCarta(partida, b);
  assert.equal(calcularPuntos(partida), 90);
});

test("el reloj cuenta segundos hasta que termina la partida", () => {
  const partida = crearPartida(NIVELES[0]);
  contarSegundo(partida);
  contarSegundo(partida);
  partida.terminada = true;
  contarSegundo(partida);
  assert.equal(partida.segundos, 2);
});

test("en el nivel de barrios no se repite ningún barrio", () => {
  const nivelBarrios = NIVELES.find((nivel) => nivel.tipo === "barrio");
  for (let i = 0; i < 50; i++) {
    const barrios = crearPartida(nivelBarrios).monumentos.map((m) => m.barrio);
    assert.equal(new Set(barrios).size, barrios.length);
  }
});
