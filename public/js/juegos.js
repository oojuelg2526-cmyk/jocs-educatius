// Página de juegos: marca cada tarjeta como Superado, Disponible o Bloqueado.
// Se juega en orden: superados los juegos 1..N, el N+1 está disponible y los siguientes, bloqueados.
document.addEventListener("DOMContentLoaded", () => {
    const tarjetas = document.querySelectorAll("[data-juego]");

    function estadoDelJuego(numero, ultimoSuperado) {
        if (numero <= ultimoSuperado) {
            return "superado";
        }
        if (numero === ultimoSuperado + 1) {
            return "disponible";
        }
        return "bloqueado";
    }

    function pintarTarjeta(tarjeta, estado) {
        const etiqueta = tarjeta.querySelector(".etiqueta");
        const enlace = tarjeta.querySelector("[data-enlace]");
        const icono = tarjeta.querySelector(".juego-imagen");

        tarjeta.dataset.estado = estado;
        etiqueta.classList.remove("etiqueta-superado", "etiqueta-disponible", "etiqueta-bloqueado");
        etiqueta.classList.add(`etiqueta-${estado}`);
        etiqueta.textContent = textoTraducido(`estado.${estado}`);
        icono.textContent = estado === "bloqueado" ? "🔒" : icono.dataset.icono;

        enlace.classList.toggle("boton-principal", estado === "disponible");
        enlace.classList.toggle("boton-bloqueado", estado === "bloqueado");

        if (estado === "bloqueado") {
            // Sin href el enlace no se puede abrir ni recibe el foco
            enlace.removeAttribute("href");
            enlace.setAttribute("aria-disabled", "true");
            enlace.textContent = textoTraducido("boton.bloqueado");
        } else {
            enlace.href = enlace.dataset.enlace;
            enlace.removeAttribute("aria-disabled");
            enlace.textContent = textoTraducido(estado === "disponible" ? "boton.jugar" : "boton.rejugar");
        }
    }

    function pintarJuegos() {
        const ultimo = ultimoJuegoSuperado();
        for (const tarjeta of tarjetas) {
            const numero = Number(tarjeta.dataset.juego);
            pintarTarjeta(tarjeta, estadoDelJuego(numero, ultimo));
        }
    }

    document.addEventListener("idioma-cambiado", pintarJuegos);
    window.addEventListener("pageshow", pintarJuegos);
    pintarJuegos();
});
