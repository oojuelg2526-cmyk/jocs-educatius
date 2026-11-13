// Clase básica para guardar la información de cada tarjeta (hito histórico)
class HitoHistorico {
    constructor(id, titulo, epoca, orden, pista) {
        this.id = id;
        this.titulo = titulo;
        this.epoca = epoca;
        this.orden = orden;
        this.pista = pista;
    }
}

// Clase para controlar las puntuaciones, errores y tiempo de la partida
class MetricasPartida {
    constructor() {
        this.errores = 0;
        this.pistasUsadas = 0;
        this.puntuacionFinal = 0;
        // RA3: Uso del objeto predefinido Date para registrar el inicio
        this.fechaInicio = new Date();
    }

    // RA3: Método que usa Date para calcular los segundos exactos jugados
    calcularTiempoTotal() {
        const ahora = new Date();
        return Math.floor((ahora - this.fechaInicio) / 1000);
    }
}

// Clase principal que maneja toda la lógica del juego
class JuegoLineaTiempo {
    constructor(datosNivel) {
        // RA3: Uso de map() de Array para instanciar nuestros propios objetos (RA4)
        this.hitos = datosNivel.map(dato => new HitoHistorico(dato.id, dato.title, dato.label, dato.order, dato.hint));
        this.metricas = new MetricasPartida();

        this.tiempoRestante = 85; // 1 minuto y 25 segundos
        this.puntos = 850;
        this.movimientos = 0;
        this.temporizador = null;

        // RA5: Asignar evento al botón de verificar usando función flecha
        document.getElementById("btn-verify").addEventListener("click", () => {
            this.comprobarOrden();
        });

        this.prepararTablero();
        this.iniciarReloj();
    }

    // =========================================================
    // RA6: Manipulación del DOM (crear elementos, leer atributos)
    // =========================================================
    prepararTablero() {
        const timeline = document.getElementById("timeline");
        const mazo = document.getElementById("cards-deck");

        // Clonamos los arrays para no modificar el original al ordenar
        const hitosOrdenados = [...this.hitos].sort((a, b) => a.orden - b.orden);
        // RA3: Math.random para desordenar las cartas en el mazo
        const hitosDesordenados = [...this.hitos].sort(() => Math.random() - 0.5);

        // 1. Crear los huecos (zonas de destino) en la regla del tiempo
        hitosOrdenados.forEach(hito => {
            const hueco = document.createElement("div"); // RA6
            hueco.classList.add("drop-zone");
            hueco.dataset.esperado = hito.orden;
            hueco.dataset.label = hito.epoca;

            this.asignarEventosDrop(hueco); // RA5
            timeline.appendChild(hueco); // RA6
        });

        // El mazo inicial también tiene que aceptar cartas por si el usuario se arrepiente y devuelve una
        this.asignarEventosDrop(mazo);

        // 2. Crear las tarjetas arrastrables
        hitosDesordenados.forEach(hito => {
            const carta = document.createElement("div"); // RA6
            carta.classList.add("history-card");
            carta.draggable = true; // RA6: Atributo nativo de HTML5 para habilitar Drag & Drop
            carta.id = hito.id;
            carta.dataset.orden = hito.orden;
            carta.dataset.pista = hito.pista;

            carta.innerHTML = `
        <div class="card-img"></div>
        <span class="card-title">${hito.titulo}</span>
      `;

            this.asignarEventosDrag(carta); // RA5
            mazo.appendChild(carta); // RA6
        });
    }

