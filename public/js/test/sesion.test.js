// Pruebas de sesion.js (usuario, sesión y envío). Se lanzan con: npm test
//
// sesion.js es un script normal del navegador. Aquí se lee como texto y se ejecuta con
// «vm» en un contexto que hace de navegador: localStorage, sessionStorage y fetch falsos.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const codigo = fs.readFileSync(path.join(__dirname, "..", "sesion.js"), "utf8");
const FORMA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Un almacén falso con getItem y setItem, como localStorage
function crearAlmacen(datos) {
  return {
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => {
      datos[clave] = String(valor);
    },
  };
}

// Carga sesion.js con los datos que se le pasen. Devuelve el objeto Cerda y los datos.
function cargar(local = {}, sesion = {}, extras = {}) {
  const avisos = [];
  const contexto = vm.createContext({
    localStorage: crearAlmacen(local),
    sessionStorage: crearAlmacen(sesion),
    console: { warn: (...partes) => avisos.push(partes.join(" ")) },
    ...extras,
  });
  vm.runInContext(codigo, contexto);
  return { Cerda: vm.runInContext("Cerda", contexto), local, sesion, avisos };
}

test("el usuario sale de cerda_username", () => {
  const { Cerda } = cargar({ cerda_username: "maria", username: "antiguo" });
  assert.equal(Cerda.usuario(), "maria");
});

test("si no hay cerda_username, se usa el antiguo username", () => {
  const { Cerda } = cargar({ username: "pau" });
  assert.equal(Cerda.usuario(), "pau");
});

test("sin nombre guardado, el jugador es invitado", () => {
  assert.equal(cargar().Cerda.usuario(), "invitado");
  assert.equal(cargar({ cerda_username: "" }).Cerda.usuario(), "invitado");
  assert.equal(cargar({ cerda_username: "   " }).Cerda.usuario(), "invitado");
});

test("el nombre se limpia para que lo acepte el servidor (alpha_dash, máx. 40)", () => {
  assert.equal(cargar({ cerda_username: "Ana María" }).Cerda.usuario(), "Ana_María");
  assert.equal(cargar({ cerda_username: "joan.p@mail" }).Cerda.usuario(), "joan_p_mail");
  assert.equal(cargar({ cerda_username: "a-b_c9" }).Cerda.usuario(), "a-b_c9");
  assert.equal(cargar({ cerda_username: "x".repeat(60) }).Cerda.usuario().length, 40);
});

test("el session_id es un UUID versión 4 (con y sin crypto.randomUUID)", () => {
  const sinCrypto = cargar().Cerda;
  for (let i = 0; i < 50; i++) {
    assert.match(sinCrypto.crearUuid(), FORMA_UUID);
  }
  const conCrypto = cargar({}, {}, { crypto: { randomUUID: () => "0f8fad5b-d9cb-469f-a165-70867728950e" } }).Cerda;
  assert.equal(conCrypto.crearUuid(), "0f8fad5b-d9cb-469f-a165-70867728950e");
});

test("la sesión se guarda por juego en sessionStorage y no cambia al pedirla otra vez", () => {
  const { Cerda, sesion } = cargar();
  const memory = Cerda.sesionActual("memory");
  assert.match(memory, FORMA_UUID);
  assert.equal(Cerda.sesionActual("memory"), memory);
  assert.equal(sesion.cerda_session_memory, memory);
  // otro juego tiene su propia sesión
  assert.notEqual(Cerda.sesionActual("metro"), memory);
});

test("al recargar la página (mismo sessionStorage) se mantiene la sesión", () => {
  const primera = cargar();
  const id = primera.Cerda.sesionActual("eixample");
  const recarga = cargar({}, primera.sesion);
  assert.equal(recarga.Cerda.sesionActual("eixample"), id);
});

test("nuevaSesion cambia el session_id y un valor guardado no válido se sustituye", () => {
  const { Cerda } = cargar({}, { cerda_session_timeline: "0000-0000" });
  const id = Cerda.sesionActual("timeline");
  assert.match(id, FORMA_UUID);
  assert.notEqual(Cerda.nuevaSesion("timeline"), id);
});

test("los segundos de sesión son un entero desde el inicio de la visita", () => {
  const { Cerda, sesion } = cargar();
  Cerda.sesionActual("metro");
  sesion.cerda_inicio_metro = String(Date.now() - 90500);
  const segundos = Cerda.segundosDeSesion("metro");
  assert.ok(Number.isInteger(segundos));
  assert.ok(segundos >= 90 && segundos <= 92);
});

test("sin sessionStorage (modo privado) funciona igual en memoria", () => {
  const contexto = vm.createContext({ console: { warn() {} } });
  vm.runInContext(codigo, contexto);
  const Cerda = vm.runInContext("Cerda", contexto);
  const id = Cerda.sesionActual("memory");
  assert.equal(Cerda.sesionActual("memory"), id);
  assert.equal(Cerda.usuario(), "invitado");
});

test("enviar hace un POST JSON a /api/guardar-metricas", async () => {
  const llamadas = [];
  const fetch = (url, opciones) => {
    llamadas.push({ url, opciones });
    return Promise.resolve({ ok: true, status: 201 });
  };
  const { Cerda, avisos } = cargar({}, {}, { fetch });
  await Cerda.enviar({ game: "memory", level: 1 });
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, "/api/guardar-metricas");
  assert.equal(llamadas[0].opciones.method, "POST");
  assert.equal(llamadas[0].opciones.headers["Content-Type"], "application/json");
  assert.equal(llamadas[0].opciones.headers.Accept, "application/json");
  assert.equal(llamadas[0].opciones.keepalive, true);
  assert.deepEqual(JSON.parse(llamadas[0].opciones.body), { game: "memory", level: 1 });
  assert.equal(avisos.length, 0);
});

test("enviar no lanza si falla la red", async () => {
  const fetch = () => Promise.reject(new Error("sin red"));
  const { Cerda, avisos } = cargar({}, {}, { fetch });
  const resultado = await Cerda.enviar({ game: "metro" });
  assert.equal(resultado, null);
  assert.equal(avisos.length, 1);
});

test("enviar no lanza si fetch no existe o falla al llamarlo", async () => {
  const sinFetch = cargar();
  assert.equal(await sinFetch.Cerda.enviar({}), null);
  const rompe = cargar({}, {}, { fetch: () => { throw new Error("roto"); } });
  assert.equal(await rompe.Cerda.enviar({}), null);
});

test("enviar avisa en la consola si el servidor contesta con error", async () => {
  const fetch = () => Promise.resolve({ ok: false, status: 422 });
  const { Cerda, avisos } = cargar({}, {}, { fetch });
  await Cerda.enviar({});
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /422/);
});
