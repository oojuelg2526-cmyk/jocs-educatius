import { nivells, textos } from "./dades.js";

document.addEventListener("DOMContentLoaded", () => {
    const tauler = document.getElementById("tauler");
    const idioma = document.getElementById("idioma");
    const avis = document.getElementById("avis");
    const desfer = document.getElementById("desfer");
    const seguent = document.getElementById("seguent");
    const botonsNivell = document.querySelectorAll("[data-nivell]");
    const etiquetes = document.querySelectorAll("[data-text]");
    const clau = "cerda_tracat";

    let numero = 0;
    let desbloquejat = 0;
    let nivell;
    let mida;
    let origen;
    let desti;
    let placa;
    let caselles = [];
    let cami = [];
    let guanyat = false;
    let missatge = "inici";
    let estat = "informacio";
    let llengua = textos.ca;
    let punter = null;
    let xAnterior;
    let yAnterior;

    function llegirProgres() {
        try {
            return JSON.parse(localStorage.getItem(clau)) ?? {};
        } catch (error) {
            console.warn("No s’ha pogut llegir el traçat desat.", error);
            return {};
        }
    }

    function desarProgres() {
        try {
            localStorage.setItem(clau, JSON.stringify({ numero, desbloquejat, cami }));
        } catch (error) {
            console.warn("No s’ha pogut desar el traçat.", error);
        }
    }

    function darreraCasella() {
        return cami[cami.length - 1] ?? origen;
    }

    // La distància pels carrers suma el canvi de fila i el de columna.
    function distancia(posicio, altra) {
        const files = Math.abs(Math.floor(posicio / mida) - Math.floor(altra / mida));
        const columnes = Math.abs(posicio % mida - altra % mida);
        return files + columnes;
    }

    function errorDePas(posicio) {
        if (!Number.isInteger(posicio) || posicio < 0 || posicio >= caselles.length) {
            return "fora";
        }
        if (cami.length === 0) {
            return posicio === origen ? null : "inici";
        }
        if (distancia(posicio, darreraCasella()) !== 1) {
            return "costat";
        }
        if (caselles[posicio].dataset.tipus === "verd") {
            return "protegida";
        }
        if (cami.includes(posicio)) {
            return "repetida";
        }
        if (posicio === desti && nivell.placa && !cami.includes(placa)) {
            return "faltaPlaca";
        }
        // Abans de fer un pas, comptem si encara queda prou marge per arribar-hi.
        if (nivell.limit && cami.length + distancia(posicio, desti) > nivell.limit) {
            return "massaVolta";
        }
        return null;
    }

    function mostrarAvis(clauAvis, estatAvis = "informacio") {
        missatge = clauAvis;
        estat = estatAvis;
        let text = llengua[missatge];
        if (missatge === "victoria") {
            text = llengua.missions[numero].victoria;
        }
        if (avis.textContent !== text) {
            avis.textContent = text;
        }
        avis.dataset.estat = estat;
    }

    function marcarTram(casella, posicio, veina) {
        if (veina === posicio - mida) {
            casella.classList.add("nord");
        } else if (veina === posicio + mida) {
            casella.classList.add("sud");
        } else if (veina === posicio - 1) {
            casella.classList.add("oest");
        } else if (veina === posicio + 1) {
            casella.classList.add("est");
        }
    }

    function pintarTauler() {
        for (const casella of caselles) {
            const posicio = Number(casella.dataset.posicio);
            const index = cami.indexOf(posicio);
            const formaPart = index !== -1;
            casella.classList.remove("nord", "sud", "est", "oest");
            casella.classList.toggle("tracada", formaPart);
            casella.tabIndex = posicio === darreraCasella() ? 0 : -1;

            const fila = Math.floor(posicio / mida) + 1;
            const columna = posicio % mida + 1;
            const tipus = llengua[casella.dataset.tipus];
            let nom = `${llengua.fila} ${fila}, ${llengua.columna} ${columna} · ${tipus}`;
            if (formaPart) {
                marcarTram(casella, posicio, cami[index - 1]);
                marcarTram(casella, posicio, cami[index + 1]);
                nom += ` · ${llengua.tracat}`;
            }
            casella.setAttribute("aria-label", nom);
        }

        const passos = Math.max(0, cami.length - 1);
        let textPassos = `${llengua.passos} · ${passos}`;
        if (nivell.limit) {
            textPassos += ` / ${nivell.limit}`;
        }
        document.getElementById("passos").textContent = textPassos;
        desfer.disabled = cami.length < 2 || guanyat;
        seguent.hidden = !guanyat || numero === nivells.length - 1;

        for (const boto of botonsNivell) {
            const id = Number(boto.dataset.nivell);
            boto.disabled = id > desbloquejat;
            boto.setAttribute("aria-current", id === numero ? "step" : "false");
        }
    }

    function pintarTextos() {
        for (const element of etiquetes) {
            element.textContent = llengua[element.dataset.text];
        }
        document.querySelector("[data-etiqueta='nivells']").setAttribute("aria-label", llengua.nivells);
        const missio = llengua.missions[numero];
        document.getElementById("missio").textContent = missio.titol;
        document.getElementById("objectiu").textContent = missio.objectiu;
        document.getElementById("explicacio").textContent = missio.motiu;
        document.getElementById("llegenda-verd").hidden = !nivell.verd;
        document.getElementById("llegenda-placa").hidden = !nivell.placa;
        mostrarAvis(missatge, estat);
    }

    function carregarNivell(id, camiDesat = []) {
        numero = id;
        nivell = nivells[id];
        mida = nivell.mapa.length;
        placa = -1;
        cami = [];
        caselles = [];
        guanyat = false;
        missatge = "inici";
        estat = "informacio";
        punter = null;

        while (tauler.firstElementChild) {
            tauler.firstElementChild.remove();
        }
        tauler.dataset.mida = String(mida);

        for (const fila of nivell.mapa) {
            for (const marca of fila) {
                const posicio = caselles.length;
                const casella = document.createElement("button");
                casella.type = "button";
                casella.classList.add("casella");
                casella.dataset.posicio = String(posicio);
                casella.dataset.tipus = "carrer";

                const simbol = document.createElement("span");
                simbol.setAttribute("aria-hidden", "true");
                if (marca === "S") {
                    origen = posicio;
                    casella.dataset.tipus = "origen";
                    simbol.textContent = "●";
                } else if (marca === "F") {
                    desti = posicio;
                    casella.dataset.tipus = "desti";
                    simbol.textContent = "◆";
                } else if (marca === "V") {
                    casella.dataset.tipus = "verd";
                    simbol.textContent = "▧";
                } else if (marca === "P") {
                    placa = posicio;
                    casella.dataset.tipus = "placa";
                    simbol.textContent = "✚";
                }
                casella.appendChild(simbol);
                tauler.appendChild(casella);
                caselles.push(casella);
            }
        }

        // Recorrem el camí desat amb les mateixes regles que una jugada.
        for (const posicio of camiDesat) {
            if (guanyat || errorDePas(posicio) !== null) {
                break;
            }
            cami.push(posicio);
            guanyat = posicio === desti;
        }
        if (guanyat) {
            missatge = "victoria";
            estat = "correcte";
        } else if (cami.length > 0) {
            missatge = "seguint";
        }

        pintarTextos();
        pintarTauler();
    }

    function treurePas() {
        cami.pop();
        mostrarAvis("desfet");
        pintarTauler();
        desarProgres();
    }

    // El punter i el teclat entren aquí. Només canviem el camí si el pas és vàlid.
    function intentarPas(posicio) {
        if (guanyat) {
            return false;
        }
        if (cami.length > 0 && posicio === darreraCasella()) {
            return true;
        }
        if (cami.length > 1 && posicio === cami[cami.length - 2]) {
            treurePas();
            return true;
        }

        const error = errorDePas(posicio);
        if (error !== null) {
            mostrarAvis(error, "error");
            return false;
        }

        cami.push(posicio);
        if (posicio === desti) {
            guanyat = true;
            desbloquejat = Math.max(desbloquejat, Math.min(numero + 1, nivells.length - 1));
            mostrarAvis("victoria", "correcte");
        } else if (posicio === placa) {
            mostrarAvis("continuaPlaca", "correcte");
        } else {
            mostrarAvis("seguint");
        }

        pintarTauler();
        desarProgres();
        return true;
    }

    function posicioA(x, y) {
        const element = document.elementFromPoint(x, y);
        if (element && tauler.contains(element)) {
            const casella = element.closest("[data-posicio]");
            if (casella) {
                return Number(casella.dataset.posicio);
            }
        }
        return -1;
    }

    tauler.addEventListener("pointerdown", event => {
        if (punter !== null || !event.isPrimary || event.button !== 0) {
            return;
        }
        const posicio = posicioA(event.clientX, event.clientY);
        if (posicio === -1) {
            return;
        }

        event.preventDefault();
        if (intentarPas(posicio)) {
            punter = event.pointerId;
            xAnterior = event.clientX;
            yAnterior = event.clientY;
        }
    });

    document.addEventListener("pointermove", event => {
        if (event.pointerId !== punter || guanyat) {
            return;
        }
        const dx = event.clientX - xAnterior;
        const dy = event.clientY - yAnterior;
        const distanciaPunter = Math.max(Math.abs(dx), Math.abs(dy));
        const mostres = Math.ceil(distanciaPunter / (caselles[0].offsetWidth / 4));
        let darreraMostra = posicioA(xAnterior, yAnterior);

        // Prenem mostres entre dos moviments per no saltar una casella si el gest és ràpid.
        for (let pas = 1; pas <= mostres; pas++) {
            const x = xAnterior + dx * pas / mostres;
            const y = yAnterior + dy * pas / mostres;
            const posicio = posicioA(x, y);
            if (posicio !== darreraMostra) {
                if (!intentarPas(posicio)) {
                    break;
                }
                darreraMostra = posicio;
            }
        }
        xAnterior = event.clientX;
        yAnterior = event.clientY;
    });

    function acabarGest(event) {
        if (event.pointerId === punter) {
            punter = null;
        }
    }
    document.addEventListener("pointerup", acabarGest);
    document.addEventListener("pointercancel", acabarGest);
    window.addEventListener("blur", () => {
        punter = null;
    });

    tauler.addEventListener("click", event => {
        const casella = event.target.closest("[data-posicio]");
        // El clic del punter ja es resol a pointerdown. Retorn i Espai generen un clic sense recompte.
        if (casella && event.detail === 0) {
            intentarPas(Number(casella.dataset.posicio));
            caselles[darreraCasella()].focus();
        }
    });

    tauler.addEventListener("keydown", event => {
        const ultima = darreraCasella();
        const fila = Math.floor(ultima / mida);
        const columna = ultima % mida;
        let posicio = -1;

        if (event.key === "ArrowUp") {
            if (fila > 0) posicio = ultima - mida;
        } else if (event.key === "ArrowDown") {
            if (fila < mida - 1) posicio = ultima + mida;
        } else if (event.key === "ArrowLeft") {
            if (columna > 0) posicio = ultima - 1;
        } else if (event.key === "ArrowRight") {
            if (columna < mida - 1) posicio = ultima + 1;
        } else {
            return;
        }

        event.preventDefault();
        if (cami.length === 0) {
            intentarPas(origen);
        }
        if (intentarPas(posicio)) {
            caselles[darreraCasella()].focus();
        }
    });

    function obrirNivell(id) {
        carregarNivell(id);
        desarProgres();
        caselles[origen].focus();
    }

    for (const boto of botonsNivell) {
        boto.addEventListener("click", () => {
            const id = Number(boto.dataset.nivell);
            if (id !== numero && id <= desbloquejat) {
                obrirNivell(id);
            }
        });
    }
    document.getElementById("reiniciar").addEventListener("click", () => obrirNivell(numero));
    seguent.addEventListener("click", () => obrirNivell(numero + 1));
    desfer.addEventListener("click", () => {
        treurePas();
        if (desfer.disabled) {
            caselles[darreraCasella()].focus();
        }
    });

    function aplicarIdioma(codi) {
        if (codi !== "ca" && codi !== "es" && codi !== "en") {
            codi = "ca";
        }
        llengua = textos[codi];
        document.documentElement.lang = codi;
        idioma.value = codi;
    }

    let codiDesat = "ca";
    try {
        codiDesat = localStorage.getItem("cerda_lang") ?? "ca";
    } catch (error) {
        console.warn("No s’ha pogut recuperar l’idioma.", error);
    }
    aplicarIdioma(codiDesat);
    idioma.addEventListener("change", () => {
        aplicarIdioma(idioma.value);
        pintarTextos();
        pintarTauler();
        try {
            localStorage.setItem("cerda_lang", idioma.value);
        } catch (error) {
            console.warn("No s’ha pogut desar l’idioma.", error);
        }
    });

    const progres = llegirProgres();
    if (Number.isInteger(progres.desbloquejat) && nivells[progres.desbloquejat]) {
        desbloquejat = progres.desbloquejat;
    }
    if (Number.isInteger(progres.numero) && nivells[progres.numero] && progres.numero <= desbloquejat) {
        numero = progres.numero;
    }
    const camiDesat = Array.isArray(progres.cami) ? progres.cami : [];
    carregarNivell(numero, camiDesat);
});
