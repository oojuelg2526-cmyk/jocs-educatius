
/*
    INTERFAZ DEL JUEGO

    Este archivo se encarga de mostrar los elementos
    del juego y actualizar la página.
*/


// NOMBRES Y SIMBOLOS DE LAS PIEZAS

const nombresPiezas = {
    vivienda: "Vivienda",
    parque: "Parque",
    equipamiento: "Equipamiento"
};

const simbolosPiezas = {
    vivienda: "V",
    parque: "P",
    equipamiento: "E"
};


// CREAR EL TABLERO

export function mostrarTablero(nivel, partida, alPulsarCasilla) {

    const tableroHTML = document.getElementById("tablero");

    // Borramos el tablero anterior.
    tableroHTML.textContent = "";

    // Indicamos cuántas columnas tendrá el tablero.
    tableroHTML.style.setProperty("--columnas", nivel.columnas);

    // Creamos una casilla por cada posición.
    partida.tablero.forEach(function (pieza, posicion) {

        const casilla = document.createElement("button");

        casilla.classList.add("casilla");
        casilla.type = "button";

        // Si la casilla tiene una pieza, la mostramos.
        if (pieza !== null) {

            const elementoPieza = document.createElement("span");

            elementoPieza.classList.add("pieza-tablero");
            elementoPieza.classList.add(pieza);

            elementoPieza.textContent = simbolosPiezas[pieza];

            casilla.appendChild(elementoPieza);
        }

        // Al pulsar una casilla avisamos al archivo principal.
        casilla.addEventListener("click", function () {
            alPulsarCasilla(posicion);
        });

        tableroHTML.appendChild(casilla);
    });
}


// MOSTRAR LAS PIEZAS DISPONIBLES

export function mostrarPiezas(partida, alSeleccionarPieza) {

    const piezasHTML = document.getElementById("piezas");

    // Borramos las piezas anteriores.
    piezasHTML.textContent = "";

    // Recorremos el inventario.
    for (const tipo in partida.inventarioRestante) {

        if (partida.inventarioRestante.hasOwnProperty(tipo)) {

            const cantidad = partida.inventarioRestante[tipo];

            // Creamos el botón de la pieza.
            const boton = document.createElement("button");

            boton.classList.add("boton-pieza");
            boton.type = "button";

            // Añadimos un color según el tipo de pieza.
            const muestra = document.createElement("span");

            muestra.classList.add("muestra-pieza");
            muestra.classList.add(tipo);

            muestra.textContent = simbolosPiezas[tipo];

            // Añadimos el nombre y la cantidad.
            const texto = document.createElement("span");

            texto.textContent = nombresPiezas[tipo] + " (" + cantidad + ")";

            boton.appendChild(muestra);
            boton.appendChild(texto);

            // Marcamos la pieza seleccionada.
            if (partida.piezaSeleccionada === tipo) {
                boton.classList.add("seleccionada");
            }

            // Desactivamos el botón si no quedan piezas.
            if (cantidad === 0) {
                boton.disabled = true;
            }

            // Al pulsar avisamos al archivo principal.
            boton.addEventListener("click", function () {
                alSeleccionarPieza(tipo);
            });

            piezasHTML.appendChild(boton);
        }
    }
}


// ACTUALIZAR LOS DATOS DE LA PARTIDA

export function actualizarEstadisticas(partida, puntuacion) {

    document.getElementById("movimientos").textContent =
        partida.movimientos;

    document.getElementById("ayudas").textContent =
        partida.ayudas;

    document.getElementById("puntuacion").textContent =
        puntuacion;
}


// MOSTRAR EL TITULO Y LA DESCRIPCION DEL NIVEL

export function mostrarInformacionNivel(nivel) {

    document.getElementById("titulo-nivel").textContent =
        "Nivel " + nivel.id + ": " + nivel.titulo;

    document.getElementById("descripcion-nivel").textContent =
        nivel.descripcion;
}


// MOSTRAR UN MENSAJE AL JUGADOR

export function mostrarMensaje(mensaje) {

    document.getElementById("mensaje").textContent = mensaje;
}


// MOSTRAR EL PROGRESO DE LOS NIVELES

export function mostrarProgreso(nivelActual, nivelesCompletados) {

    const nivelesHTML = document.getElementById("niveles");

    // Borramos los indicadores anteriores.
    nivelesHTML.textContent = "";

    // Recorremos todos los niveles.
    nivelesCompletados.forEach(function (nivel) {

        const elemento = document.createElement("span");

        elemento.classList.add("nivel");
        elemento.textContent = "Nivel " + nivel.id;

        // Comprobamos si el nivel está completado.
        if (nivel.id <= nivelesCompletados.length &&
            nivel.id < nivelActual) {

            elemento.classList.add("completado");

        } else if (nivel.id === nivelActual) {

            elemento.classList.add("activo");

        } else {

            elemento.classList.add("bloqueado");
        }

        nivelesHTML.appendChild(elemento);
    });
}
