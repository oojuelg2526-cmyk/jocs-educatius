import { niveles } from "./niveles.js";
import { traducciones } from "./traducciones.js";
import { leerProgreso, guardarProgreso } from "./progreso.js";
import {
    crearPartida,
    seleccionarPieza,
    colocarPieza,
    retirarPieza,
    comprobarPlano,
    usarPista,
    calcularPuntuacion
} from "./juego.js";
import {
    crearTablero,
    crearPiezas,
    actualizarTablero,
    actualizarPiezas,
    mostrarMensaje
} from "./interfaz.js";

document.addEventListener("DOMContentLoaded", () => {
    const selectorIdioma = document.getElementById("selector-idioma");
    const etiquetas = document.querySelectorAll("[data-traduccio]");
    let textos = traducciones.ca;

    function traducirPagina(valor) {
        const idioma = Object.hasOwn(traducciones, valor) ? valor : "ca";
        textos = traducciones[idioma];
        document.documentElement.lang = idioma;
        selectorIdioma.value = idioma;

        for (const etiqueta of etiquetas) {
            etiqueta.textContent = textos[etiqueta.dataset.traduccio];
        }
    }

    const idiomaCompartido = localStorage.getItem("cerda_lang");
    if (ultimoJuegoSuperado() < 1) {
        traducirPagina(idiomaCompartido);
        document.getElementById("bloqueo").hidden = false;
        selectorIdioma.addEventListener("change", () => {
            traducirPagina(selectorIdioma.value);
            localStorage.setItem("cerda_lang", selectorIdioma.value);
        });
        return;
    }

    const introduccion = document.getElementById("introduccion");
    const zonaJuego = document.getElementById("zona-juego");
    const tituloNivel = document.getElementById("titulo-nivel");
    const descripcion = document.getElementById("descripcion-nivel");
    const tablero = document.getElementById("tablero");
    const piezas = document.getElementById("piezas");
    const mensaje = document.getElementById("mensaje");
    const movimientos = document.getElementById("movimientos");
    const ayudas = document.getElementById("ayudas");
    const puntuacion = document.getElementById("puntuacion");
    const botonEmpezar = document.getElementById("boton-empezar");
    const botonAyuda = document.getElementById("boton-ayuda");
    const botonComprobar = document.getElementById("boton-comprobar");
    const botonRetirar = document.getElementById("boton-retirar");
    const botonReiniciar = document.getElementById("boton-reiniciar");
    const botonSiguiente = document.getElementById("boton-siguiente");
    const enlaceHistoria = document.getElementById("enlace-historia");
    const indicadores = document.querySelectorAll(".nivel[data-nivell]");

    const guardado = leerProgreso();
    const progreso = {
        ...guardado,
        status: guardado.status ?? "unlocked",
        last_level_completed: guardado.last_level_completed ?? 0,
        level_scores: guardado.level_scores ?? {},
        partidas: guardado.partidas ?? {}
    };
    let nivel = niveles.find(opcion => opcion.id === guardado.nivelActual
        && opcion.id <= progreso.last_level_completed + 1) ?? niveles[0];
    let partida = recuperarPartida();
    let casillas = crearTablero(tablero, nivel);
    let botonesPieza = crearPiezas(piezas, nivel.inventario);
    let modoRetirar = false;
    let aviso = null;

    // Métricas del nivel que se está jugando. Se envían al servidor al superarlo.
    // El usuario y la sesión de la visita vienen de /js/sesion.js (objeto Cerda).
    Cerda.sesionActual("eixample");
    let inicioNivel = null;
    let erroresNivel = 0;

    function recuperarPartida() {
        const guardada = progreso.partidas[nivel.id];
        const compatible = Array.isArray(guardada?.tablero) && guardada.inventarioRestante
            && guardada.tablero.length === nivel.filas * nivel.columnas;
        return compatible ? guardada : crearPartida(nivel);
    }

    function actualizarProgreso() {
        for (const indicador of indicadores) {
            const id = Number(indicador.dataset.nivell);
            const actual = id === nivel.id;
            let estado = actual ? "actiu" : "disponible";

            if (id <= progreso.last_level_completed) {
                estado = "completat";
            } else if (id > progreso.last_level_completed + 1) {
                estado = "bloquejat";
            }

            indicador.disabled = estado === "bloquejat";
            indicador.dataset.estat = estado;
            indicador.textContent = textos.nivel(id, textos.estados[estado]);

            if (actual) {
                indicador.setAttribute("aria-current", "step");
            } else {
                indicador.removeAttribute("aria-current");
            }
        }
    }

    function actualizarInterfaz() {
        const textosNivel = textos.niveles[nivel.id];
        tituloNivel.textContent = textos.nivel(nivel.id, textosNivel.titulo);
        descripcion.textContent = textosNivel.descripcion;

        actualizarTablero(casillas, partida.tablero, partida.completada, textos);
        actualizarPiezas(botonesPieza, partida, partida.completada, textos);
        movimientos.textContent = String(partida.movimientos);
        ayudas.textContent = String(partida.ayudas);
        puntuacion.textContent = String(calcularPuntuacion(partida));
        botonAyuda.disabled = partida.completada;
        botonComprobar.disabled = partida.completada;
        botonComprobar.hidden = partida.completada;
        botonRetirar.disabled = partida.completada;
        botonRetirar.setAttribute("aria-pressed", String(modoRetirar));
        botonSiguiente.hidden = !partida.completada || nivel.id === niveles.length;
        enlaceHistoria.hidden = progreso.last_level_completed < niveles.length;

        const colocando = partida.piezaSeleccionada !== null && !partida.completada;
        tablero.classList.toggle("colocando", colocando && !modoRetirar);
        tablero.classList.toggle("retirando", modoRetirar);
        actualizarProgreso();
    }

    function empezarMetricas() {
        inicioNivel = Date.now();
        erroresNivel = 0;
    }

    // Puntuación: la del juego (calcularPuntuacion). No hay estrellas, así que no se envían.
    function enviarMetricas() {
        Cerda.enviar({
            username: Cerda.usuario(),
            session_id: Cerda.sesionActual("eixample"),
            game: "eixample",
            level: nivel.id,
            date_time: new Date().toISOString(),
            session_length: Cerda.segundosDeSesion("eixample"),
            level_time: Math.round((Date.now() - inicioNivel) / 1000),
            final_score: calcularPuntuacion(partida),
            errors_made: erroresNivel,
            moves_count: partida.movimientos,
            help_clicks: partida.ayudas,
            completed: true
        });
    }

    function registrarPartida() {
        progreso.partidas[nivel.id] = partida;
        progreso.nivelActual = nivel.id;
        guardarProgreso(progreso);
        actualizarInterfaz();
    }

    function actualizarAviso() {
        if (aviso === null) {
            return;
        }

        const traduccion = textos.niveles[nivel.id][aviso.clave] ?? textos.avisos[aviso.clave];
        const texto = aviso.tipo === null ? traduccion : traduccion(textos.piezas[aviso.tipo]);
        mostrarMensaje(mensaje, texto, aviso.estado);
    }

    function mostrarAviso(clave, estado = "informacio", tipo = null) {
        aviso = { clave, estado, tipo };
        actualizarAviso();
    }

    function aplicarIdioma(valor) {
        traducirPagina(valor);
        actualizarInterfaz();
        actualizarAviso();
    }

    function abrirNivel(id) {
        const elegido = niveles.find(opcion => opcion.id === id);
        if (!elegido || id > progreso.last_level_completed + 1) {
            return;
        }

        if (elegido !== nivel) {
            nivel = elegido;
            partida = recuperarPartida();
            casillas = crearTablero(tablero, nivel);
            botonesPieza = crearPiezas(piezas, nivel.inventario);
            modoRetirar = false;
            empezarMetricas();
        }
        if (inicioNivel === null) {
            empezarMetricas();
        }

        introduccion.hidden = true;
        zonaJuego.hidden = false;
        registrarPartida();
        mostrarAviso(partida.completada ? "victoria" : "inicio", partida.completada ? "correcte" : "informacio");
        zonaJuego.focus();
    }

    function reiniciarPartida() {
        partida = crearPartida(nivel);
        modoRetirar = false;
        empezarMetricas();
        registrarPartida();
        mostrarAviso("inicio");
    }

    function jugarCasilla(posicion) {
        if (modoRetirar) {
            const retirada = retirarPieza(partida, posicion);
            modoRetirar = false;
            registrarPartida();
            mostrarAviso(retirada ? "retirada" : "vacia", retirada ? "correcte" : "error");
            return;
        }

        if (partida.piezaSeleccionada === null) {
            mostrarAviso("sinSeleccion", "error");
            return;
        }

        if (!colocarPieza(partida, posicion)) {
            mostrarAviso("ocupada", "error");
            return;
        }

        registrarPartida();
        mostrarAviso(partida.tablero.includes(null) ? "colocada" : "listoParaComprobar", "correcte");
    }

    function comprobarPartida() {
        const error = comprobarPlano(partida, nivel);
        if (error !== null) {
            erroresNivel++; // un plano comprobado con algún error
            mostrarAviso(error, "error");
            mensaje.focus();
            return;
        }

        partida.completada = true;
        progreso.last_level_completed = Math.max(progreso.last_level_completed, nivel.id);
        progreso.level_scores[nivel.id] = Math.max(progreso.level_scores[nivel.id] ?? 0, calcularPuntuacion(partida));
        progreso.best_score = niveles.reduce((total, opcion) => total + (progreso.level_scores[opcion.id] ?? 0), 0);
        progreso.status = progreso.last_level_completed === niveles.length ? "completed" : "unlocked";
        registrarPartida();
        enviarMetricas();
        mostrarAviso("victoria", "correcte");
        mensaje.focus();
    }

    selectorIdioma.addEventListener("change", event => {
        aplicarIdioma(event.currentTarget.value);
        localStorage.setItem("cerda_lang", selectorIdioma.value);
        progreso.idioma = selectorIdioma.value;
        guardarProgreso(progreso);
    });

    botonEmpezar.addEventListener("click", () => abrirNivel(nivel.id));
    botonSiguiente.addEventListener("click", () => abrirNivel(nivel.id + 1));
    botonReiniciar.addEventListener("click", reiniciarPartida);
    botonComprobar.addEventListener("click", comprobarPartida);

    for (const indicador of indicadores) {
        indicador.addEventListener("click", event => abrirNivel(Number(event.currentTarget.dataset.nivell)));
    }

    piezas.addEventListener("click", event => {
        const boton = event.target.closest("button[data-peca]");
        if (boton === null || partida.completada) {
            return;
        }

        const tipo = boton.dataset.peca;
        if (!seleccionarPieza(partida, tipo)) {
            mostrarAviso("agotada", "error");
            return;
        }

        modoRetirar = false;
        registrarPartida();
        mostrarAviso("seleccionada", "informacio", tipo);
    });

    tablero.addEventListener("click", event => {
        const casilla = event.target.closest("button[data-posicio]");
        if (casilla === null || partida.completada) {
            return;
        }

        const posicion = Number(casilla.dataset.posicio);
        if (!isNaN(posicion)) {
            jugarCasilla(posicion);
        }
    });

    botonRetirar.addEventListener("click", () => {
        modoRetirar = !modoRetirar;
        actualizarInterfaz();
        mostrarAviso(modoRetirar ? "retirar" : "cancelarRetirada");
    });

    botonAyuda.addEventListener("click", () => {
        usarPista(partida);
        registrarPartida();
        mostrarAviso("pista");
    });

    aplicarIdioma(idiomaCompartido ?? guardado.idioma ?? "ca");
    document.getElementById("progreso-niveles").hidden = false;
    if (progreso.partidas[nivel.id] === partida) {
        abrirNivel(nivel.id);
    } else {
        introduccion.hidden = false;
    }
});
