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
        this.fechaInicio = new Date();
    }

    calcularTiempoTotal() {
        const ahora = new Date();
        return Math.floor((ahora - this.fechaInicio) / 1000);
    }
}

// Clase principal que maneja toda la lógica del juego
class JuegoLineaTiempo {
    constructor(datosNivel) {
        this.hitos = datosNivel.map(dato => new HitoHistorico(dato.id, dato.title, dato.label, dato.order, dato.hint));
        this.metricas = new MetricasPartida();

        // Nivel 1: Tiempo holgado (3 minutos)
        this.tiempoRestante = 180;
        this.puntos = 850;
        this.movimientos = 0;
        this.temporizador = null;

        document.getElementById("btn-verify").addEventListener("click", () => {
            this.comprobarOrden();
        });

        this.prepararTablero();
        this.iniciarReloj();
    }

    prepararTablero() {
        const timeline = document.getElementById("timeline");
        const mazo = document.getElementById("cards-deck");

        const hitosOrdenados = [...this.hitos].sort((a, b) => a.orden - b.orden);
        const hitosDesordenados = [...this.hitos].sort(() => Math.random() - 0.5);

        hitosOrdenados.forEach(hito => {
            const hueco = document.createElement("div");
            hueco.classList.add("drop-zone");
            hueco.dataset.esperado = hito.orden;
            hueco.dataset.label = hito.epoca;

            this.asignarEventosDrop(hueco);
            timeline.appendChild(hueco);
        });

        this.asignarEventosDrop(mazo);

        hitosDesordenados.forEach(hito => {
            const carta = document.createElement("div");
            carta.classList.add("history-card");
            carta.draggable = true;
            carta.id = hito.id;
            carta.dataset.orden = hito.orden;
            carta.dataset.pista = hito.pista;

            const cardImg = document.createElement("div");
            cardImg.classList.add("card-img");

            const cardTitle = document.createElement("span");
            cardTitle.classList.add("card-title");
            cardTitle.textContent = hito.titulo;

            carta.appendChild(cardImg);
            carta.appendChild(cardTitle);

            this.asignarEventosDrag(carta);
            mazo.appendChild(carta);
        });
    }

    asignarEventosDrag(carta) {
        carta.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.id);
            e.dataTransfer.effectAllowed = "move";
            setTimeout(() => { e.target.classList.add("dragging"); }, 0);
            document.getElementById("hint-text").innerText = e.target.dataset.pista;
            this.metricas.pistasUsadas++;
        });

        carta.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
        });
    }

    asignarEventosDrop(zona) {
        zona.addEventListener("dragenter", (e) => {
            e.preventDefault();
            const destino = e.target.closest('.drop-zone, #cards-deck');
            if (destino) destino.classList.add("drag-over");
        });

        zona.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });

        zona.addEventListener("dragleave", (e) => {
            const destino = e.target.closest('.drop-zone, #cards-deck');
            if (destino) destino.classList.remove("drag-over");
        });

        zona.addEventListener("drop", (e) => {
            e.preventDefault();
            const destino = e.target.closest('.drop-zone, #cards-deck');
            if (!destino) return;

            destino.classList.remove("drag-over");

            if (destino.id !== "cards-deck" && destino.querySelector(".history-card")) return;

            const idCarta = e.dataTransfer.getData("text/plain");
            const cartaArrastrada = document.getElementById(idCarta);

            if (cartaArrastrada) {
                destino.appendChild(cartaArrastrada);
                this.movimientos++;
                document.getElementById("moves-display").innerText = this.movimientos;
                this.actualizarPuntos(-5);
            }
        });
    }

    actualizarPuntos(cambio) {
        this.puntos = Math.max(0, this.puntos + cambio);
        document.getElementById("points-display").innerText = this.puntos;
    }

    iniciarReloj() {
        this.temporizador = setInterval(() => {
            this.tiempoRestante--;
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
        const huecos = document.querySelectorAll("#timeline .drop-zone");
        let cartasCorrectas = 0;
        let hayErrores = false;

        huecos.forEach(hueco => {
            const carta = hueco.querySelector(".history-card");
            if (carta) {
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
                hayErrores = true;
            }
        });

        if (cartasCorrectas === this.hitos.length) {
            clearInterval(this.temporizador);
            this.terminarJuego(true);
        } else if (hayErrores) {
            this.metricas.errores++;
            this.actualizarPuntos(-50);
        }
    }

    terminarJuego(victoria) {
        this.metricas.puntuacionFinal = this.puntos + (this.tiempoRestante * 2);
        const tiempoReal = this.metricas.calcularTiempoTotal();
        const tituloFinal = document.getElementById("end-title");
        const mensajeFinal = document.getElementById("end-message");

        if (victoria) {
            tituloFinal.innerText = "¡Nivel Completado!";
            tituloFinal.style.color = "var(--green)";
            mensajeFinal.innerText = `Has recuperado la pieza.\nTiempo real jugado: ${tiempoReal}s\nPuntuación final: ${this.metricas.puntuacionFinal}\nErrores cometidos: ${this.metricas.errores}`;
            console.log("Datos para guardar en la base de datos:", this.metricas);
        } else {
            tituloFinal.innerText = "Tiempo agotado";
            tituloFinal.style.color = "var(--red)";
            mensajeFinal.innerText = "Inténtalo de nuevo.";
        }

        document.getElementById("end-screen").removeAttribute("hidden");
    }
}

// =========================================================
// Nivel 1: 4 hitos con amplia diferencia de siglos
// =========================================================
const DATOS_NIVEL_1 = [
    { id: "m1", title: "Barcino romana", label: "Época romana", order: 1, hint: "Fundada por el emperador Augusto." },
    { id: "m2", title: "Murallas medievales", label: "S. XI-XV", order: 2, hint: "Protegían la ciudad durante la expansión gótica." },
    { id: "m3", title: "El Eixample", label: "1860s", order: 3, hint: "Ildefons Cerdà ideó esta cuadrícula." },
    { id: "m4", title: "JJOO", label: "1992", order: 4, hint: "Abrió definitivamente la ciudad al mar." }
];

document.addEventListener("DOMContentLoaded", () => {
    // Al ser el Nivel 1, no necesita comprobar si se ha superado ningún nivel anterior
    new JuegoLineaTiempo(DATOS_NIVEL_1);
});