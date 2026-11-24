const CLAVE_PROGRESO = "cerda_progress";
const ID_JUEGO = 2;

export function leerProgreso() {
    try {
        const progreso = JSON.parse(localStorage.getItem(CLAVE_PROGRESO));
        return progreso?.games?.[ID_JUEGO] ?? {};
    } catch (error) {
        console.warn("No s’ha pogut llegir el progrés de l’Eixample.", error);
        return {};
    }
}

export function guardarProgreso(juego) {
    try {
        const progreso = JSON.parse(localStorage.getItem(CLAVE_PROGRESO)) ?? {};
        progreso.games = { ...progreso.games, [ID_JUEGO]: juego };
        localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));

        if (juego.status === "completed") {
            localStorage.setItem("juego2Superado", "true");
        }
    } catch (error) {
        console.warn("No s’ha pogut desar el progrés de l’Eixample.", error);
    }
}
