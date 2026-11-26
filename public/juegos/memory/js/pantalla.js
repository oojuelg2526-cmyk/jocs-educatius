// PANTALLA DEL MEMORY: dibuja el juego, escucha los clics, lleva el reloj y guarda
// el progreso y las métricas. Las reglas (qué pasa al girar una carta) están en reglas.js.

const MS_FALLO = 1300; // tiempo que se ven las dos cartas de un fallo antes de taparse
const MS_PISTA = 2000; // tiempo que brillan las cartas de la pista
const MONUMENTO_EJEMPLO = "sagrada"; // monumento de la pareja de ejemplo de las instrucciones
const ID_JUEGO = 1; // el Memory es el juego 1 del proyecto

// Elementos de la página que se usan a menudo
const tablero = document.getElementById("tablero");
const mensaje = document.getElementById("mensaje");
const selectorIdioma = document.getElementById("idioma");
const fondoVentana = document.getElementById("fondo-ventana");

let idioma = localStorage.getItem("cerda_lang") ?? "ca";
let partida = null; // partida del nivel actual (la crea crearPartida de reglas.js)
let reloj = null; // el setInterval que cuenta los segundos
let jugando = false; // false mientras hay una ventana abierta o el nivel ha terminado

// ---------- Ayudas ----------

// Texto en el idioma actual. {n} y {total} se cambian por los números que se pasen.
function t(clave, n, total) {
  const texto = TEXTOS[idioma][clave] || TEXTOS.es[clave];
  return texto.replace("{n}", n).replace("{total}", total);
}

// Crea un elemento con una clase y, si se da, un texto (textContent: no se interpreta como HTML)
function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.classList.add(clase);
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function buscarMonumento(id) {
  return MONUMENTOS.filter((monumento) => monumento.id === id)[0];
}

// Texto que lleva una carta según su tipo: nombre, barrio o dato histórico
function textoDeCarta(tipo, monumento) {
  if (tipo === "nombre") return monumento.nombre;
  if (tipo === "barrio") return monumento.barrio;
  return monumento.dato[idioma];
}

// 75 segundos → "01:15"
function formatoReloj(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
  const resto = String(segundos % 60).padStart(2, "0");
  return `${minutos}:${resto}`;
}

function textoEstrellas(estrellas) {
  return "★".repeat(estrellas) + "☆".repeat(3 - estrellas);
}

// Pone los textos fijos de la página (los que llevan data-texto) en el idioma actual
function traducirPagina() {
  document.documentElement.lang = idioma;
  document.title = t("titulo");
  document.querySelectorAll("[data-texto]").forEach((elemento) => {
    elemento.textContent = t(elemento.dataset.texto);
  });
  tablero.setAttribute("aria-label", t("tablero"));
  const ayuda = document.getElementById("boton-ayuda");
  ayuda.setAttribute("aria-label", t("ayuda"));
  ayuda.title = t("ayuda");
}

// ---------- Cartas y tablero ----------

// Cara visible de una carta: etiqueta de color arriba y debajo la imagen o el texto
function crearCara(id, tipo) {
  const monumento = buscarMonumento(id);
  const cara = crear("span", "cara");
  cara.classList.add("frente", "tipo-" + tipo);
  cara.appendChild(crear("span", "etiqueta", t("tipo_" + tipo)));

  if (tipo === "imagen") {
    const marco = crear("span", "ilustracion");
    marco.style.setProperty("--color", monumento.color);
    const imagen = crear("img");
    imagen.alt = ""; // el nombre ya lo dice el aria-label del botón de la carta
    if (monumento.foto) {
      marco.classList.add("con-foto");
      imagen.src = `img/${monumento.foto.archivo}`;
    } else {
      imagen.src = `img/${monumento.id}.png`; // ilustración 3D
    }
    // Si falla la foto se prueba la ilustración 3D; si falla también, se quita
    // y queda el nombre sobre el fondo de color
    imagen.addEventListener("error", () => {
      if (marco.classList.contains("con-foto")) {
        marco.classList.remove("con-foto");
        imagen.src = `img/${monumento.id}.png`;
      } else {
        imagen.remove();
      }
    });
    marco.appendChild(imagen);
    marco.appendChild(crear("span", "nombre-reserva", monumento.nombre));
    cara.appendChild(marco);
  } else {
    cara.appendChild(crear("span", "texto", textoDeCarta(tipo, monumento)));
  }
  return cara;
}

