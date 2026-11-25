const imagenesPiezas = {
    vivienda: "residencial.png",
    parque: "zona-verde.png",
    equipamiento: "equipamiento.png"
};

function crearBoton(clase) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.classList.add(clase);
    return boton;
}

function crearDibujo(boton, clase) {
    const dibujo = document.createElement("span");
    dibujo.classList.add("dibujo-peca", clase);
    dibujo.setAttribute("aria-hidden", "true");
    boton.appendChild(dibujo);
    return dibujo;
}

// El dataset indica el dibuix de reserva mentre no hi ha cap imatge carregada.
function actualizarDibujo(dibujo, tipo) {
    if ((dibujo.dataset.peca ?? null) === tipo) {
        return;
    }
    if (dibujo.firstElementChild) {
        dibujo.firstElementChild.remove();
    }
    if (tipo === null) {
        delete dibujo.dataset.peca;
        return;
    }
    dibujo.dataset.peca = tipo;
    const imagen = document.createElement("img");
    imagen.alt = "";
    imagen.hidden = true;
    imagen.draggable = false;
    imagen.addEventListener("load", () => {
        imagen.hidden = false;
    });
    imagen.addEventListener("error", () => imagen.remove());
    imagen.src = new URL(`../img/${imagenesPiezas[tipo]}`, import.meta.url).href;
    dibujo.appendChild(imagen);
}

export function crearTablero(contenedor, lado) {
    contenedor.replaceChildren();
    contenedor.dataset.columnes = String(lado);
    const centro = Math.floor(lado / 2);

    for (let posicion = 0; posicion < lado * lado; posicion++) {
        const casilla = crearBoton("casilla");
        const fila = Math.floor(posicion / lado);
        const columna = posicion % lado;
        casilla.dataset.posicio = String(posicion);
        casilla.dataset.fila = String(fila + 1);
        casilla.dataset.columna = String(columna + 1);
        casilla.classList.toggle("eje-central", fila === centro || columna === centro);
        crearDibujo(casilla, "pieza-tablero");
        contenedor.appendChild(casilla);
    }
}

export function crearPiezas(contenedor, inventario) {
    contenedor.replaceChildren();
    for (const tipo of Object.keys(inventario)) {
        const boton = crearBoton("boton-pieza");
        boton.dataset.peca = tipo;
        const muestra = crearDibujo(boton, "muestra-pieza");
        actualizarDibujo(muestra, tipo);
        boton.appendChild(document.createElement("span"));
        contenedor.appendChild(boton);
    }
}

export function actualizarCasilla(casilla, partida, textos) {
    const posicion = Number(casilla.dataset.posicio);
    const tipo = partida.tablero[posicion];
    const nombre = textos.piezas[tipo] ?? textos.vacia;
    casilla.disabled = partida.completada;
    casilla.dataset.estat = tipo === null ? "buida" : "ocupada";
    casilla.setAttribute("aria-label", textos.casilla(casilla.dataset.fila, casilla.dataset.columna, nombre));
    actualizarDibujo(casilla.firstElementChild, tipo);
}

export function actualizarPiezas(botones, partida, textos) {
    for (const boton of botones) {
        const tipo = boton.dataset.peca;
        const cantidad = partida.inventarioRestante[tipo];
        const seleccionada = partida.piezaSeleccionada === tipo;
        boton.lastElementChild.textContent = `${textos.piezas[tipo]} (${cantidad})`;
        boton.classList.toggle("seleccionada", seleccionada);
        boton.setAttribute("aria-pressed", String(seleccionada));
        boton.setAttribute("aria-disabled", String(cantidad === 0));
        boton.disabled = partida.completada;
        boton.draggable = cantidad > 0 && !partida.completada;
    }
}