    // =========================================================
    // RA5: Gestión de eventos Drag & Drop nativo
    // =========================================================
    asignarEventosDrag(carta) {
        // Cuando empezamos a arrastrar la carta
        carta.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            e.dataTransfer.effectAllowed = "move";

            // Truco con setTimeout para que la imagen fantasma que genera el navegador se vea opaca
            setTimeout(() => { e.target.classList.add("dragging"); }, 0);

            // Mostrar la pista en el panel lateral al tocar la carta
            document.getElementById("hint-text").innerText = e.target.dataset.pista;
            this.metricas.pistasUsadas++;
        });

        // Cuando soltamos la carta (independientemente de dónde caiga)
        carta.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
        });
    }

    asignarEventosDrop(zona) {
        zona.addEventListener("dragenter", (e) => {
            e.preventDefault();
            // RA6: Buscar si el elemento cercano es un contenedor válido
            const destino = e.target.closest('.drop-zone, #cards-deck');
            if (destino) {
                destino.classList.add("drag-over");
            }
        });

        zona.addEventListener("dragover", (e) => {
            e.preventDefault(); // RA5: Muy importante prevenir el default para que se dispare el evento Drop
            e.dataTransfer.dropEffect = "move";
        });

        zona.addEventListener("dragleave", (e) => {
            const destino = e.target.closest('.drop-zone, #cards-deck');
            if (destino) {
                destino.classList.remove("drag-over");
            }
        });

        zona.addEventListener("drop", (e) => {
            e.preventDefault();
            const destino = e.target.closest('.drop-zone, #cards-deck');
            if (!destino) return;

            destino.classList.remove("drag-over");

            // Controlar que no haya ya una carta en ese hueco de la línea del tiempo
            if (destino.id !== "cards-deck" && destino.querySelector(".history-card")) {
                return; // Salimos de la función sin hacer nada
            }

            // Recuperamos el ID de la carta que estamos arrastrando
            const idCarta = e.dataTransfer.getData("text/plain");
            const cartaArrastrada = document.getElementById(idCarta);

            if (cartaArrastrada) {
                destino.appendChild(cartaArrastrada); // RA6: Movemos el elemento en el árbol del DOM

                // Actualizamos contadores visuales
                this.movimientos++;
                document.getElementById("moves-display").innerText = this.movimientos;
                this.actualizarPuntos(-5); // Restamos 5 puntos como pequeña penalización por movimiento
            }
        });
    }

    // =========================================================
    // RA2, RA3: Sentencias simples y uso de objetos predefinidos
    // =========================================================
    actualizarPuntos(cambio) {
        // RA3: Uso del objeto predefinido Math para que los puntos nunca sean negativos
        this.puntos = Math.max(0, this.puntos + cambio);
        document.getElementById("points-display").innerText = this.puntos;
    }

    iniciarReloj() {
        this.temporizador = setInterval(() => {
            this.tiempoRestante--;

            // RA3: Uso de String y padStart para que siempre salgan dos dígitos en el reloj (ej: 09)
            const minutos = String(Math.floor(this.tiempoRestante / 60)).padStart(2, '0');
            const segundos = String(this.tiempoRestante % 60).padStart(2, '0');
            document.getElementById("time-display").innerText = `${minutos}:${segundos}`;

            if (this.tiempoRestante <= 0) {
                clearInterval(this.temporizador);
                this.terminarJuego(false);
            }
        }, 1000);
    }

    comprobarOrden() {
        // RA6: querySelectorAll para buscar todos los huecos de la línea del tiempo
        const huecos = document.querySelectorAll("#timeline .drop-zone");
        let cartasCorrectas = 0;
        let hayErrores = false;

        // RA3: Iterar la estructura de datos
        huecos.forEach(hueco => {
            const carta = hueco.querySelector(".history-card");
            if (carta) {
                // Comparamos el dataset de la carta con el dataset del hueco
                if (carta.dataset.orden === hueco.dataset.esperado) {
                    cartasCorrectas++;
                    carta.style.borderColor = "var(--green)";
                } else {
                    carta.classList.add("error-shake");
                    carta.style.borderColor = "var(--red)";
                    setTimeout(() => carta.classList.remove("error-shake"), 400);
                    hayErrores = true;
                }
            } else {
                hayErrores = true; // Si entra aquí es que falta alguna carta por poner
            }
        });

        if (cartasCorrectas === this.hitos.length) {
            clearInterval(this.temporizador);
            this.terminarJuego(true);
        } else if (hayErrores) {
            this.metricas.errores++;
            this.actualizarPuntos(-50); // Penalización severa por fallar el intento de validación
        }
    }

    terminarJuego(victoria) {
        // Puntuación = puntos base + (segundos sobrantes * 2)
        this.metricas.puntuacionFinal = this.puntos + (this.tiempoRestante * 2);
        const tiempoReal = this.metricas.calcularTiempoTotal();

        const tituloFinal = document.getElementById("end-title");
        const mensajeFinal = document.getElementById("end-message");

        if (victoria) {
            tituloFinal.innerText = "¡Nivel Completado!";
            tituloFinal.style.color = "var(--green)";
            mensajeFinal.innerText = `Has recuperado la pieza.\nTiempo real jugado: ${tiempoReal}s\nPuntuación final: ${this.metricas.puntuacionFinal}\nErrores cometidos: ${this.metricas.errores}`;

            // Aquí se enviaría el objeto this.metricas al servidor (fetch/AJAX)
            console.log("Datos para guardar en la base de datos:", this.metricas);
        } else {
            tituloFinal.innerText = "Tiempo agotado";
            tituloFinal.style.color = "var(--red)";
            mensajeFinal.innerText = "Ildefons Cerdà tendrá que esperar. Inténtalo de nuevo.";
        }

        // RA6: Mostramos la pantalla final quitando el atributo hidden de la capa overlay
        document.getElementById("end-screen").removeAttribute("hidden");
    }
}

// =========================================================
// RA1, RA2: Inicio del script cliente
// =========================================================
const DATOS_NIVEL_3 = [
    { id: "m1", title: "Barcino romana", label: "Época romana", order: 1, hint: "Fundada por el emperador Augusto." },
    { id: "m2", title: "Murallas medievales", label: "S. XI-XV", order: 2, hint: "Protegían la ciudad durante la expansión gótica." },
    { id: "m3", title: "Exp. Universal", label: "1888", order: 3, hint: "Urbanizó el parque de la Ciutadella." },
    { id: "m4", title: "El Eixample", label: "1860s", order: 4, hint: "Ildefons Cerdà ideó esta cuadrícula." },
    { id: "m5", title: "Semana Trágica", label: "1909", order: 5, hint: "Revuelta popular con quema de edificios." },
    { id: "m6", title: "Exp. Internacional", label: "1929", order: 6, hint: "Desarrollo de la montaña de Montjuïc." },
    { id: "m7", title: "JJOO", label: "1992", order: 7, hint: "Abrió definitivamente la ciudad al mar." },
    { id: "m8", title: "Fórum Culturas", label: "2004", order: 8, hint: "Renovación de la zona de Diagonal Mar." }
];

document.addEventListener("DOMContentLoaded", () => {
    new JuegoLineaTiempo(DATOS_NIVEL_3);
});