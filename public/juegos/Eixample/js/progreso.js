const CLAVE_PROGRESO = "cerda_progress";
const ID_EIXAMPLE = 2;

function leerDatosCompartidos() {
    return JSON.parse(localStorage.getItem(CLAVE_PROGRESO)) ?? {};
}

export function memorySuperado() {
    try {
        if (localStorage.getItem("juego1Superado") === "true") {
            return true;
        }

        // Les partides antigues poden desar la victòria directament o dins de status.
        const progreso = leerDatosCompartidos();
        const juegos = progreso.games ?? {};
        const memory = juegos[1];

        if (memory === "completed" || memory?.status === "completed") {
            localStorage.setItem("juego1Superado", "true");
            return true;
        }
    } catch (error) {
        console.warn("No s’ha pogut llegir el progrés de Memory.", error);
    }
    return false;
}

export function leerProgreso() {
    try {
        const progreso = leerDatosCompartidos();
        const juegos = progreso.games ?? {};
        return juegos[ID_EIXAMPLE] ?? {};
    } catch (error) {
        console.warn("No s’ha pogut llegir el progrés de l’Eixample.", error);
        return {};
    }
}

export function guardarProgreso(juego) {
    try {
        // Tornem a llegir el progrés compartit per conservar les dades dels altres jocs.
        const progreso = leerDatosCompartidos();
        progreso.games = progreso.games ?? {};
        progreso.games[ID_EIXAMPLE] = juego;
        localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));

        if (juego.status === "completed") {
            localStorage.setItem("juego2Superado", "true");
        }
    } catch (error) {
        console.warn("No s’ha pogut desar el progrés de l’Eixample.", error);
    }
}
