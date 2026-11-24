export function crearPartida(nivel) {
    const totalCasillas = nivel.filas * nivel.columnas;

    return {
        tablero: Array(totalCasillas).fill(null),
        inventarioRestante: { ...nivel.inventario },
        piezaSeleccionada: null,
        movimientos: 0,
        ayudas: 0,
        completada: false
    };
}

function posicionValida(tablero, posicion) {
    return Number.isInteger(posicion) && posicion >= 0 && posicion < tablero.length;
}

export function quedanPiezas(partida, tipo) {
    const inventario = partida.inventarioRestante;
    return Object.prototype.hasOwnProperty.call(inventario, tipo) && inventario[tipo] > 0;
}

// Cada braç té un nom. El centre i les caselles de fora de la creu no són cap braç.
function brazoDelEje(fila, columna, centroFila, centroColumna) {
    if (fila === centroFila && columna < centroColumna) {
        return "oest";
    }
    if (fila === centroFila && columna > centroColumna) {
        return "est";
    }
    if (columna === centroColumna && fila < centroFila) {
        return "nord";
    }
    if (columna === centroColumna && fila > centroFila) {
        return "sud";
    }
    return null;
}

// Les regles d'una sola casella es poden comprovar abans de posar la peça.
export function errorDeColocacion(partida, nivel, posicion, tipo) {
    if (!posicionValida(partida.tablero, posicion) || partida.tablero[posicion] !== null) {
        return "ocupada";
    }
    if (!quedanPiezas(partida, tipo)) {
        return "agotada";
    }

    const fila = Math.floor(posicion / nivel.columnas);
    const columna = posicion % nivel.columnas;
    const centroFila = Math.floor(nivel.filas / 2);
    const centroColumna = Math.floor(nivel.columnas / 2);

    if (tipo === "parque" && (fila === centroFila || columna === centroColumna)) {
        return "parqueEnEje";
    }
    if (tipo === "equipamiento" && brazoDelEje(fila, columna, centroFila, centroColumna) === null) {
        return "equipamientosEjes";
    }
    return null;
}

export function colocarPieza(partida, nivel, posicion, tipo) {
    const error = errorDeColocacion(partida, nivel, posicion, tipo);
    if (error !== null) {
        return error;
    }

    partida.tablero[posicion] = tipo;
    partida.inventarioRestante[tipo]--;
    partida.movimientos++;
    partida.piezaSeleccionada = quedanPiezas(partida, tipo) ? tipo : null;
    return null;
}

export function retirarPieza(partida, posicion) {
    if (!posicionValida(partida.tablero, posicion)) {
        return false;
    }

    const tipo = partida.tablero[posicion];
    if (tipo === null) {
        return false;
    }

    partida.tablero[posicion] = null;
    partida.inventarioRestante[tipo]++;
    partida.movimientos++;
    return true;
}

function comprobarDistribucion(tablero, nivel) {
    const centroFila = Math.floor(nivel.filas / 2);
    const centroColumna = Math.floor(nivel.columnas / 2);
    const parquesPorCuadrante = [0, 0, 0, 0];
    const brazosOcupados = [];

    for (let posicion = 0; posicion < tablero.length; posicion++) {
        const tipo = tablero[posicion];
        const fila = Math.floor(posicion / nivel.columnas);
        const columna = posicion % nivel.columnas;

        if (tipo === "parque") {
            // També revisem els eixos perquè una partida antiga pot tenir-hi peces.
            if (fila === centroFila || columna === centroColumna) {
                return "parquesCuadrante";
            }

            // Els quadrants es numeren d'esquerra a dreta i de dalt a baix.
            let cuadrante = 0;
            if (fila > centroFila) {
                cuadrante += 2;
            }
            if (columna > centroColumna) {
                cuadrante++;
            }
            parquesPorCuadrante[cuadrante]++;
        } else if (tipo === "equipamiento") {
            const brazo = brazoDelEje(fila, columna, centroFila, centroColumna);
            if (brazo === null || brazosOcupados.includes(brazo)) {
                return "equipamientosEjes";
            }
            brazosOcupados.push(brazo);
        }
    }

    for (const cantidad of parquesPorCuadrante) {
        if (cantidad !== nivel.parquesPorCuadrante) {
            return "parquesCuadrante";
        }
    }

    const equipamientosNecesarios = nivel.inventario.equipamiento ?? 0;
    if (brazosOcupados.length !== equipamientosNecesarios) {
        return "equipamientosEjes";
    }
    return null;
}

function hayParqueAlLado(tablero, nivel, posicion) {
    const fila = Math.floor(posicion / nivel.columnas);
    const columna = posicion % nivel.columnas;
    const ancho = nivel.columnas;

    // Comprovem els límits de la fila i la columna abans de mirar cada veïna.
    if (fila > 0 && tablero[posicion - ancho] === "parque") {
        return true;
    }
    if (fila < nivel.filas - 1 && tablero[posicion + ancho] === "parque") {
        return true;
    }
    if (columna > 0 && tablero[posicion - 1] === "parque") {
        return true;
    }
    return columna < ancho - 1 && tablero[posicion + 1] === "parque";
}

function comprobarVecindad(tablero, nivel) {
    for (let posicion = 0; posicion < tablero.length; posicion++) {
        const tipo = tablero[posicion];
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
    const tablero = partida.tablero;
    if (tablero.includes(null)) {
        return "tableroIncompleto";
    }
    for (const cantidad of Object.values(partida.inventarioRestante)) {
        if (cantidad !== 0) {
            return "tableroIncompleto";
        }
    }

    const error = comprobarDistribucion(tablero, nivel);
    if (error !== null) {
        return error;
    }
    if (nivel.comprobarVecindad) {
        return comprobarVecindad(tablero, nivel);
    }
    return null;
}

export function calcularPuntuacion(partida) {
    const penalizacionMovimientos = partida.movimientos * 10;
    const penalizacionAyudas = partida.ayudas * 50;
    return Math.max(0, 1000 - penalizacionMovimientos - penalizacionAyudas);
}