// Crea un botón por carta. Cada botón guarda su posición en data-indice.
function pintarTablero() {
  tablero.innerHTML = "";
  tablero.dataset.nivel = partida.nivel.numero; // el CSS elige las columnas con [data-nivel]
  partida.cartas.forEach((carta, i) => {
    const boton = crear("button", "carta");
    boton.type = "button";
    boton.dataset.indice = i;
    const interior = crear("span", "interior");
    const reverso = crear("span", "cara");
    reverso.classList.add("reverso");
    interior.appendChild(reverso);
    interior.appendChild(crearCara(carta.pareja, carta.tipo));
    boton.appendChild(interior);
    boton.addEventListener("click", () => alPulsarCarta(i));
    tablero.appendChild(boton);
  });
  pintarCartas();
}

// Pone a cada botón las clases según el estado de su carta. El giro lo hace el CSS.
function pintarCartas() {
  tablero.querySelectorAll(".carta").forEach((boton) => {
    const indice = Number(boton.dataset.indice); // dataset siempre devuelve texto
    const carta = partida.cartas[indice];
    const visible = carta.estado !== "tapada";
    boton.classList.toggle("girada", visible);
    boton.classList.toggle("acertada", carta.estado === "acertada");
    boton.setAttribute("aria-disabled", carta.estado === "acertada");
    boton.setAttribute("aria-label", visible ? describirCarta(carta) : t("carta_tapada", indice + 1));
  });
}

// Lo que lee el lector de pantalla de una carta boca arriba
function describirCarta(carta) {
  const monumento = buscarMonumento(carta.pareja);
  if (carta.tipo === "imagen") return `${t(monumento.foto ? "foto" : "ilustracion")} ${monumento.nombre}`;
  return `${t("tipo_" + carta.tipo)}: ${textoDeCarta(carta.tipo, monumento)}`;
}

// ---------- Panel: misión, marcadores, pestañas y mapa ----------

function pintarMision() {
  const nivel = partida.nivel;
  document.getElementById("nombre-nivel").textContent = `${t("nivel_de", nivel.numero)} · ${t("nivel_" + nivel.numero)}`;
  document.getElementById("texto-mision").textContent = t("mision_" + nivel.tipo);
  // «Monumento + Nombre»: qué dos tipos de carta forman una pareja en este nivel
  const regla = document.getElementById("regla-pareja");
  regla.innerHTML = "";
  regla.appendChild(crear("span", "chip-imagen", t("tipo_imagen")));
  regla.appendChild(crear("span", "mas", "+"));
  regla.appendChild(crear("span", "chip-" + nivel.tipo, t("tipo_" + nivel.tipo)));
}

function pintarMarcadores() {
  const estrellas = calcularEstrellas(partida);
  const caja = document.getElementById("estrellas");
  caja.textContent = textoEstrellas(estrellas);
  caja.setAttribute("aria-label", t("estrellas_de", estrellas));
  document.getElementById("puntos").textContent = calcularPuntos(partida);
  document.getElementById("fallos").textContent = partida.fallos;
  document.getElementById("tiempo").textContent = formatoReloj(partida.segundos);

  const total = partida.nivel.parejas;
  document.getElementById("relleno").style.transform = `scaleX(${partida.aciertos / total})`;
  document.getElementById("texto-progreso").textContent = t("progreso", partida.aciertos, total);

  const pista = document.getElementById("boton-pista");
  pista.textContent = `${t("pista")} (${partida.pistas})`;
  pista.disabled = partida.pistas === 0 || partida.terminada;
}

// Pestañas de nivel: solo se puede abrir un nivel si el anterior está superado
function pintarPestanas() {
  const nav = document.getElementById("niveles");
  nav.innerHTML = "";
  nav.setAttribute("aria-label", t("niveles"));
  const superado = leerUltimoNivelSuperado();
  NIVELES.forEach((nivel) => {
    const boton = crear("button", "pestana", `${nivel.numero} · ${t("nivel_" + nivel.numero)}`);
    boton.type = "button";
    boton.disabled = nivel.numero > superado + 1;
    if (boton.disabled) boton.title = t("bloqueado");
    if (nivel.numero <= superado) boton.classList.add("superado");
    if (nivel.numero === partida.nivel.numero) boton.setAttribute("aria-current", "true");
    boton.addEventListener("click", () => empezarNivel(nivel.numero));
    nav.appendChild(boton);
  });
}

