import { traducciones } from "./traducciones.js";
import { memorySuperado, leerProgreso, guardarProgreso, registrarVictoria } from "./progreso.js";
import { niveles, crearPartida, quedanPiezas, errorDeColocacion, colocarPieza,
    retirarPieza, comprobarPlano, calcularPuntuacion } from "./juego.js";
import { crearTablero, crearPiezas, actualizarCasilla, actualizarPiezas } from "./interfaz.js";

const FORMATO_PIEZA = "text/plain";

document.addEventListener("DOMContentLoaded", () => {
    const selectorIdioma = document.getElementById("selector-idioma");
    const etiquetas = document.querySelectorAll("[data-traduccio]");
    const indicadores = document.querySelectorAll("[data-nivell]");
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
    const botonAyuda = document.getElementById("boton-ayuda");
    const botonComprobar = document.getElementById("boton-comprobar");
    const botonRetirar = document.getElementById("boton-retirar");
    const botonSiguiente = document.getElementById("boton-siguiente");
    const enlaceHistoria = document.getElementById("enlace-historia");

    const desbloqueado = memorySuperado();
    const progreso = leerProgreso();
    let nivel = nivelDisponible(progreso.nivelActual) ?? niveles[0];
    let partida = null;
    let textos = traducciones.ca;
    let aviso = null;
    let modoRetirar = false;
    let piezaArrastrada = null;
    let destinoArrastre = null;

    function nivelDisponible(id) {
        const elegido = niveles[id - 1];
        if (elegido && elegido.id === id && id <= progreso.last_level_completed + 1) {
            return elegido;
        }
        return null;
    }

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

    function mostrarNiveles() {
        for (const indicador of indicadores) {
            const id = Number(indicador.dataset.nivell);
            let estado = "disponible";

            if (id <= progreso.last_level_completed) {
                estado = "completat";
            } else if (!nivelDisponible(id)) {
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
        actualizarPiezas(piezas.children, partida, textos);
        movimientos.textContent = String(partida.movimientos);
        ayudas.textContent = String(partida.ayudas);
        puntuacion.textContent = String(calcularPuntuacion(partida));
        botonAyuda.disabled = partida.completada;
        botonRetirar.disabled = partida.completada;
        botonRetirar.setAttribute("aria-pressed", String(modoRetirar));
        botonComprobar.hidden = partida.completada;
        botonSiguiente.hidden = !partida.completada || nivel.id === niveles.length;
        enlaceHistoria.hidden = progreso.last_level_completed < niveles.length;
        const colocando = partida.piezaSeleccionada !== null && !partida.completada;
        tablero.classList.toggle("colocando", colocando && !modoRetirar);
        tablero.classList.toggle("retirando", modoRetirar);
    }

    function mostrarPartida() {
        const textosNivel = textos.niveles[nivel.id];
        tituloNivel.textContent = textos.nivel(nivel.id, textosNivel.titulo);
        descripcion.textContent = textosNivel.descripcion;
        for (const casilla of tablero.children) {
            actualizarCasilla(casilla, partida, textos);
        }
        mostrarControles();
        mostrarNiveles();
    }

    // Guardem la clau de l'avís per traduir-lo també durant la partida.
    function mostrarAviso(clave, estado = "informacio", tipo = null) {
        aviso = { clave, estado, tipo };
        const traduccion = textos.niveles[nivel.id][clave] ?? textos.avisos[clave];
        mensaje.dataset.estat = estado;
        mensaje.textContent = tipo === null ? traduccion : traduccion(textos.piezas[tipo]);
    }

    function guardarPartida() {
        progreso.partidas[nivel.id] = partida;
        progreso.nivelActual = nivel.id;
        guardarProgreso(progreso);
    }

    function abrirNivel(id) {
        const elegido = nivelDisponible(id);
        if (elegido === null) {
            return;
        }
        terminarArrastre();
        if (elegido !== nivel || partida === null) {
            nivel = elegido;
            const guardada = progreso.partidas[id];
            partida = guardada ?? crearPartida(nivel);
            // Si el tauler desat té una altra mida, comencem amb el tauler actual.
            if (partida.tablero.length !== nivel.lado * nivel.lado) {
                partida = crearPartida(nivel);
            }
            crearTablero(tablero, nivel.lado);
            crearPiezas(piezas, nivel.inventario);
            modoRetirar = false;
        }
        introduccion.hidden = true;
        zonaJuego.hidden = false;
        guardarPartida();
        mostrarPartida();
        if (partida.completada) {
            mostrarAviso("victoria", "correcte");
        } else {
            mostrarAviso("inicio");
        }
        zonaJuego.focus();
    }

    // Quan es mou una peça, només repintem la casella que ha canviat.
    function guardarMovimiento(casilla) {
        guardarPartida();
        actualizarCasilla(casilla, partida, textos);
        mostrarControles();
    }

    function intentarColocar(casilla, tipo) {
        if (tipo === null) {
            mostrarAviso("sinSeleccion", "error");
            return;
        }
        const posicion = Number(casilla.dataset.posicio);
        const error = colocarPieza(partida, nivel, posicion, tipo);
        if (error !== null) {
            mostrarAviso(error, "error");
            return;
        }
        modoRetirar = false;
        guardarMovimiento(casilla);
        const clave = partida.tablero.includes(null) ? "colocada" : "listoParaComprobar";
        mostrarAviso(clave, "correcte");
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

    const idiomaGuardado = desbloqueado ? progreso.idioma : "ca";
    traducirPagina(localStorage.getItem("cerda_lang") ?? idiomaGuardado);
    selectorIdioma.addEventListener("change", () => {
        traducirPagina(selectorIdioma.value);
        localStorage.setItem("cerda_lang", selectorIdioma.value);
        if (!desbloqueado) {
            return;
        }
        progreso.idioma = selectorIdioma.value;
        guardarProgreso(progreso);
        if (partida === null) {
            mostrarNiveles();
        } else {
            mostrarPartida();
            mostrarAviso(aviso.clave, aviso.estado, aviso.tipo);
        }
    });

    if (!desbloqueado) {
        document.getElementById("bloqueo").hidden = false;
        return;
    }

    document.getElementById("boton-empezar").addEventListener("click", () => abrirNivel(nivel.id));
    botonSiguiente.addEventListener("click", () => abrirNivel(nivel.id + 1));
    for (const indicador of indicadores) {
        indicador.addEventListener("click", () => abrirNivel(Number(indicador.dataset.nivell)));
    }

    piezas.addEventListener("click", event => {
        const boton = event.target.closest(".boton-pieza");
        if (!boton || partida.completada) {
            return;
        }
        const tipo = boton.dataset.peca;
        if (!quedanPiezas(partida, tipo)) {
            mostrarAviso("agotada", "error");
            return;
        }
        partida.piezaSeleccionada = tipo;
        modoRetirar = false;
        guardarPartida();
        mostrarControles();
        mostrarAviso("seleccionada", "informacio", tipo);
    });

    tablero.addEventListener("click", event => {
        const casilla = event.target.closest(".casilla");
        if (!casilla || partida.completada) {
            return;
        }
        if (!modoRetirar) {
            intentarColocar(casilla, partida.piezaSeleccionada);
            return;
        }

        modoRetirar = false;
        if (retirarPieza(partida, Number(casilla.dataset.posicio))) {
            guardarMovimiento(casilla);
            mostrarAviso("retirada", "correcte");
        } else {
            mostrarControles();
            mostrarAviso("vacia", "error");
        }
    });

    // Els contenidors escolten els events dels botons, també quan canviem de nivell.
    piezas.addEventListener("dragstart", event => {
        const boton = event.target.closest(".boton-pieza");
        if (!boton || !boton.draggable) {
            event.preventDefault();
            return;
        }
        piezaArrastrada = boton;
        boton.classList.add("arrastrando");
        event.dataTransfer.setData(FORMATO_PIEZA, boton.dataset.peca);
        event.dataTransfer.effectAllowed = "move";
    });
    piezas.addEventListener("dragend", terminarArrastre);

    tablero.addEventListener("dragover", event => {
        const casilla = event.target.closest(".casilla");
        if (!piezaArrastrada || !casilla) {
            return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (casilla !== destinoArrastre) {
            quitarResaltado();
            destinoArrastre = casilla;
        }
        // El tipus es llegeix del botó fins que es pot accedir a dataTransfer a drop.
        const tipo = piezaArrastrada.dataset.peca;
        const posicion = Number(casilla.dataset.posicio);
        const valida = errorDeColocacion(partida, nivel, posicion, tipo) === null;
        casilla.classList.toggle("destino-valido", valida);
        casilla.classList.toggle("destino-invalido", !valida);
    });

    tablero.addEventListener("dragleave", event => {
        const casilla = event.target.closest(".casilla");
        if (casilla && casilla === destinoArrastre && !casilla.contains(event.relatedTarget)) {
            quitarResaltado();
        }
    });

    tablero.addEventListener("drop", event => {
        const casilla = event.target.closest(".casilla");
        if (piezaArrastrada && casilla) {
            event.preventDefault();
            const tipo = event.dataTransfer.getData(FORMATO_PIEZA);
            terminarArrastre();
            intentarColocar(casilla, tipo);
        }
    });

    botonRetirar.addEventListener("click", () => {
        modoRetirar = !modoRetirar;
        mostrarControles();
        mostrarAviso(modoRetirar ? "retirar" : "cancelarRetirada");
    });
    botonAyuda.addEventListener("click", () => {
        partida.ayudas++;
        guardarPartida();
        mostrarControles();
        mostrarAviso("pista");
    });
    document.getElementById("boton-reiniciar").addEventListener("click", () => {
        terminarArrastre();
        modoRetirar = false;
        partida = crearPartida(nivel);
        guardarPartida();
        mostrarPartida();
        mostrarAviso("inicio");
    });

    botonComprobar.addEventListener("click", () => {
        const error = comprobarPlano(partida, nivel);
        if (error !== null) {
            mostrarAviso(error, "error");
        } else {
            terminarArrastre();
            modoRetirar = false;
            partida.completada = true;
            registrarVictoria(progreso, nivel.id, calcularPuntuacion(partida));
            guardarPartida();
            mostrarPartida();
            mostrarAviso("victoria", "correcte");
        }
        mensaje.focus();
    });

    document.getElementById("progreso-niveles").hidden = false;
    if (progreso.partidas[nivel.id]) {
        abrirNivel(nivel.id);
    } else {
        mostrarNiveles();
        introduccion.hidden = false;
    }
});
