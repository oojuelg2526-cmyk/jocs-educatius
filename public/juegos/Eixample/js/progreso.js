import { niveles } from "./juego.js";

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
    let juego = {};
    try {
        const progreso = leerDatosCompartidos();
        const juegos = progreso.games ?? {};
        juego = juegos[ID_EIXAMPLE] ?? {};
    } catch (error) {
        console.warn("No s’ha pogut llegir el progrés de l’Eixample.", error);
    }

    return {
        ...juego,
        status: juego.status ?? "unlocked",
        last_level_completed: juego.last_level_completed ?? 0,
        level_scores: juego.level_scores ?? {},
        partidas: juego.partidas ?? {}
    };
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

export function registrarVictoria(progreso, id, puntos) {
    progreso.last_level_completed = Math.max(progreso.last_level_completed, id);
    const marcaAnterior = progreso.level_scores[id] ?? 0;
    progreso.level_scores[id] = Math.max(marcaAnterior, puntos);

    let total = 0;
    for (const nivel of niveles) {
        total += progreso.level_scores[nivel.id] ?? 0;
    }
    progreso.best_score = total;
    if (progreso.last_level_completed === niveles.length) {
        progreso.status = "completed";
    }
}