// Marca en el mapa los barrios del nivel («objetivo») y enciende los acertados («iluminado»)
function pintarMapa() {
  const delNivel = partida.monumentos.map((monumento) => monumento.id);
  let iluminados = 0;
  document.querySelectorAll("#mapa .punto").forEach((punto) => {
    const id = punto.dataset.id;
    const acertado = partida.cartas.filter((c) => c.pareja === id && c.estado === "acertada").length > 0;
    punto.classList.toggle("objetivo", delNivel.includes(id));
    punto.classList.toggle("iluminado", acertado);
    if (acertado) iluminados++;
  });
  document.getElementById("cuenta-mapa").textContent = t("mapa_cuenta", iluminados, partida.nivel.parejas);
}

// ---------- Ventana (instrucciones y final de nivel) ----------

// contenido: lista de elementos. botones: lista de { texto, alPulsar }; el primero es el principal.
function abrirVentana(antetitulo, titulo, contenido, botones) {
  jugando = false; // con la ventana abierta el reloj no cuenta
  document.getElementById("antetitulo-ventana").textContent = antetitulo;
  document.getElementById("titulo-ventana").textContent = titulo;
  const cuerpo = document.getElementById("cuerpo-ventana");
  cuerpo.innerHTML = "";
  contenido.forEach((elemento) => cuerpo.appendChild(elemento));

  const caja = document.getElementById("botones-ventana");
  caja.innerHTML = "";
  botones.forEach((datos, i) => {
    const boton = crear("button", "boton", datos.texto);
    boton.classList.add(i === 0 ? "boton-principal" : "boton-secundario");
    boton.type = "button";
    boton.addEventListener("click", datos.alPulsar);
    caja.appendChild(boton);
  });
  fondoVentana.hidden = false;
  caja.firstChild.focus();
}

function mostrarInstrucciones() {
  const nivel = partida.nivel;
  // Ejemplo fijo de pareja: la imagen y el texto del mismo monumento
  const ejemplo = crear("div", "ejemplo");
  ejemplo.appendChild(crearCara(MONUMENTO_EJEMPLO, "imagen"));
  ejemplo.appendChild(crear("span", "mas", "+"));
  ejemplo.appendChild(crearCara(MONUMENTO_EJEMPLO, nivel.tipo));

  const reglas = crear("ul", "reglas");
  ["regla_perder", "regla_tapar", "regla_pista", "regla_mapa"].forEach((clave) => {
    reglas.appendChild(crear("li", "", t(clave)));
  });

  const contenido = [
    crear("p", "intro", t("intro_" + nivel.tipo)),
    crear("p", "apartado", t("ejemplo")),
    ejemplo,
    crear("p", "apartado", t("reglas")),
    reglas,
  ];
  abrirVentana(t("nivel_de", nivel.numero), t("nivel_" + nivel.numero), contenido, [
    { texto: t("jugar"), alPulsar: empezarAJugar },
    { texto: t("creditos"), alPulsar: mostrarCreditos },
  ]);
}

// Créditos de las fotos (las licencias CC BY y CC BY-SA obligan a citar autor y licencia).
// Se abren desde las instrucciones y «Volver» regresa a ellas.
function mostrarCreditos() {
  const lista = crear("ul", "creditos");
  MONUMENTOS.filter((monumento) => monumento.foto).forEach((monumento) => {
    const foto = monumento.foto;
    const fila = crear("li");
    fila.appendChild(crear("b", "", monumento.nombre));
    fila.appendChild(document.createTextNode(` · ${foto.autor} · `));
    fila.appendChild(crearEnlace(LICENCIAS[foto.licencia], foto.licencia));
    fila.appendChild(document.createTextNode(" · "));
    fila.appendChild(crearEnlace(foto.fuente, t("creditos_original")));
    lista.appendChild(fila);
  });
  const contenido = [
    lista,
    crear("p", "nota-creditos", t("creditos_nota")),
    crear("p", "nota-creditos", t("creditos_ilustracion")),
  ];
  abrirVentana("Wikimedia Commons", t("creditos"), contenido, [{ texto: t("volver_instrucciones"), alPulsar: mostrarInstrucciones }]);
}

