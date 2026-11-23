const imagenesPiezas = {
    vivienda: "residencial.png",
    parque: "zona-verde.png",
    equipamiento: "equipamiento.png"
};

function actualizarDibujo(contenedor, tipo) {
    if (contenedor.dataset.peca === tipo) {
        return;
    }

    contenedor.firstElementChild?.remove();
    if (tipo === null) {
        delete contenedor.dataset.peca;
        return;
    }

    contenedor.dataset.peca = tipo;
    const imagen = document.createElement("img");
    imagen.alt = "";
    imagen.hidden = true;
    imagen.draggable = false;
    imagen.addEventListener("load", () => { imagen.hidden = false; });
    imagen.addEventListener("error", () => { imagen.remove(); });
    imagen.src = new URL(`../img/${imagenesPiezas[tipo]}`, import.meta.url).href;
    contenedor.appendChild(imagen);
}

export function crearTablero(contenedor, nivel) {
    for (const casilla of [...contenedor.children]) {
        casilla.remove();
    }

    contenedor.dataset.columnes = String(nivel.columnas);
    const casillas = [];
    const filaCentral = Math.floor(nivel.filas / 2);
    const columnaCentral = Math.floor(nivel.columnas / 2);

    for (let posicion = 0; posicion < nivel.filas * nivel.columnas; posicion++) {
        const casilla = document.createElement("button");
        casilla.type = "button";
        casilla.classList.add("casilla");
        casilla.dataset.posicio = String(posicion);
        const fila = Math.floor(posicion / nivel.columnas);
        const columna = posicion % nivel.columnas;
        casilla.dataset.fila = String(fila + 1);
        casilla.dataset.columna = String(columna + 1);
        casilla.classList.toggle("eje-central", fila === filaCentral || columna === columnaCentral);

        const pieza = document.createElement("span");
        pieza.classList.add("dibujo-peca", "pieza-tablero");
        pieza.setAttribute("aria-hidden", "true");
        casilla.appendChild(pieza);
        contenedor.appendChild(casilla);
        casillas.push(casilla);
    }

    return casillas;
}

export function crearPiezas(contenedor, inventario) {
    for (const boton of [...contenedor.children]) {
        boton.remove();
    }

    const botones = [];

    for (const tipo of Object.keys(inventario)) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.classList.add("boton-pieza");
        boton.dataset.peca = tipo;

        const muestra = document.createElement("span");
        muestra.classList.add("dibujo-peca", "muestra-pieza");
        muestra.setAttribute("aria-hidden", "true");
        actualizarDibujo(muestra, tipo);

        boton.appendChild(muestra);
        boton.appendChild(document.createElement("span"));
        contenedor.appendChild(boton);
        botones.push(boton);
    }

    return botones;
}

export function actualizarTablero(casillas, tablero, completada, textos) {
    casillas.forEach((casilla, posicion) => {
        const tipo = tablero[posicion];
        const pieza = casilla.firstElementChild;
        const nombre = textos.piezas[tipo];

        casilla.disabled = completada;
        casilla.dataset.estat = tipo === null ? "buida" : "ocupada";
        casilla.setAttribute("aria-label",
            textos.casilla(casilla.dataset.fila, casilla.dataset.columna, nombre ?? textos.vacia));
        actualizarDibujo(pieza, tipo);
    });
}

export function actualizarPiezas(botones, partida, completada, textos) {
    for (const boton of botones) {
        const tipo = boton.dataset.peca;
        const cantidad = partida.inventarioRestante[tipo];
        const seleccionada = partida.piezaSeleccionada === tipo;
        boton.lastElementChild.textContent = `${textos.piezas[tipo]} (${cantidad})`;
        boton.classList.toggle("seleccionada", seleccionada);
        boton.setAttribute("aria-pressed", String(seleccionada));
        boton.setAttribute("aria-disabled", String(cantidad === 0));
        boton.disabled = completada;
    }
}

export function mostrarMensaje(elemento, texto, estado = "informacio") {
    elemento.dataset.estat = estado;
    elemento.textContent = texto;
}
