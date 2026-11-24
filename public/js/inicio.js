// Portada: dibuja las piezas del plano que ya se han recuperado.
// Cada juego superado deja "juegoNSuperado" = "true" en localStorage;
// ultimoJuegoSuperado() (de progresion.js) dice hasta qué juego se ha llegado sin saltarse ninguno.
document.addEventListener("DOMContentLoaded", () => {
    const piezas = document.querySelectorAll("[data-pieza]");
    const estado = document.getElementById("plano-estado");

    function pintarPlano() {
        const recuperadas = ultimoJuegoSuperado();

        for (const pieza of piezas) {
            const numero = Number(pieza.dataset.pieza);
            pieza.dataset.recuperada = String(numero <= recuperadas);
        }
        estado.textContent = textoTraducido("plano.estado", { n: recuperadas });
    }

    document.addEventListener("idioma-cambiado", pintarPlano);
    // Al volver de un juego con «atrás» el progreso puede haber cambiado
    window.addEventListener("pageshow", pintarPlano);
    pintarPlano();
});
