// Todos los textos del juego, en catalán, castellano e inglés.
// Los textos nunca van dentro del código: se piden con t("clave").

const TEXTS = {
  es: {
    title: "Laberinto de metro",
    language: "Idioma",
    skip: "Saltar al contenido",
    brand: "Cerdà perdió el plano",
    footer: "Juego 4 de 4 · Historia y geografía de Barcelona",
    level: "Nivel",
    level1_name: "Primer viaje",
    st_U: "Universitat", st_C: "Catalunya", st_R: "Urquinaona",
    fact_U: "Universitat está junto a la Universitat de Barcelona y tiene las líneas L1 y L2.",
    fact_C: "La plaza de Catalunya es donde el Eixample se une con la ciudad vieja.",
    fact_R: "En la plaza de Urquinaona está nuestro centro de estudios.",
    mission: "Misión",
    mission_text: "{from} → {to}. Recoge todos los trozos del plano por el camino.",
    pieces: "Trozos del plano",
    time: "Tiempo",
    moves: "Movimientos",
    points: "Puntos",
    help: "Mirar el plano (−50)",
    help_hint: "Enseña los nombres durante 3 segundos.",
    restart: "Empezar de nuevo",
    again: "Jugar otra vez",
    close: "Cerrar",
    controls: "Mueve la ficha con las flechas o WASD.",
    msg_start: "Estás en {station}, en la línea L1. Mueve la ficha por la vía.",
    msg_wall: "Por ahí no hay vía.",
    msg_piece: "¡Has encontrado un trozo del plano!",
    msg_missing: "Te faltan {n} trozos del plano antes de salir.",
    win_title: "¡Nivel superado!",
    win_text: "{moves} movimientos · {points} puntos",
    stars: "{n} de 3 estrellas",
  },
  ca: {
    title: "Laberint de metro",
    language: "Idioma",
    skip: "Salta al contingut",
    brand: "Cerdà va perdre el pla",
    footer: "Joc 4 de 4 · Història i geografia de Barcelona",
    level: "Nivell",
    level1_name: "Primer viatge",
    st_U: "Universitat", st_C: "Catalunya", st_R: "Urquinaona",
    fact_U: "Universitat és al costat de la Universitat de Barcelona i té les línies L1 i L2.",
    fact_C: "La plaça de Catalunya és on l'Eixample s'uneix amb la ciutat vella.",
    fact_R: "A la plaça d'Urquinaona hi ha el nostre centre d'estudis.",
    mission: "Missió",
    mission_text: "{from} → {to}. Recull tots els trossos del pla pel camí.",
    pieces: "Trossos del pla",
    time: "Temps",
    moves: "Moviments",
    points: "Punts",
    help: "Mirar el pla (−50)",
    help_hint: "Ensenya els noms durant 3 segons.",
    restart: "Torna a començar",
    again: "Torna a jugar",
    close: "Tanca",
    controls: "Mou la fitxa amb les fletxes o WASD.",
    msg_start: "Ets a {station}, a la línia L1. Mou la fitxa per la via.",
    msg_wall: "Per allà no hi ha via.",
    msg_piece: "Has trobat un tros del pla!",
    msg_missing: "Et falten {n} trossos del pla abans de sortir.",
    win_title: "Nivell superat!",
    win_text: "{moves} moviments · {points} punts",
    stars: "{n} de 3 estrelles",
  },
  en: {
    title: "Metro Maze",
    language: "Language",
    skip: "Skip to content",
    brand: "Cerdà lost the plan",
    footer: "Game 4 of 4 · History and geography of Barcelona",
    level: "Level",
    level1_name: "First trip",
    st_U: "Universitat", st_C: "Catalunya", st_R: "Urquinaona",
    fact_U: "Universitat is next to the University of Barcelona and has lines L1 and L2.",
    fact_C: "Plaça de Catalunya is where the Eixample meets the old city.",
    fact_R: "Our school is on Plaça d'Urquinaona.",
    mission: "Mission",
    mission_text: "{from} → {to}. Collect every piece of the plan on the way.",
    pieces: "Pieces of the plan",
    time: "Time",
    moves: "Moves",
    points: "Points",
    help: "Look at the map (−50)",
    help_hint: "Shows the names for 3 seconds.",
    restart: "Start again",
    again: "Play again",
    close: "Close",
    controls: "Move the token with the arrow keys or WASD.",
    msg_start: "You are at {station}, on line L1. Move the token along the track.",
    msg_wall: "There is no track that way.",
    msg_piece: "You found a piece of the plan!",
    msg_missing: "You still need {n} pieces of the plan before you leave.",
    win_title: "Level complete!",
    win_text: "{moves} moves · {points} points",
    stars: "{n} of 3 stars",
  },
};

let currentLang = "es";

function setLang(code) {
  if (TEXTS[code]) {
    currentLang = code;
  }
}

// Devuelve el texto de la clave en el idioma actual.
// Cada {nombre} del texto se cambia por el valor de vars.nombre.
function t(key, vars) {
  let text = TEXTS[currentLang][key];
  if (!text) {
    return key;
  }
  if (vars) {
    for (const name in vars) {
      text = text.replace("{" + name + "}", vars[name]);
    }
  }
  return text;
}
