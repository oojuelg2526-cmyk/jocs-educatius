
/*
    JUEGO: RECONSTRUYE EL EIXAMPLE

    Este archivo contiene las funciones principales
    para controlar una partida.
*/


// CREAR UNA NUEVA PARTIDA

export function crearPartida(nivel) {

    // Creamos un tablero vacío con tantas casillas
    // como elementos tenga la solución del nivel.
    const tablero = [];

    for (const pieza of nivel.solucion) {
        tablero.push(null);
    }

    // Copiamos el inventario para no modificar
    // los datos originales de niveles.js.
    const inventarioRestante = {};

    for (const tipo in nivel.inventario) {

        if (nivel.inventario.hasOwnProperty(tipo)) {
            inventarioRestante[tipo] = nivel.inventario[tipo];
        }
    }

    // Devolvemos los datos de la partida.
    return {
        tablero: tablero,
        inventarioRestante: inventarioRestante,
        piezaSeleccionada: null,
        movimientos: 0,
        ayudas: 0
    };
}


// SELECCIONAR UNA PIEZA

export function seleccionarPieza(partida, tipo) {

    // Comprobamos si quedan piezas de ese tipo.
    if (partida.inventarioRestante[tipo] <= 0) {
        return false;
    }

    partida.piezaSeleccionada = tipo;

    return true;
}


// COLOCAR UNA PIEZA EN EL TABLERO

export function colocarPieza(partida, posicion) {

    // Comprobamos que haya una pieza seleccionada.
    if (partida.piezaSeleccionada === null) {
        return false;
    }

    // Comprobamos que la posición exista.
    if (posicion < 0 || posicion >= partida.tablero.length) {
        return false;
    }

    // No podemos colocar una pieza en una casilla ocupada.
    if (partida.tablero[posicion] !== null) {
        return false;
    }

    const tipo = partida.piezaSeleccionada;

    // Comprobamos que todavía queden piezas disponibles.
    if (partida.inventarioRestante[tipo] <= 0) {
        return false;
    }

    // Colocamos la pieza.
    partida.tablero[posicion] = tipo;

    // Restamos una unidad al inventario.
    partida.inventarioRestante[tipo]--;

    // Sumamos un movimiento.
    partida.movimientos++;

    // Dejamos de tener una pieza seleccionada.
    partida.piezaSeleccionada = null;

    return true;
}


// RETIRAR UNA PIEZA DEL TABLERO

export function retirarPieza(partida, posicion) {

    // Comprobamos que la posición sea válida.
    if (posicion < 0 || posicion >= partida.tablero.length) {
        return false;
    }

    // Comprobamos que la casilla tenga una pieza.
    if (partida.tablero[posicion] === null) {
        return false;
    }

    const tipo = partida.tablero[posicion];

    // Devolvemos la pieza al inventario.
    partida.inventarioRestante[tipo]++;

    // Vaciamos la casilla.
    partida.tablero[posicion] = null;

    // Sumamos un movimiento.
    partida.movimientos++;

    return true;
}


// COMPROBAR SI EL NIVEL ESTÁ COMPLETADO

export function comprobarSolucion(partida, nivel) {

    // Recorremos todas las casillas del tablero.
    for (let i = 0; i < nivel.solucion.length; i++) {

        // Si alguna casilla no coincide con la solución,
        // el nivel todavía no está completado.
        if (partida.tablero[i] !== nivel.solucion[i]) {
            return false;
        }
    }

    return true;
}


// UTILIZAR UNA PISTA

export function usarPista(partida) {

    partida.ayudas++;

    return partida.ayudas;
}


// CALCULAR LA PUNTUACIÓN

export function calcularPuntuacion(partida) {

    let puntuacion = 1000;

    // Cada movimiento resta 10 puntos.
    puntuacion = puntuacion - (partida.movimientos * 10);

    // Cada pista utilizada resta 50 puntos.
    puntuacion = puntuacion - (partida.ayudas * 50);

    // La puntuación nunca puede ser negativa.
    if (puntuacion < 0) {
        puntuacion = 0;
    }

    return puntuacion;
}


// OBTENER LAS PIEZAS DISPONIBLES

export function obtenerPiezasDisponibles(partida) {

    const piezas = [];

    // Recorremos las propiedades del objeto inventario.
    for (const tipo in partida.inventarioRestante) {

        if (partida.inventarioRestante.hasOwnProperty(tipo)) {

            piezas.push({
                tipo: tipo,
                cantidad: partida.inventarioRestante[tipo]
            });
        }
    }

    return piezas;
}
