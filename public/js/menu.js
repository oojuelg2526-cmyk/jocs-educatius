// Menú plegable de la cabecera en pantallas estrechas.
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("boton-menu");
    const menu = document.getElementById("menu");
    if (!boton || !menu) {
        return;
    }

    function abrirOCerrar(abrir) {
        boton.setAttribute("aria-expanded", String(abrir));
        menu.dataset.abierto = String(abrir);
    }

    boton.addEventListener("click", () => {
        const estaAbierto = boton.getAttribute("aria-expanded") === "true";
        abrirOCerrar(!estaAbierto);
    });

    // Con Escape se cierra y el foco vuelve al botón
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
            abrirOCerrar(false);
            boton.focus();
        }
    });
});