// Enlace que se abre en otra pestaña (así no se pierde la partida)
function crearEnlace(url, texto) {
  const enlace = crear("a", "", texto);
  enlace.href = url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  return enlace;
}

// Botón «¡A jugar!»: cierra la ventana y el reloj vuelve a contar
function empezarAJugar() {
  fondoVentana.hidden = true;
  if (!partida.terminada) jugando = true;
  tablero.querySelector(".carta").focus();
}

// ---------- Partida ----------

function empezarNivel(numero) {
  clearInterval(reloj);
  partida = crearPartida(NIVELES[numero - 1]);
  pintarTablero();
  pintarMision();
  pintarPestanas();
  pintarMapa();
  pintarMarcadores();
  mensaje.textContent = t("msg_empezar");
  mostrarInstrucciones();
  // El reloj suma un segundo cada segundo, pero solo mientras se juega
  reloj = setInterval(() => {
    if (jugando) {
      contarSegundo(partida);
      pintarMarcadores();
    }
  }, 1000);
}

function alPulsarCarta(indice) {
  if (!jugando) return;
  const resultado = girarCarta(partida, indice);
  if (resultado === "nada") return;
  pintarCartas();
  pintarMarcadores();

  if (resultado === "pareja") {
    // Lo aprendido: «Monumento — barrio — dato» debajo del tablero, y su barrio en el mapa
    const monumento = buscarMonumento(partida.cartas[indice].pareja);
    mensaje.textContent = `${monumento.nombre} — ${monumento.barrio} — ${monumento.dato[idioma]}`;
    pintarMapa();
    if (partida.terminada) setTimeout(terminarNivel, 900);
  }
  if (resultado === "fallo") {
    mensaje.textContent = t("msg_fallo");
    setTimeout(() => {
      taparFallo(partida);
      pintarCartas();
    }, MS_FALLO);
  }
}

function alPulsarPista() {
  if (!jugando) return;
  const posiciones = usarPista(partida);
  posiciones.forEach((i) => {
    const boton = tablero.querySelector(`[data-indice="${i}"]`);
    boton.classList.add("pista");
    setTimeout(() => boton.classList.remove("pista"), MS_PISTA);
  });
  if (posiciones.length > 0) mensaje.textContent = t("msg_pista");
  pintarMarcadores();
}

// Nivel superado: se guardan progreso y métricas y se abre la ventana con el resumen
function terminarNivel() {
  if (!partida.terminada || !jugando) return; // por si se ha cambiado de nivel mientras tanto
  clearInterval(reloj);
  const numero = partida.nivel.numero;
  const estrellas = calcularEstrellas(partida);
  const puntos = calcularPuntos(partida);
  guardarProgreso(numero, puntos);
  guardarIntento(estrellas, puntos);
  pintarPestanas();

  const caja = crear("p", "estrellas-final", textoEstrellas(estrellas));
  caja.setAttribute("role", "img");
  caja.setAttribute("aria-label", t("estrellas_de", estrellas));
  const resumen = `${t("fallos")}: ${partida.fallos} · ${t("tiempo")}: ${formatoReloj(partida.segundos)} · ${t("puntos")}: ${puntos}`;
  const contenido = [caja, crear("p", "resumen", resumen)];

  const ultimo = numero === NIVELES.length;
  const repetir = { texto: t("repetir"), alPulsar: () => empezarNivel(numero) };
  let botones = [{ texto: t("siguiente"), alPulsar: () => empezarNivel(numero + 1) }, repetir];
  if (ultimo) {
    contenido.push(crear("p", "intro", t("final_texto")));
    botones = [
      { texto: t("ir_eixample"), alPulsar: () => location.assign("../Eixample/index.html") },
      { texto: t("volver"), alPulsar: () => empezarNivel(1) },
      repetir
    ];
  }
  const antetitulo = `${t("nivel_de", numero)} · ${t("nivel_" + numero)}`;
  abrirVentana(antetitulo, ultimo ? t("final_titulo") : t("ganar_titulo"), contenido, botones);
}

// ---------- Progreso y métricas ----------
// localStorage todavía no se ha dado en clase (se verá en 0612_07); aquí se usa lo mínimo.
// Los cuatro juegos comparten las claves cerda_progress y cerda_sessions, por eso se
// guardan como texto JSON: JSON.stringify para guardar y JSON.parse para leer.
// Además, cada nivel superado se envía al servidor con Cerda.enviar (de /js/sesion.js),
// que lo guarda en las tablas game_sessions y level_attempts.

