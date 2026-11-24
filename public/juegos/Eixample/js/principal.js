import { niveles } from "./niveles.js";
import { traducciones } from "./traducciones.js";
import { memorySuperado, leerProgreso, guardarProgreso } from "./progreso.js";
import {
    crearPartida,
    quedanPiezas,
    errorDeColocacion,
    colocarPieza,
    retirarPieza,
    comprobarPlano,
    calcularPuntuacion
} from "./juego.js";
import { crearTablero, crearPiezas, actualizarCasilla, actualizarPiezas, mostrarMensaje } from "./interfaz.js";

const FORMATO_PIEZA = "text/plain";

document.addEventListener("DOMContentLoaded", () => {
    const selectorIdioma = document.getElementById("selector-idioma");
    const etiquetas = document.querySelectorAll("[data-traduccio]");
    const idiomaCompartido = localStorage.getItem("cerda_lang");
    let textos = traducciones.ca;

    function traducirPagina(idioma) {
        if (!Object.prototype.hasOwnProperty.call(traducciones, idioma)) {
            idioma = "ca";
        }

        textos = traducciones[idioma];
        document.documentElement.lang = idioma;
        selectorIdioma.value = idioma;

        for (const etiqueta of etiquetas) {
            etiqueta.textContent = textos[etiqueta.dataset.traduccio];
        }
    }

    if (!memorySuperado()) {
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
    const indicadores = document.querySelectorAll("[data-nivell]");

    const guardado = leerProgreso();
    const progreso = {
        ...guardado,
        status: guardado.status ?? "unlocked",
        last_level_completed: guardado.last_level_completed ?? 0,
        level_scores: guardado.level_scores ?? {},
        partidas: guardado.partidas ?? {}
    };

    let nivel = niveles[0];
    let partida;
    let casillas = [];
    let botonesPieza = [];
    let modoRetirar = false;
    let aviso = null;
    let piezaArrastrada = null;
    let destinoArrastre = null;

    function buscarNivelDisponible(id) {
        for (const opcion of niveles) {
            if (opcion.id === id && id <= progreso.last_level_completed + 1) {
                return opcion;
            }
        }
        return null;
    }

    function recuperarPartida() {
        const guardada = progreso.partidas[nivel.id];
        const totalCasillas = nivel.filas * nivel.columnas;

        // Si canvia la mida del nivell, el tauler antic ja no hi encaixa.
        if (guardada && guardada.tablero.length === totalCasillas) {
            return guardada;
        }
        return crearPartida(nivel);
    }

    function guardarPartidaActual() {
        progreso.partidas[nivel.id] = partida;
        progreso.nivelActual = nivel.id;
        guardarProgreso(progreso);
    }

    function mostrarNiveles() {
        for (const indicador of indicadores) {
            const id = Number(indicador.dataset.nivell);
            let estado = "disponible";

            if (id <= progreso.last_level_completed) {
                estado = "completat";
            } else if (id > progreso.last_level_completed + 1) {
                estado = "bloquejat";
            } else if (id === nivel.id) {
                estado = "actiu";
            }

            indicador.disabled = estado === "bloquejat";
            indicador.dataset.estat = estado;
            indicador.textContent = textos.nivel(id, textos.estados[estado]);

            if (id === nivel.id) {
                indicador.setAttribute("aria-current", "step");
            } else {
                indicador.removeAttribute("aria-current");
            }
        }
    }

    function mostrarControles() {
        actualizarPiezas(botonesPieza, partida, textos);
        movimientos.textContent = String(partida.movimientos);
        ayudas.textContent = String(partida.ayudas);
        puntuacion.textContent = String(calcularPuntuacion(partida));

        botonAyuda.disabled = partida.completada;
        botonRetirar.disabled = partida.completada;
        botonComprobar.hidden = partida.completada;
        botonComprobar.disabled = partida.completada;
        botonSiguiente.hidden = !partida.completada || nivel.id === niveles.length;
        enlaceHistoria.hidden = progreso.last_level_completed < niveles.length;

        const colocando = partida.piezaSeleccionada !== null && !partida.completada;
        botonRetirar.setAttribute("aria-pressed", String(modoRetirar));
        tablero.classList.toggle("colocando", colocando && !modoRetirar);
        tablero.classList.toggle("retirando", modoRetirar);
    }

    function mostrarCasilla(posicion) {
        actualizarCasilla(casillas[posicion], partida.tablero[posicion], partida.completada, textos);
    }

    function mostrarPartida() {
        const textosNivel = textos.niveles[nivel.id];
        tituloNivel.textContent = textos.nivel(nivel.id, textosNivel.titulo);
        descripcion.textContent = textosNivel.descripcion;

        for (let posicion = 0; posicion < casillas.length; posicion++) {
            mostrarCasilla(posicion);
        }
        mostrarControles();
        mostrarNiveles();
    }

    function actualizarAviso() {
        if (aviso === null) {
            return;
        }

        const textosNivel = textos.niveles[nivel.id];
        const traduccion = textosNivel[aviso.clave] ?? textos.avisos[aviso.clave];
        let texto = traduccion;

        if (aviso.tipo !== null) {
            const nombrePieza = textos.piezas[aviso.tipo];
            texto = traduccion(nombrePieza);
        }

        mostrarMensaje(mensaje, texto, aviso.estado);
    }

    function mostrarAviso(clave, estado = "informacio", tipo = null) {
        aviso = { clave, estado, tipo };
        actualizarAviso();
    }

    function abrirNivel(id) {
        const elegido = buscarNivelDisponible(id);
        if (elegido === null) {
            return;
        }

        terminarArrastre();
        if (elegido !== nivel || partida === undefined) {
            nivel = elegido;
            partida = recuperarPartida();
            casillas = crearTablero(tablero, nivel);
            botonesPieza = crearPiezas(piezas, nivel.inventario);
            modoRetirar = false;
            prepararArrastre();
        }

        introduccion.hidden = true;
        zonaJuego.hidden = false;
        guardarPartidaActual();
        mostrarPartida();

        if (partida.completada) {
            mostrarAviso("victoria", "correcte");
        } else {
            mostrarAviso("inicio");
        }
        zonaJuego.focus();
    }

    function reiniciarPartida() {
        terminarArrastre();
        partida = crearPartida(nivel);
        modoRetirar = false;
        guardarPartidaActual();
        mostrarPartida();
        mostrarAviso("inicio");
    }

    function seleccionarTipo(tipo) {
        if (!quedanPiezas(partida, tipo)) {
            mostrarAviso("agotada", "error");
            return;
        }

        partida.piezaSeleccionada = tipo;
        modoRetirar = false;
        guardarPartidaActual();
        mostrarControles();
        mostrarAviso("seleccionada", "informacio", tipo);
    }

    function intentarRetirar(posicion) {
        modoRetirar = false;
        if (retirarPieza(partida, posicion)) {
            guardarPartidaActual();
            mostrarCasilla(posicion);
            mostrarAviso("retirada", "correcte");
        } else {
            mostrarAviso("vacia", "error");
        }
        mostrarControles();
    }

    function intentarColocar(posicion, tipo) {
        if (tipo === null) {
            mostrarAviso("sinSeleccion", "error");
            return;
        }

        const error = colocarPieza(partida, nivel, posicion, tipo);
        if (error !== null) {
            mostrarAviso(error, "error");
            return;
        }

        modoRetirar = false;
        guardarPartidaActual();
        mostrarCasilla(posicion);
        mostrarControles();

        if (partida.tablero.includes(null)) {
            mostrarAviso("colocada", "correcte");
        } else {
            mostrarAviso("listoParaComprobar", "correcte");
        }
    }

    function prepararArrastre() {
        for (const boton of botonesPieza) {
            boton.addEventListener("dragstart", iniciarArrastre);
            boton.addEventListener("dragend", terminarArrastre);
        }
        for (const casilla of casillas) {
            casilla.addEventListener("dragover", resaltarDestino);
            casilla.addEventListener("dragleave", salirDelDestino);
            casilla.addEventListener("drop", soltarPieza);
        }
    }

    function iniciarArrastre(event) {
        const boton = event.currentTarget;
        const tipo = boton.dataset.peca;
        if (partida.completada || !quedanPiezas(partida, tipo)) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.setData(FORMATO_PIEZA, tipo);
        event.dataTransfer.effectAllowed = "move";
        piezaArrastrada = boton;
        boton.classList.add("arrastrando");
    }

    function resaltarDestino(event) {
        if (piezaArrastrada === null) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const casilla = event.currentTarget;
        if (casilla !== destinoArrastre) {
            quitarResaltado();
            destinoArrastre = casilla;
        }

        // Durant dragover el navegador encara no deixa llegir el contingut de dataTransfer.
        const tipo = piezaArrastrada.dataset.peca;
        const posicion = Number(casilla.dataset.posicio);
        const esValida = errorDeColocacion(partida, nivel, posicion, tipo) === null;
        casilla.classList.toggle("destino-valido", esValida);
        casilla.classList.toggle("destino-invalido", !esValida);
    }

    function salirDelDestino(event) {
        const casilla = event.currentTarget;
        if (casilla === destinoArrastre && !casilla.contains(event.relatedTarget)) {
            quitarResaltado();
        }
    }

    function quitarResaltado() {
        if (destinoArrastre !== null) {
            destinoArrastre.classList.remove("destino-valido", "destino-invalido");
            destinoArrastre = null;
        }
    }

    function terminarArrastre() {
        quitarResaltado();
        if (piezaArrastrada !== null) {
            piezaArrastrada.classList.remove("arrastrando");
            piezaArrastrada = null;
        }
    }

    function soltarPieza(event) {
        if (piezaArrastrada === null) {
            return;
        }

        event.preventDefault();
        const tipo = event.dataTransfer.getData(FORMATO_PIEZA);
        const posicion = Number(event.currentTarget.dataset.posicio);
        terminarArrastre();

        if (!isNaN(posicion)) {
            intentarColocar(posicion, tipo);
        }
    }

    function comprobarPartida() {
        const error = comprobarPlano(partida, nivel);
        if (error !== null) {
            mostrarAviso(error, "error");
            mensaje.focus();
            return;
        }

        partida.completada = true;
        terminarArrastre();
        modoRetirar = false;
        progreso.last_level_completed = Math.max(progreso.last_level_completed, nivel.id);
        const puntuacionAnterior = progreso.level_scores[nivel.id] ?? 0;
        const puntuacionActual = calcularPuntuacion(partida);
        progreso.level_scores[nivel.id] = Math.max(puntuacionAnterior, puntuacionActual);

        let puntuacionTotal = 0;
        for (const opcion of niveles) {
            puntuacionTotal += progreso.level_scores[opcion.id] ?? 0;
        }
        progreso.best_score = puntuacionTotal;

        if (progreso.last_level_completed === niveles.length) {
            progreso.status = "completed";
        }
        guardarPartidaActual();
        mostrarPartida();
        mostrarAviso("victoria", "correcte");
        mensaje.focus();
    }

    selectorIdioma.addEventListener("change", () => {
        traducirPagina(selectorIdioma.value);
        localStorage.setItem("cerda_lang", selectorIdioma.value);
        progreso.idioma = selectorIdioma.value;
        guardarProgreso(progreso);

        if (partida === undefined) {
            mostrarNiveles();
        } else {
            mostrarPartida();
            actualizarAviso();
        }
    });

    botonEmpezar.addEventListener("click", () => abrirNivel(nivel.id));
    botonSiguiente.addEventListener("click", () => abrirNivel(nivel.id + 1));
    botonReiniciar.addEventListener("click", reiniciarPartida);
    botonComprobar.addEventListener("click", comprobarPartida);

    for (const indicador of indicadores) {
        indicador.addEventListener("click", event => {
            const id = Number(event.currentTarget.dataset.nivell);
            if (!isNaN(id)) {
                abrirNivel(id);
            }
        });
    }

    piezas.addEventListener("click", event => {
        const boton = event.target.closest("button[data-peca]");
        if (boton !== null && !partida.completada) {
            seleccionarTipo(boton.dataset.peca);
        }
    });

    tablero.addEventListener("click", event => {
        const casilla = event.target.closest("button[data-posicio]");
        if (casilla === null || partida.completada) {
            return;
        }

        const posicion = Number(casilla.dataset.posicio);
        if (isNaN(posicion)) {
            return;
        }
        if (modoRetirar) {
            intentarRetirar(posicion);
        } else {
            intentarColocar(posicion, partida.piezaSeleccionada);
        }
    });

    botonRetirar.addEventListener("click", () => {
        modoRetirar = !modoRetirar;
        mostrarControles();

        if (modoRetirar) {
            mostrarAviso("retirar");
        } else {
            mostrarAviso("cancelarRetirada");
        }
    });

    botonAyuda.addEventListener("click", () => {
        partida.ayudas++;
        guardarPartidaActual();
        mostrarControles();
        mostrarAviso("pista");
    });

    nivel = buscarNivelDisponible(guardado.nivelActual) ?? niveles[0];
    traducirPagina(idiomaCompartido ?? guardado.idioma ?? "ca");
    document.getElementById("progreso-niveles").hidden = false;

    // Si hi ha un tauler desat, reprenem el nivell directament.
    if (progreso.partidas[nivel.id]) {
        abrirNivel(nivel.id);
    } else {
        mostrarNiveles();
        introduccion.hidden = false;
    }
});
