// Los tres niveles del Laberinto de metro.
//
// Cada mapa es una lista de textos y cada letra es una casilla:
//   #          nada (pared)
//   1 2 4      vía de la línea L1, L2 o L4
//   F G U ...  estación (sus datos están en `stations`)
//
// Para hacer un nivel más largo basta con dibujar un mapa más grande: el código no cambia.
//
// Campos de cada nivel:
//   pieces     trozos del plano, como [fila, columna]
//   closed     estaciones cerradas por obras (no se puede pasar)
//   rush       estaciones de hora punta: se abren y se cierran con el reloj (12 s abiertas, 6 s cerradas)
//   timeLimit  segundos que dura el nivel (null = sin límite)
//   hideNames  si es true, solo se ven los nombres de salida, destino y trozos
//   bestMoves  movimientos de la mejor ruta (sirve para dar estrellas)
//   tipKey     consejo que sale en el panel al empezar el nivel

const LEVELS = [
  {
    // Nivel 1: la L1. Hay que ir a buscar los trozos a las vías laterales y volver.
    id: 1,
    nameKey: "level1_name",
    tipKey: "tip_level1",
    map: [
      "#####################",
      "#F111G111U111C111R11#",
      "#####1#######1#######",
      "#####1#######1#######",
      "#####1#######1#######",
      "#####L#######A111M11#",
      "#####################",
    ],
    stations: {
      F: { nameKey: "st_rocafort", lines: [1] },
      G: { nameKey: "st_urgell", lines: [1] },
      U: { nameKey: "st_universitat", lines: [1] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1] },
      L: { nameKey: "st_glories", lines: [1] },
      A: { nameKey: "st_arc", lines: [1] },
      M: { nameKey: "st_marina", lines: [1] },
    },
    start: "U",
    end: "R",
    pieces: [[1, 1], [5, 5], [5, 13]], // en Rocafort, en Glòries y en Arc de Triomf (Marina no tiene: es un callejón)
    closed: [],
    rush: [],
    timeLimit: null,
    hideNames: false,
    bestMoves: 40,
  },
  {
    // Nivel 2: Catalunya está cerrada y Passeig de Gràcia es de hora punta.
    id: 2,
    nameKey: "level2_name",
    tipKey: "tip_level2",
    map: [
      "#####################",
      "#####U11111C11111R44#",
      "#####2#############4#",
      "#####2#############4#",
      "#####2#############4#",
      "#####2#############4#",
      "#####2#############4#",
      "#####2#############4#",
      "#G444P44444444444444#",
      "#####2#####4###4#####",
      "#####2#####4###4#####",
      "#####2#####4###4#####",
      "#####2#####4###4#####",
      "#####T#####J###V#####",
      "#####################",
    ],
    stations: {
      U: { nameKey: "st_universitat", lines: [1, 2] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1, 4] },
      P: { nameKey: "st_passeig", lines: [2, 4] },
      T: { nameKey: "st_tetuan", lines: [2] },
      G: { nameKey: "st_girona", lines: [4] },
      J: { nameKey: "st_jaume", lines: [4] },
      V: { nameKey: "st_verdaguer", lines: [4] },
    },
    start: "U",
    end: "R",
    pieces: [[1, 8], [13, 5], [8, 1], [13, 11], [13, 15]], // en la L1, en Tetuan, en Girona, en Jaume I y en Verdaguer
    closed: ["C"], // Catalunya está cerrada por obras
    rush: ["P"], // Passeig de Gràcia se cierra en hora punta
    timeLimit: null,
    hideNames: false,
    bestMoves: 74,
  },
  {
    // Nivel 3: más trozos, dos estaciones de hora punta, tiempo límite y los nombres ocultos.
    id: 3,
    nameKey: "level3_name",
    tipKey: "tip_level3",
    map: [
      "#####################",
      "#F111U11111C111R111A#",
      "#####2#########4#####",
      "#####2#########4#####",
      "#####2#########4#####",
      "#####2#########4#####",
      "#####2#########4#####",
      "#####2#########4#####",
      "#G444P4444444444444V#",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####2###4###4#######",
      "#####T###J###N#######",
      "#####################",
    ],
    stations: {
      F: { nameKey: "st_rocafort", lines: [1] },
      U: { nameKey: "st_universitat", lines: [1, 2] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1, 4] },
      A: { nameKey: "st_arc", lines: [1] },
      P: { nameKey: "st_passeig", lines: [2, 4] },
      T: { nameKey: "st_tetuan", lines: [2] },
      G: { nameKey: "st_girona", lines: [4] },
      J: { nameKey: "st_jaume", lines: [4] },
      V: { nameKey: "st_verdaguer", lines: [4] },
      N: { nameKey: "st_joanic", lines: [4] },
    },
    start: "U",
    end: "R",
    pieces: [[1, 1], [17, 5], [8, 1], [17, 9], [8, 19], [1, 19], [17, 13]], // Rocafort, Tetuan, Girona, Jaume I, Verdaguer, Arc de Triomf y Joanic
    closed: ["C"],
    rush: ["P", "J"], // Passeig de Gràcia y Jaume I se cierran en hora punta
    timeLimit: 300, // segundos
    hideNames: true,
    bestMoves: 110,
  },
];

// Cómo se llama cada línea en pantalla.
const LINE_NAMES = { 1: "L1", 2: "L2", 4: "L4" };
