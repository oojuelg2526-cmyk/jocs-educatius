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
    // Añadimos 'tiempo' y 'nivelActual' como parámetros
    constructor(datosNivel, tiempo, nivelActual) {
        this.hitos = datosNivel.map(dato => new HitoHistorico(dato.id, dato.title, dato.label, dato.order, dato.hint));
        this.metricas = new MetricasPartida();

        this.nivelActual = nivelActual;
        this.tiempoRestante = tiempo; // Asignación dinámica del tiempo
        this.puntos = 850;
        this.movimientos = 0;
        this.temporizador = null;

        // Limpiar event listeners previos clonando el botón para evitar que se acumulen clics de niveles anteriores
        const oldBtn = document.getElementById("btn-verify");
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        newBtn.addEventListener("click", () => {
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

        // Al superar el nivel anterior, limpiamos el tablero anterior antes de pasar al siguiente nivel
        timeline.innerHTML = '';
        mazo.innerHTML = '';

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

        // 2. Crear las tarjetas arrastrables sin usar innerHTML
        hitosDesordenados.forEach(hito => {
            const carta = document.createElement("div"); // RA6
            carta.classList.add("history-card");
            carta.draggable = true; // RA6: Atributo nativo de HTML5 para habilitar Drag & Drop
            carta.id = hito.id;
            carta.dataset.orden = hito.orden;
            carta.dataset.pista = hito.pista;

            // Creamos el div de la imagen
            const cardImg = document.createElement("div");
            cardImg.classList.add("card-img");

            // Creamos el span del título e insertamos el texto
            const cardTitle = document.createElement("span");
            cardTitle.classList.add("card-title");
            cardTitle.textContent = hito.titulo;

            // Añadimos los elementos como hijos de la carta
            carta.appendChild(cardImg);
            carta.appendChild(cardTitle);

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
        this.metricas.puntuacionFinal = this.puntos + (this.tiempoRestante * 2);
        const tiempoReal = this.metricas.calcularTiempoTotal();

        const tituloFinal = document.getElementById("end-title");
        const mensajeFinal = document.getElementById("end-message");
        const pantallaFinal = document.getElementById("end-screen");

        if (victoria) {
            tituloFinal.innerText = `¡Nivel ${this.nivelActual} Completado!`;
            tituloFinal.style.color = "var(--green)";
            mensajeFinal.innerText = `Tiempo real jugado: ${tiempoReal}s\nPuntuación final: ${this.metricas.puntuacionFinal}\nErrores cometidos: ${this.metricas.errores}`;

            pantallaFinal.removeAttribute("hidden");

            // Lógica de transición de niveles
            if (this.nivelActual === 1) {
                setTimeout(() => {
                    alert("¡Prepárate para el Nivel 2!");
                    pantallaFinal.setAttribute("hidden", true);
                    // Iniciamos Nivel 2: 6 hitos, tiempo moderado (90 segundos)
                    new JuegoLineaTiempo(DATOS_NIVEL_2, 90, 2);
                }, 3000);
            }
            else if (this.nivelActual === 2) {
                setTimeout(() => {
                    alert("¡Prepárate para el Nivel 3!");
                    pantallaFinal.setAttribute("hidden", true);
                    // Iniciamos Nivel 3: 8 hitos, tiempo reducido (60 segundos)
                    new JuegoLineaTiempo(DATOS_NIVEL_3, 60, 3);
                }, 3000);
            }
            else if (this.nivelActual === 3) {
                mensajeFinal.innerText += "\n\n¡Has completado todos los niveles!\nEl siguiente juego ha sido desbloqueado.";
                // Desbloqueamos el siguiente juego en localStorage
                localStorage.setItem("juego3Superado", "true");
            }

        } else {
            tituloFinal.innerText = "Tiempo agotado";
            tituloFinal.style.color = "var(--red)";
            mensajeFinal.innerText = "Inténtalo de nuevo.";
            pantallaFinal.removeAttribute("hidden");
        }
    }
}

// =========================================================
// RA1, RA2: Inicio del script cliente y Datos
// =========================================================

// Ajuste Nivel 1: 4 hitos históricos con amplia diferencia de siglos
const DATOS_NIVEL_1 = [
    { id: "m1", title: "Barcino romana", label: "Época romana", order: 1, hint: "Fundada por el emperador Augusto." },
    { id: "m2", title: "Murallas medievales", label: "S. XI-XV", order: 2, hint: "Protegían la ciudad durante la expansión gótica." },
    { id: "m3", title: "El Eixample", label: "1860s", order: 3, hint: "Ildefons Cerdà ideó esta cuadrícula." },
    { id: "m4", title: "JJOO", label: "1992", order: 4, hint: "Abrió definitivamente la ciudad al mar." }
];

// Ajuste Nivel 2: 6 hitos con eventos de la Edad Media, Moderna y Contemporánea.
const DATOS_NIVEL_2 = [
    { id: "m1", title: "Consell de Cent", label: "S. XIII", order: 1, hint: "Institución de autogobierno municipal de Barcelona." },
    { id: "m2", title: "Generalitat", label: "S. XIV", order: 2, hint: "Nace como diputación del General de Catalunya." },
    { id: "m3", title: "Guerra de Sucesión", label: "1714", order: 3, hint: "Caída de Barcelona y Decreto de Nueva Planta." },
    { id: "m4", title: "Revolución Industrial", label: "S. XIX", order: 4, hint: "Instalación de las primeras fábricas de vapor (Vapor Vell)." },
    { id: "m5", title: "Exposición Universal", label: "1888", order: 5, hint: "Urbanización del parque de la Ciutadella." },
    { id: "m6", title: "Segunda República", label: "1931", order: 6, hint: "Proclamación de la República desde el balcón de la Generalitat." }
];

// Ajuste Nivel 3: 8 hitos históricos con fechas más cercanas entre sí. Tiempo reducido y mayor exigencia de precisión.[cite: 1]
const DATOS_NIVEL_3 = [
    { id: "m1", title: "Semana Trágica", label: "1909", order: 1, hint: "Revuelta popular antimilitarista." },
    { id: "m2", title: "Mancomunidad", label: "1914", order: 2, hint: "Agrupación de las 4 diputaciones." },
    { id: "m3", title: "Exposición Internacional", label: "1929", order: 3, hint: "Urbanización de la montaña de Montjuïc." },
    { id: "m4", title: "Inicio Guerra Civil", label: "1936", order: 4, hint: "Fracaso del golpe de estado en la ciudad." },
    { id: "m5", title: "Bombardeos aéreos", label: "1938", order: 5, hint: "Ataques sistemáticos sobre la población civil." },
    { id: "m6", title: "Caída de Barcelona", label: "1939", order: 6, hint: "Entrada de las tropas franquistas." },
    { id: "m7", title: "Huelga de Tranvías", label: "1951", order: 7, hint: "Boicot ciudadano por la subida del billete." },
    { id: "m8", title: "Asamblea de Catalunya", label: "1971", order: 8, hint: "Plataforma unitaria antifranquista." }
];

document.addEventListener("DOMContentLoaded", () => {
    // Recuperamos el estado del juego anterior (asumiendo que se guardó al ganarlo)
    const juegoAnteriorSuperado = localStorage.getItem("juego2Superado") === "true";

    if (juegoAnteriorSuperado) {
        // Ejecutamos el juego solo si el anterior está superado. Pasamos los parámetros correctos.
        new JuegoLineaTiempo(DATOS_NIVEL_1, 120, 1);
    } else {
        // Mostrar mensaje si el usuario intenta acceder sin permiso
        alert("🔒 Este juego está bloqueado. Supera el juego anterior para jugar.");
    }
});