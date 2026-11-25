// Cada nivell defineix una quadrícula quadrada i el seu inventari inicial.
export const niveles = [
    { id: 1, lado: 5, parquesPorCuadrante: 1, inventario: { vivienda: 21, parque: 4 } },
    { id: 2, lado: 7, parquesPorCuadrante: 1, inventario: { vivienda: 41, parque: 4, equipamiento: 4 } },
    {
        id: 3,
        lado: 9,
        parquesPorCuadrante: 2,
        comprobarVecindad: true,
        inventario: { vivienda: 69, parque: 8, equipamiento: 4 }
    }
];

export function crearPartida(nivel) {
    const totalCasillas = nivel.lado * nivel.lado;

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
function brazoDelEje(fila, columna, centro) {
    if (fila === centro && columna !== centro) {
        return columna < centro ? "oest" : "est";
    }
    if (columna === centro && fila !== centro) {
        return fila < centro ? "nord" : "sud";
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

    const fila = Math.floor(posicion / nivel.lado);
    const columna = posicion % nivel.lado;
    const centro = Math.floor(nivel.lado / 2);

    if (tipo === "parque" && (fila === centro || columna === centro)) {
        return "parqueEnEje";
    }
    if (tipo === "equipamiento" && brazoDelEje(fila, columna, centro) === null) {
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
    const tipo = partida.tablero[posicion];
    if (!posicionValida(partida.tablero, posicion) || tipo === null) {
        return false;
    }
    partida.tablero[posicion] = null;
    partida.inventarioRestante[tipo]++;
    partida.movimientos++;
    return true;
}

function comprobarDistribucion(tablero, nivel) {
    const centro = Math.floor(nivel.lado / 2);
    const parquesPorCuadrante = [0, 0, 0, 0];
    const brazosOcupados = [];

    for (let posicion = 0; posicion < tablero.length; posicion++) {
        const tipo = tablero[posicion];
        const fila = Math.floor(posicion / nivel.lado);
        const columna = posicion % nivel.lado;

        if (tipo === "parque") {
            // També revisem els eixos perquè una partida antiga pot tenir-hi peces.
            if (fila === centro || columna === centro) {
                return "parquesCuadrante";
            }

            // Els quadrants es numeren d'esquerra a dreta i de dalt a baix.
            let cuadrante = 0;
            if (fila > centro) {
                cuadrante += 2;
            }
            if (columna > centro) {
                cuadrante++;
            }
            parquesPorCuadrante[cuadrante]++;
        } else if (tipo === "equipamiento") {
            const brazo = brazoDelEje(fila, columna, centro);
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
    const fila = Math.floor(posicion / nivel.lado);
    const columna = posicion % nivel.lado;
    const ancho = nivel.lado;

    // Comprovem els límits de la fila i la columna abans de mirar cada veïna.
    if (fila > 0 && tablero[posicion - ancho] === "parque") {
        return true;
    }
    if (fila < nivel.lado - 1 && tablero[posicion + ancho] === "parque") {
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
    if (error !== null || !nivel.comprobarVecindad) {
        return error;
    }
    return comprobarVecindad(tablero, nivel);
}

export function calcularPuntuacion(partida) {
    const penalizacionMovimientos = partida.movimientos * 10;
    const penalizacionAyudas = partida.ayudas * 50;
    return Math.max(0, 1000 - penalizacionMovimientos - penalizacionAyudas);
}
