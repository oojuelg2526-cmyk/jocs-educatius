// Página de récords: pide el top 10 a /api/records y lo pinta en la tabla.
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("records");
    const botonesPeriodo = contenedor.querySelectorAll("[data-periodo]");
    const selectorJuego = document.getElementById("records-juego");
    const filas = document.getElementById("records-filas");
    const estado = document.getElementById("records-estado");

    const LOCALES = { ca: "ca-ES", es: "es-ES", en: "en-GB" };

    let periodo = "hoy";
    let ultimosRecords = null; // se guardan para repintar si cambia el idioma
    let ultimoEstado = "records.cargando";
    let numeroPeticion = 0; // para ignorar respuestas viejas si se cambia de filtro muy rápido

    function mostrarEstado(clave) {
        ultimoEstado = clave;
        if (clave === null) {
            estado.hidden = true;
            estado.textContent = "";
            return;
        }
        estado.hidden = false;
        estado.textContent = textoTraducido(clave);
    }

    function crearCelda(texto, esNumero = false) {
        const celda = document.createElement("td");
        celda.textContent = texto;
        if (esNumero) {
            celda.classList.add("numero");
        }
        return celda;
    }

    function pintarRecords(records) {
        const locale = LOCALES[idiomaActual()];
        filas.replaceChildren();

        if (records.length === 0) {
            mostrarEstado("records.vacio");
            return;
        }

        for (const record of records) {
            const fila = document.createElement("tr");
            fila.append(
                crearCelda(record.posicion),
                crearCelda(record.jugador),
                crearCelda(record.nivel),
                crearCelda(Number(record.puntos).toLocaleString(locale), true),
            );
            filas.append(fila);
        }
        mostrarEstado(null);
    }

    async function cargarRecords() {
        numeroPeticion++;
        const estaPeticion = numeroPeticion;
        const parametros = new URLSearchParams({ juego: selectorJuego.value, periodo });

        filas.replaceChildren();
        ultimosRecords = null;
        mostrarEstado("records.cargando");

        try {
            const respuesta = await fetch(`${contenedor.dataset.url}?${parametros}`, {
                headers: { Accept: "application/json" },
            });
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}`);
            }
            const datos = await respuesta.json();
            if (estaPeticion !== numeroPeticion) {
                return; // ya se ha pedido otra cosa
            }
            ultimosRecords = datos.records;
            pintarRecords(ultimosRecords);
        } catch (error) {
            if (estaPeticion === numeroPeticion) {
                console.warn("No s’han pogut carregar els rècords.", error);
                mostrarEstado("records.error");
            }
        }
    }

    // El nombre de cada juego en el desplegable también se traduce
    function traducirSelector() {
        for (const opcion of selectorJuego.options) {
            const numero = opcion.index + 1;
            opcion.textContent = `${numero} · ${textoTraducido(`juego.${opcion.value}.nombre`)}`;
        }
    }

    for (const boton of botonesPeriodo) {
        boton.addEventListener("click", () => {
            periodo = boton.dataset.periodo;
            for (const otro of botonesPeriodo) {
                otro.setAttribute("aria-pressed", String(otro === boton));
            }
            cargarRecords();
        });
    }

    selectorJuego.addEventListener("change", cargarRecords);

    document.addEventListener("idioma-cambiado", () => {
        traducirSelector();
        if (ultimosRecords !== null) {
            pintarRecords(ultimosRecords);
        } else {
            mostrarEstado(ultimoEstado);
        }
    });

    traducirSelector();
    cargarRecords();
});