function leerProgreso() {
  return JSON.parse(localStorage.getItem("cerda_progress")) || { games: {} };
}

function leerUltimoNivelSuperado() {
  const juego = leerProgreso().games[ID_JUEGO];
  return juego ? juego.last_level_completed : 0;
}

function guardarProgreso(numero, puntos) {
  const progreso = leerProgreso();
  const juego = progreso.games[ID_JUEGO] || { status: "unlocked", last_level_completed: 0, level_scores: {} };
  juego.last_level_completed = Math.max(juego.last_level_completed, numero);
  juego.level_scores[numero] = Math.max(juego.level_scores[numero] || 0, puntos);
  juego.best_score = NIVELES.reduce((suma, nivel) => suma + (juego.level_scores[nivel.numero] || 0), 0);
  if (juego.last_level_completed === NIVELES.length) {
    juego.status = "completed"; // abre el juego 2
    localStorage.setItem("juego1Superado", "true"); // aviso simple para la landing y el juego 2
  }
  progreso.games[ID_JUEGO] = juego;
  localStorage.setItem("cerda_progress", JSON.stringify(progreso));
}

// Métricas de esta visita. Comunes: username, session_id, date_time, session_length.
// Propias del Memory: attempts, errors_made, level_reached, level_time.
// El usuario y el session_id (UUID de esta visita) los da sesion.js, igual que en los otros juegos.
const inicioSesion = new Date(Cerda.inicioSesion("memory"));
const sesion = {
  game_id: ID_JUEGO,
  username: Cerda.usuario(),
  session_id: Cerda.sesionActual("memory"),
  date_time: inicioSesion.toISOString(),
  session_length: 0,
  level_reached: 1,
  final_score: 0,
  attempts_count: 0,
  attempts: [], // una fila por nivel superado (tabla level_attempts)
};

function guardarIntento(estrellas, puntos) {
  const numero = partida.nivel.numero;
  sesion.attempts.push({
    level: numero,
    level_time: partida.segundos,
    errors_made: partida.fallos,
    moves_count: partida.movimientos,
    help_clicks: partida.pistasUsadas,
    score: puntos,
    stars: estrellas,
    completed: true,
  });
  sesion.attempts_count = sesion.attempts.length;
  sesion.level_reached = Math.max(sesion.level_reached, Math.min(NIVELES.length, numero + 1));
  sesion.final_score += puntos;
  sesion.session_length = Math.round((new Date() - inicioSesion) / 1000);

  // Se cambia esta sesión en la lista (o se añade si es nueva) y se guardan las 50 últimas
  const sesiones = JSON.parse(localStorage.getItem("cerda_sessions")) || [];
  const otras = sesiones.filter((s) => s.session_id !== sesion.session_id);
  otras.push(sesion);
  localStorage.setItem("cerda_sessions", JSON.stringify(otras.slice(-50)));

  // Y se envía este nivel al servidor, con los nombres que espera /api/guardar-metricas
  Cerda.enviar({
    username: sesion.username,
    session_id: sesion.session_id,
    game: "memory",
    level: numero,
    date_time: sesion.date_time,
    session_length: sesion.session_length,
    level_time: partida.segundos,
    final_score: puntos,
    errors_made: partida.fallos,
    moves_count: partida.movimientos,
    help_clicks: partida.pistasUsadas,
    stars: estrellas,
    completed: true,
  });
}

// ---------- Arranque ----------

document.addEventListener("DOMContentLoaded", () => {
  if (!Object.hasOwn(TEXTOS, idioma)) {
    idioma = "ca";
  }
  selectorIdioma.value = idioma;
  selectorIdioma.addEventListener("change", () => {
    idioma = selectorIdioma.value;
    localStorage.setItem("cerda_lang", idioma);
    traducirPagina();
    empezarNivel(partida.nivel.numero);
  });
  document.getElementById("boton-pista").addEventListener("click", alPulsarPista);
  document.getElementById("boton-ayuda").addEventListener("click", mostrarInstrucciones);
  document.getElementById("boton-reiniciar").addEventListener("click", () => empezarNivel(partida.nivel.numero));
  traducirPagina();
  empezarNivel(Math.min(leerUltimoNivelSuperado() + 1, NIVELES.length));
});
