export function crearPartida(nivel) {
    return {
        tablero: Array(nivel.filas * nivel.columnas).fill(null),
        inventarioRestante: { ...nivel.inventario },
        piezaSeleccionada: null,
        movimientos: 0,
        ayudas: 0,
        completada: false
    };
}

function posicionValida(partida, posicion) {
    return Number.isInteger(posicion) && posicion >= 0 && posicion < partida.tablero.length;
}

function quedanPiezas(partida, tipo) {
    return Object.prototype.hasOwnProperty.call(partida.inventarioRestante, tipo)
        && partida.inventarioRestante[tipo] > 0;
}

export function seleccionarPieza(partida, tipo) {
    if (!quedanPiezas(partida, tipo)) {
        return false;
    }

    partida.piezaSeleccionada = tipo;
    return true;
}

export function colocarPieza(partida, posicion) {
    const tipo = partida.piezaSeleccionada;

    if (!posicionValida(partida, posicion) || partida.tablero[posicion] !== null
        || !quedanPiezas(partida, tipo)) {
        return false;
    }

    partida.tablero[posicion] = tipo;
    partida.inventarioRestante[tipo]--;
    partida.movimientos++;

    if (!quedanPiezas(partida, tipo)) {
        partida.piezaSeleccionada = null;
    }

    return true;
}

export function retirarPieza(partida, posicion) {
    if (!posicionValida(partida, posicion) || partida.tablero[posicion] === null) {
        return false;
    }

    const tipo = partida.tablero[posicion];
    partida.inventarioRestante[tipo]++;
    partida.tablero[posicion] = null;
    partida.movimientos++;
    return true;
}

function tramoDelEje(fila, columna, filaCentral, columnaCentral) {
    if (fila === filaCentral && columna !== columnaCentral) {
        return columna < columnaCentral ? "oest" : "est";
    }
    if (columna === columnaCentral && fila !== filaCentral) {
        return fila < filaCentral ? "nord" : "sud";
    }
    return null;
}

function comprobarDistribucion(tablero, nivel) {
    const filaCentral = Math.floor(nivel.filas / 2);
    const columnaCentral = Math.floor(nivel.columnas / 2);
    const parques = [0, 0, 0, 0];
    const tramos = new Set();

    for (const [posicion, tipo] of tablero.entries()) {
        if (tipo === "vivienda") {
            continue;
        }

        const fila = Math.floor(posicion / nivel.columnas);
        const columna = posicion % nivel.columnas;
        if (tipo === "equipamiento") {
            const tramo = tramoDelEje(fila, columna, filaCentral, columnaCentral);
            if (tramo === null || tramos.has(tramo)) {
                return "equipamientosEjes";
            }
            tramos.add(tramo);
        } else {
            if (fila === filaCentral || columna === columnaCentral) {
                return "parquesCuadrante";
            }

            const mitadVertical = fila < filaCentral ? 0 : 2;
            const mitadHorizontal = columna < columnaCentral ? 0 : 1;
            parques[mitadVertical + mitadHorizontal]++;
        }
    }

    if (parques.some(cantidad => cantidad !== nivel.parquesPorCuadrante)) {
        return "parquesCuadrante";
    }

    return tramos.size === (nivel.inventario.equipamiento ?? 0) ? null : "equipamientosEjes";
}

function hayParqueAlLado(tablero, nivel, posicion) {
    const fila = Math.floor(posicion / nivel.columnas);
    const columna = posicion % nivel.columnas;

    return (fila > 0 && tablero[posicion - nivel.columnas] === "parque")
        || (fila < nivel.filas - 1 && tablero[posicion + nivel.columnas] === "parque")
        || (columna > 0 && tablero[posicion - 1] === "parque")
        || (columna < nivel.columnas - 1 && tablero[posicion + 1] === "parque");
}

function comprobarVecindad(tablero, nivel) {
    for (const [posicion, tipo] of tablero.entries()) {
        if (tipo === "parque" && hayParqueAlLado(tablero, nivel, posicion)) {
            return "parquesJuntos";
        }
        if (tipo === "equipamiento" && !hayParqueAlLado(tablero, nivel, posicion)) {
            return "equipamientoSinParque";
        }
    }

    return null;
}

export function comprobarPlano(partida, nivel) {
    if (partida.tablero.length !== nivel.filas * nivel.columnas
        || partida.tablero.includes(null)
        || Object.values(partida.inventarioRestante).some(cantidad => cantidad !== 0)) {
        return "tableroIncompleto";
    }

    const error = comprobarDistribucion(partida.tablero, nivel);
    if (error === null && nivel.comprobarVecindad) {
        return comprobarVecindad(partida.tablero, nivel);
    }

    return error;
}

export function usarPista(partida) {
    partida.ayudas++;
    return partida.ayudas;
}

export function calcularPuntuacion(partida) {
    return Math.max(0, 1000 - partida.movimientos * 10 - partida.ayudas * 50);
}
