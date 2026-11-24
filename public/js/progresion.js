// Les primeres partides de Memory només desaven la victòria a cerda_progress.
const ultimoJuegoSuperado = () => {
    let ultimo = 0;
    try {
        if (localStorage.getItem("juego1Superado") !== "true") {
            const progreso = JSON.parse(localStorage.getItem("cerda_progress"));
            if (progreso?.games?.[1]?.status === "completed") {
                localStorage.setItem("juego1Superado", "true");
            }
        }

        for (let juego = 1; juego <= 4; juego++) {
            if (localStorage.getItem(`juego${juego}Superado`) !== "true") {
                break;
            }
            ultimo = juego;
        }
    } catch (error) {
        console.warn("No s’ha pogut llegir el progrés del plànol.", error);
    }
    return ultimo;
};
