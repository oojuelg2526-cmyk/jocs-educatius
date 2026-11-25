import { niveles, textos } from "./datos.js";

document.addEventListener("DOMContentLoaded", () => {
    const tablero = document.getElementById("tablero");
    const idioma = document.getElementById("idioma");
    const aviso = document.getElementById("aviso");
    const deshacer = document.getElementById("deshacer");
    const siguiente = document.getElementById("siguiente");
    const botonesNivel = document.querySelectorAll("[data-nivel]");
    const etiquetas = document.querySelectorAll("[data-texto]");
    const clave = "cerda_tracat";

    let numero = 0;
    let desbloqueado = 0;
    let nivel;
    let tamano;
    let origen;
    let destino;
    let plaza;
    let casillas = [];
    let camino = [];
    let superado = false;
    let mensaje = "inicio";
    let estado = "informacion";
    let diccionario = textos.ca;
    let puntero = null;

    function leerProgreso() {
        try {
            return JSON.parse(localStorage.getItem(clave)) ?? {};
        } catch (error) {
            console.warn("No se pudo leer el trazado guardado.", error);
            return {};
        }
    }

    function guardarProgreso() {
        try {
            localStorage.setItem(clave, JSON.stringify({ numero, desbloqueado, camino }));
        } catch (error) {
            console.warn("No se pudo guardar el trazado.", error);
        }
    }

    function ultimaCasilla() {
        return camino[camino.length - 1] ?? origen;
    }

    // Cada paso cambia la fila o la columna en una unidad.
    function distancia(posicion, otra) {
        const filas = Math.abs(Math.floor(posicion / tamano) - Math.floor(otra / tamano));
        const columnas = Math.abs(posicion % tamano - otra % tamano);
        return filas + columnas;
    }

    function errorDePaso(posicion) {
        if (!Number.isInteger(posicion) || posicion < 0 || posicion >= casillas.length) {
            return "fuera";
        }
        if (camino.length === 0) {
            return posicion === origen ? null : "inicio";
        }
        if (distancia(posicion, ultimaCasilla()) !== 1) {
            return "lado";
        }
        if (casillas[posicion].dataset.tipo === "verde") {
            return "protegida";
        }
        if (camino.includes(posicion)) {
            return "repetida";
        }
        if (posicion === destino && nivel.requierePlaza && !camino.includes(plaza)) {
            return "faltaPlaza";
        }
        const pasosNecesarios = camino.length + distancia(posicion, destino);
        if (nivel.limite && pasosNecesarios > nivel.limite) {
            return "rodeo";
        }
        return null;
    }

    function mostrarAviso(claveAviso, estadoAviso = "informacion") {
        mensaje = claveAviso;
        estado = estadoAviso;
        let texto = diccionario[mensaje];
        if (mensaje === "victoria") {
            texto = diccionario.misiones[numero].victoria;
        }
        if (aviso.textContent !== texto) {
            aviso.textContent = texto;
        }
        aviso.dataset.estado = estado;
    }

    function marcarTramo(casilla, posicion, vecina) {
        if (vecina === posicion - tamano) {
            casilla.classList.add("norte");
        } else if (vecina === posicion + tamano) {
            casilla.classList.add("sur");
        } else if (vecina === posicion - 1) {
            casilla.classList.add("oeste");
        } else if (vecina === posicion + 1) {
            casilla.classList.add("este");
        }
    }

    function pintarTablero() {
        for (const casilla of casillas) {
            const posicion = Number(casilla.dataset.posicion);
            const indice = camino.indexOf(posicion);
            const perteneceAlCamino = indice !== -1;
            casilla.classList.remove("norte", "sur", "este", "oeste");
            casilla.classList.toggle("trazada", perteneceAlCamino);
            casilla.tabIndex = posicion === ultimaCasilla() ? 0 : -1;

            const fila = Math.floor(posicion / tamano) + 1;
            const columna = posicion % tamano + 1;
            const tipo = diccionario[casilla.dataset.tipo];
            let nombre = `${diccionario.fila} ${fila}, ${diccionario.columna} ${columna} · ${tipo}`;
            if (perteneceAlCamino) {
                marcarTramo(casilla, posicion, camino[indice - 1]);
                marcarTramo(casilla, posicion, camino[indice + 1]);
                nombre += ` · ${diccionario.tramoTrazado}`;
            }
            casilla.setAttribute("aria-label", nombre);
        }

        let pasos = 0;
        if (camino.length > 0) {
            pasos = camino.length - 1;
        }
        let textoPasos = `${diccionario.pasos} · ${pasos}`;
        if (nivel.limite) {
            textoPasos += ` / ${nivel.limite}`;
        }
        document.getElementById("pasos").textContent = textoPasos;
        deshacer.disabled = camino.length < 2 || superado;
        siguiente.hidden = !superado || numero === niveles.length - 1;

        for (const boton of botonesNivel) {
            const id = Number(boton.dataset.nivel);
            boton.disabled = id > desbloqueado;
            boton.setAttribute("aria-current", id === numero ? "step" : "false");
        }
    }

    function pintarTextos() {
        for (const elemento of etiquetas) {
            elemento.textContent = diccionario[elemento.dataset.texto];
        }
        document.getElementById("niveles").setAttribute("aria-label", diccionario.niveles);
        const mision = diccionario.misiones[numero];
        document.getElementById("mision").textContent = mision.titulo;
        document.getElementById("objetivo").textContent = mision.objetivo;
        document.getElementById("explicacion").textContent = mision.motivo;
        document.getElementById("leyenda-verde").hidden = !nivel.verde;
        document.getElementById("leyenda-plaza").hidden = !nivel.requierePlaza;
        mostrarAviso(mensaje, estado);
    }

    function cargarNivel(id, caminoGuardado = []) {
        numero = id;
        nivel = niveles[id];
        tamano = nivel.mapa.length;
        plaza = -1;
        camino = [];
        casillas = [];
        superado = false;
        mensaje = "inicio";
        estado = "informacion";
        puntero = null;

        while (tablero.firstElementChild) {
            tablero.firstElementChild.remove();
        }
        tablero.dataset.tamano = String(tamano);

        for (const fila of nivel.mapa) {
            for (const marca of fila) {
                const posicion = casillas.length;
                const casilla = document.createElement("button");
                casilla.type = "button";
                casilla.classList.add("casilla");
                casilla.dataset.posicion = String(posicion);
                casilla.dataset.tipo = "calle";

                const simbolo = document.createElement("span");
                simbolo.setAttribute("aria-hidden", "true");
                if (marca === "S") {
                    origen = posicion;
                    casilla.dataset.tipo = "origen";
                    simbolo.textContent = "●";
                } else if (marca === "F") {
                    destino = posicion;
                    casilla.dataset.tipo = "destino";
                    simbolo.textContent = "◆";
                } else if (marca === "V") {
                    casilla.dataset.tipo = "verde";
                    simbolo.textContent = "▧";
                } else if (marca === "P") {
                    plaza = posicion;
                    casilla.dataset.tipo = "plaza";
                    simbolo.textContent = "✚";
                }
                casilla.appendChild(simbolo);
                tablero.appendChild(casilla);
                casillas.push(casilla);
            }
        }

        // Recuperamos solo los pasos que siguen siendo válidos en el mapa actual.
        for (const posicion of caminoGuardado) {
            if (superado || errorDePaso(posicion) !== null) {
                break;
            }
            camino.push(posicion);
            superado = posicion === destino;
        }
        if (superado) {
            mensaje = "victoria";
            estado = "correcto";
        } else if (camino.length > 0) {
            mensaje = "continuar";
        }

        pintarTextos();
        pintarTablero();
    }

    function quitarPaso() {
        camino.pop();
        mostrarAviso("deshecho");
        pintarTablero();
        guardarProgreso();
    }

    // Ratón, dedo y teclado usan la misma función para cambiar el camino.
    function intentarPaso(posicion) {
        if (superado) {
            return false;
        }
        if (camino.length > 0 && posicion === ultimaCasilla()) {
            return true;
        }
        if (camino.length > 1 && posicion === camino[camino.length - 2]) {
            quitarPaso();
            return true;
        }

        const error = errorDePaso(posicion);
        if (error !== null) {
            mostrarAviso(error, "error");
            return false;
        }

        camino.push(posicion);
        if (posicion === destino) {
            superado = true;
            if (numero === desbloqueado && numero < niveles.length - 1) {
                desbloqueado = numero + 1;
            }
            mostrarAviso("victoria", "correcto");
        } else if (posicion === plaza) {
            mostrarAviso("continuaPlaza", "correcto");
        } else {
            mostrarAviso("continuar");
        }

        pintarTablero();
        guardarProgreso();
        return true;
    }

    tablero.addEventListener("pointerdown", evento => {
        const casilla = evento.target;
        if (puntero !== null || !evento.isPrimary || evento.button !== 0) {
            return;
        }
        if (casilla.dataset.posicion === undefined) {
            return;
        }

        evento.preventDefault();
        const posicion = Number(casilla.dataset.posicion);
        if (intentarPaso(posicion)) {
            puntero = evento.pointerId;
        }
    });

    document.addEventListener("pointermove", evento => {
        if (evento.pointerId !== puntero || superado) {
            return;
        }

        // En táctil, el evento puede seguir llegando al botón inicial.
        const casilla = document.elementFromPoint(evento.clientX, evento.clientY);
        if (casilla && casilla.parentElement === tablero && casilla.dataset.posicion !== undefined) {
            intentarPaso(Number(casilla.dataset.posicion));
        } else {
            intentarPaso(-1);
        }
    });

    function terminarGesto(evento) {
        if (evento.pointerId === puntero) {
            puntero = null;
        }
    }
    document.addEventListener("pointerup", terminarGesto);
    document.addEventListener("pointercancel", terminarGesto);
    window.addEventListener("blur", () => {
        puntero = null;
    });

    tablero.addEventListener("click", evento => {
        const casilla = evento.target;
        // El puntero ya se procesa al pulsar. Este clic activa el botón desde el teclado.
        if (casilla.dataset.posicion !== undefined && evento.detail === 0) {
            intentarPaso(Number(casilla.dataset.posicion));
            casillas[ultimaCasilla()].focus();
        }
    });

    tablero.addEventListener("keydown", evento => {
        const ultima = ultimaCasilla();
        const fila = Math.floor(ultima / tamano);
        const columna = ultima % tamano;
        let posicion = -1;

        if (evento.key === "ArrowUp") {
            if (fila > 0) {
                posicion = ultima - tamano;
            }
        } else if (evento.key === "ArrowDown") {
            if (fila < tamano - 1) {
                posicion = ultima + tamano;
            }
        } else if (evento.key === "ArrowLeft") {
            if (columna > 0) {
                posicion = ultima - 1;
            }
        } else if (evento.key === "ArrowRight") {
            if (columna < tamano - 1) {
                posicion = ultima + 1;
            }
        } else {
            return;
        }

        evento.preventDefault();
        if (camino.length === 0) {
            intentarPaso(origen);
        }
        if (intentarPaso(posicion)) {
            casillas[ultimaCasilla()].focus();
        }
    });

    function abrirNivel(id) {
        cargarNivel(id);
        guardarProgreso();
        casillas[origen].focus();
    }

    for (const boton of botonesNivel) {
        boton.addEventListener("click", () => {
            const id = Number(boton.dataset.nivel);
            if (id !== numero && id <= desbloqueado) {
                abrirNivel(id);
            }
        });
    }
    document.getElementById("reiniciar").addEventListener("click", () => abrirNivel(numero));
    siguiente.addEventListener("click", () => abrirNivel(numero + 1));
    deshacer.addEventListener("click", () => {
        quitarPaso();
        if (deshacer.disabled) {
            casillas[ultimaCasilla()].focus();
        }
    });

    function aplicarIdioma(codigo) {
        if (codigo !== "ca" && codigo !== "es" && codigo !== "en") {
            codigo = "ca";
        }
        diccionario = textos[codigo];
        document.documentElement.lang = codigo;
        idioma.value = codigo;
    }

    let codigoGuardado = "ca";
    try {
        codigoGuardado = localStorage.getItem("cerda_lang") ?? "ca";
    } catch (error) {
        console.warn("No se pudo recuperar el idioma.", error);
    }
    aplicarIdioma(codigoGuardado);
    idioma.addEventListener("change", () => {
        aplicarIdioma(idioma.value);
        pintarTextos();
        pintarTablero();
        try {
            localStorage.setItem("cerda_lang", idioma.value);
        } catch (error) {
            console.warn("No se pudo guardar el idioma.", error);
        }
    });

    const progreso = leerProgreso();
    // Las partidas anteriores se guardaban con los nombres en catalán.
    const nivelGuardado = progreso.desbloqueado ?? progreso["desbloquejat"];
    if (Number.isInteger(nivelGuardado) && niveles[nivelGuardado]) {
        desbloqueado = nivelGuardado;
    }
    if (Number.isInteger(progreso.numero) && niveles[progreso.numero] && progreso.numero <= desbloqueado) {
        numero = progreso.numero;
    }
    const caminoGuardado = progreso.camino ?? progreso["cami"];
    if (Array.isArray(caminoGuardado)) {
        cargarNivel(numero, caminoGuardado);
    } else {
        cargarNivel(numero);
    }
});
