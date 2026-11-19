
/*
    ARCHIVO PRINCIPAL

    Conecta la lógica del juego con la interfaz
    y controla los eventos de los botones.
*/

import { niveles } from "./niveles.js";

import {
    crearPartida,
    seleccionarPieza,
    colocarPieza,
    retirarPieza,
    comprobarSolucion,
    usarPista,
    calcularPuntuacion
} from "./juego.js";

import {
    mostrarTablero,
    mostrarPiezas,
    actualizarEstadisticas,
    mostrarInformacionNivel,
    mostrarMensaje,
    mostrarProgreso
} from "./interfaz.js";


// VARIABLES DE LA PARTIDA

let numeroNivel = 0;
let partida;
let modoRetirar = false;


// ELEMENTOS HTML

const introduccion = document.getElementById("introduccion");
const zonaJuego = document.getElementById("zona-juego");

const botonEmpezar = document.getElementById("boton-empezar");
const botonAyuda = document.getElementById("boton-ayuda");
const botonRetirar = document.getElementById("boton-retirar");
const botonReiniciar = document.getElementById("boton-reiniciar");


// INICIAR UN NIVEL

function iniciarNivel() {

    const nivel = niveles[numeroNivel];

    // Creamos una partida nueva.
    partida = crearPartida(nivel);

    modoRetirar = false;

    // Mostramos la información del nivel.
    mostrarInformacionNivel(nivel);

    // Mostramos el tablero y las piezas.
    actualizarInterfaz();

    // Mostramos el progreso.
    mostrarProgreso(numeroNivel + 1, niveles);

    mostrarMensaje("Selecciona una pieza para comenzar.");
}


// ACTUALIZAR LA INTERFAZ

function actualizarInterfaz() {

    const nivel = niveles[numeroNivel];

    mostrarTablero(nivel, partida, pulsarCasilla);

    mostrarPiezas(partida, elegirPieza);

    actualizarEstadisticas(
        partida,
        calcularPuntuacion(partida)
    );
}


// COMENZAR EL JUEGO

botonEmpezar.addEventListener("click", function () {

    introduccion.hidden = true;
    zonaJuego.hidden = false;

    iniciarNivel();

});


// SELECCIONAR UNA PIEZA

function elegirPieza(tipo) {

    modoRetirar = false;

    const seleccionCorrecta = seleccionarPieza(partida, tipo);

    if (seleccionCorrecta) {

        mostrarMensaje("Has seleccionado: " + tipo);

    } else {

        mostrarMensaje("No quedan piezas de este tipo.");

    }

    actualizarInterfaz();
}


// PULSAR UNA CASILLA DEL TABLERO

function pulsarCasilla(posicion) {

    // Si estamos en modo retirar, quitamos la pieza.
    if (modoRetirar) {

        const retiradaCorrecta = retirarPieza(partida, posicion);

        if (retiradaCorrecta) {

            mostrarMensaje("Has retirado la pieza.");

        } else {

            mostrarMensaje("Esta casilla está vacía.");

        }

        modoRetirar = false;

        actualizarInterfaz();

        return;
    }


    // Si no estamos en modo retirar, colocamos una pieza.
    const colocacionCorrecta = colocarPieza(partida, posicion);

    if (colocacionCorrecta) {

        mostrarMensaje("Pieza colocada correctamente.");

        actualizarInterfaz();

        // Comprobamos si hemos terminado el nivel.
        if (comprobarSolucion(partida, niveles[numeroNivel])) {

            completarNivel();
        }

    } else {

        mostrarMensaje("No puedes colocar la pieza en esa casilla.");

    }
}


// RETIRAR PIEZAS

botonRetirar.addEventListener("click", function () {

    modoRetirar = true;

    mostrarMensaje("Selecciona una casilla para retirar su pieza.");

});


// UTILIZAR UNA PISTA

botonAyuda.addEventListener("click", function () {

    const numeroAyudas = usarPista(partida);

    const pista = niveles[numeroNivel].pista;

    mostrarMensaje(pista);

    actualizarInterfaz();

    console.log("Ayudas utilizadas:", numeroAyudas);

});


// REINICIAR EL NIVEL

botonReiniciar.addEventListener("click", function () {

    const confirmar = confirm("¿Quieres reiniciar este nivel?");

    if (confirmar) {

        iniciarNivel();

        mostrarMensaje("Has reiniciado el nivel.");

    }

});


// COMPLETAR UN NIVEL

function completarNivel() {

    const puntuacion = calcularPuntuacion(partida);

    console.log("Nivel completado:", numeroNivel + 1);
    console.log("Puntuación:", puntuacion);

    // Comprobamos si quedan más niveles.
    if (numeroNivel < niveles.length - 1) {

        const continuar = confirm(
            "¡Has completado el nivel " + (numeroNivel + 1) +
            "!\nTu puntuación es: " + puntuacion +
            "\n\n¿Quieres continuar con el siguiente nivel?"
        );

        if (continuar) {

            numeroNivel++;

            iniciarNivel();

        } else {

            mostrarMensaje("Nivel completado. Puedes continuar cuando quieras.");

        }

    } else {

        // Se han completado los tres niveles.
        mostrarMensaje("¡Has reconstruido todas las manzanas!");

        alert(
            "¡ENHORABUENA!\n\n" +
            "Has completado la reconstrucción del Eixample.\n\n" +
            "Al abrir el compartimento secreto encuentras los manuscritos " +
            "perdidos de Cerdà.\n\n" +
            "Has conseguido la segunda pieza del plano: LAS MANZANAS.\n\n" +
            "Ahora los manuscritos deben llegar al archivo histórico."
        );

        console.log("Juego 2 completado.");
    }

}


// MOSTRAR EL PROGRESO INICIAL

mostrarProgreso(1, niveles);
