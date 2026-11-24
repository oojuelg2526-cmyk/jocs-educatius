document.addEventListener("DOMContentLoaded", () => {
    const textos = {
        ca: {
            idioma: "Idioma", acceso: "Accés al compte", administracion: "Administració",
            titulo: "Ildefons Cerdà ha perdut el plànol",
            historia: "Recupera les quatre peces del plànol de Barcelona. Cada joc superat obre el següent.",
            publico: "Una aventura per a joves i adults de Barcelona.",
            juegos: ["Memory de Barcelona", "Reconstruïm l’Eixample", "La línia del temps", "El laberint del metro"],
            disponible: "Disponible", bloquejat: "Bloquejat", superat: "Superat"
        },
        es: {
            idioma: "Idioma", acceso: "Acceso a la cuenta", administracion: "Administración",
            titulo: "Ildefons Cerdà ha perdido el plano",
            historia: "Recupera las cuatro piezas del plano de Barcelona. Cada juego superado abre el siguiente.",
            publico: "Una aventura para jóvenes y adultos de Barcelona.",
            juegos: ["Memory de Barcelona", "Reconstruimos el Eixample", "La línea del tiempo", "El laberinto del metro"],
            disponible: "Disponible", bloquejat: "Bloqueado", superat: "Superado"
        },
        en: {
            idioma: "Language", acceso: "Account login", administracion: "Administration",
            titulo: "Ildefons Cerdà has lost the map",
            historia: "Recover the four pieces of Barcelona’s map. Finish each game to unlock the next.",
            publico: "An adventure for young people and adults in Barcelona.",
            juegos: ["Barcelona Memory", "Rebuild the Eixample", "The timeline", "The metro maze"],
            disponible: "Available", bloquejat: "Locked", superat: "Completed"
        }
    };
    const selector = document.getElementById("idioma");
    const filas = document.querySelectorAll("[data-juego]");
    const etiquetas = document.querySelectorAll("[data-texto]");

    function mostrarPortada() {
        const guardado = localStorage.getItem("cerda_lang");
        const idioma = Object.hasOwn(textos, guardado) ? guardado : "ca";
        const texto = textos[idioma];
        const ultimo = ultimoJuegoSuperado();
        selector.value = idioma;
        document.documentElement.lang = idioma;
        document.title = texto.titulo;
        for (const etiqueta of etiquetas) {
            etiqueta.textContent = texto[etiqueta.dataset.texto];
        }

        for (const fila of filas) {
            const numero = Number(fila.dataset.juego);
            if (isNaN(numero)) {
                continue;
            }
            const enlace = fila.querySelector("a");
            let estado = "disponible";
            if (numero <= ultimo) {
                estado = "superat";
            } else if (numero > ultimo + 1) {
                estado = "bloquejat";
            }
            enlace.textContent = texto.juegos[numero - 1];
            if (estado === "bloquejat") {
                enlace.removeAttribute("href");
            } else {
                enlace.href = enlace.dataset.ruta;
            }
            if (estado === "disponible") {
                enlace.setAttribute("aria-current", "step");
            } else {
                enlace.removeAttribute("aria-current");
            }
            fila.dataset.estat = estado;
            fila.querySelector("span").textContent = texto[estado];
        }
    }

    selector.addEventListener("change", () => {
        localStorage.setItem("cerda_lang", selector.value);
        mostrarPortada();
    });
    window.addEventListener("pageshow", mostrarPortada);
    mostrarPortada();
});
