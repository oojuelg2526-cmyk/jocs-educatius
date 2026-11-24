// Los tres niveles del Laberinto de metro.
//
// Cada mapa es una lista de textos y cada letra es una casilla:
//   #          nada (pared)
//   1 2 4      vía de la línea L1, L2 o L4
//   U C R ...  estación (sus datos están en `stations`)
//
// Para hacer un nivel más largo basta con dibujar un mapa más grande: el código no cambia.
//
// Campos de cada nivel:
//   pieces     trozos del plano, como [fila, columna]
//   closed     estaciones cerradas por obras (no se puede pasar)
//   timeLimit  segundos que dura el nivel (null = sin límite)
//   hideNames  si es true, solo se ven los nombres de salida, destino y trozos
//   bestMoves  movimientos de la mejor ruta (sirve para dar estrellas)

const LEVELS = [
  {
    // Nivel 1: la L1 de Urgell a Arc de Triomf.
    id: 1,
    nameKey: "level1_name",
    map: [
      "#################",
      "#G11U11C11R11A11#",
      "#################",
    ],
    stations: {
      G: { nameKey: "st_urgell", lines: [1] },
      U: { nameKey: "st_universitat", lines: [1] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1] },
      A: { nameKey: "st_arc", lines: [1] },
    },
    start: "U",
    end: "R",
    pieces: [[1, 1], [1, 7], [1, 13]], // en Urgell, Catalunya y Arc de Triomf
    closed: [],
    timeLimit: null,
    hideNames: false,
    bestMoves: 18,
  },
  {
    // Nivel 2: Catalunya está cerrada, hay que dar la vuelta por la L2 y la L4.
    id: 2,
    nameKey: "level2_name",
    map: [
      "#################",
      "####U11111C1111R#",
      "####2##########4#",
      "####2##########4#",
      "####2##########4#",
      "####2##########4#",
      "#G44P44444444444#",
      "####2############",
      "####T############",
      "#################",
    ],
    stations: {
      U: { nameKey: "st_universitat", lines: [1, 2] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1, 4] },
      P: { nameKey: "st_passeig", lines: [2, 4] },
      G: { nameKey: "st_girona", lines: [4] },
      T: { nameKey: "st_tetuan", lines: [2] },
    },
    start: "U",
    end: "R",
    pieces: [[8, 4], [6, 1], [6, 11]], // en Tetuan, en Girona y en la vía de la L4
    closed: ["C"], // Catalunya está cerrada por obras
    timeLimit: null,
    hideNames: false,
    bestMoves: 31,
  },
  {
    // Nivel 3: más trozos, tiempo límite y los nombres ocultos.
    id: 3,
    nameKey: "level3_name",
    map: [
      "#################",
      "####U1C111R11A1M#",
      "####2#####4######",
      "####2#####4######",
      "####2#####4######",
      "####2#####4######",
      "#G44P444444######",
      "####2############",
      "####T############",
      "#################",
    ],
    stations: {
      U: { nameKey: "st_universitat", lines: [1, 2] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1, 4] },
      A: { nameKey: "st_arc", lines: [1] },
      M: { nameKey: "st_marina", lines: [1] },
      P: { nameKey: "st_passeig", lines: [2, 4] },
      G: { nameKey: "st_girona", lines: [4] },
      T: { nameKey: "st_tetuan", lines: [2] },
    },
    start: "U",
    end: "R",
    pieces: [[8, 4], [6, 1], [6, 8], [1, 13], [1, 15]], // Tetuan, Girona, la L4, Arc de Triomf y Marina
    closed: [],
    timeLimit: 150, // segundos
    hideNames: true,
    bestMoves: 36,
  },
];

// Cómo se llama cada línea en pantalla.
const LINE_NAMES = { 1: "L1", 2: "L2", 4: "L4" };
