// Los tres niveles del Laberinto de metro.
//
// Cada mapa es una lista de textos y cada letra es una casilla:
//   #            nada (pared)
//   1 2 4        vía de la línea L1, L2 o L4
//   U C P R A    estación (sus datos están en `stations`)
//
// Los trozos del plano (`pieces`) se indican con [fila, columna].
// `bestMoves` es el número de movimientos de la mejor ruta; se comprueba en test/game.test.js.

export const LEVELS = [
  {
    id: 1,
    nameKey: "level1_name",
    map: [
      "#################",
      "#######1#########",
      "#U11111C1111111R#",
      "#######1#########",
      "#################",
    ],
    stations: {
      U: { nameKey: "st_U", lines: [1] },
      C: { nameKey: "st_C", lines: [1] },
      R: { nameKey: "st_R", lines: [1] },
    },
    start: "U",
    end: "R",
    pieces: [[2, 7]], // en Catalunya
    closed: [],
    rush: [],
    timeLimit: null,
    hideNames: false,
    bestMoves: 14,
  },
  {
    id: 2,
    nameKey: "level2_name",
    map: [
      "#################",
      "#U11111C11111111#",
      "#2########1####1#",
      "#2########1####R#",
      "#2#############4#",
      "#P44444444444444#",
      "#2###############",
    ],
    stations: {
      U: { nameKey: "st_U", lines: [1, 2] },
      C: { nameKey: "st_C", lines: [1] },
      P: { nameKey: "st_P", lines: [2, 4] },
      R: { nameKey: "st_R", lines: [1, 4] },
    },
    start: "U",
    end: "R",
    pieces: [[5, 1], [5, 11]], // en Passeig de Gràcia y en la vía de la L4
    closed: ["C"], // Catalunya está cerrada por obras
    rush: [[5, 8]], // casilla de hora punta que se abre y se cierra
    timeLimit: null,
    hideNames: false,
    bestMoves: 20,
  },
  {
    id: 3,
    nameKey: "level3_name",
    map: [
      "#####################",
      "#U11111C11111111#####",
      "#2########1####1#####",
      "#2########1####R1111A",
      "#2#############4#####",
      "#P44444444444444#####",
      "#2###################",
    ],
    stations: {
      U: { nameKey: "st_U", lines: [1, 2] },
      C: { nameKey: "st_C", lines: [1] },
      P: { nameKey: "st_P", lines: [2, 4] },
      R: { nameKey: "st_R", lines: [1, 4] },
      A: { nameKey: "st_A", lines: [1] },
    },
    start: "U",
    end: "R",
    pieces: [[5, 1], [3, 20]], // en Passeig de Gràcia y en Arc de Triomf
    closed: [],
    rush: [],
    timeLimit: 90, // segundos
    hideNames: true, // solo se ven salida, destino y trozos
    bestMoves: 30,
  },
];

// Colores de las líneas (se usan en el CSS con la clase l1, l2, l4).
export const LINE_NAMES = { 1: "L1", 2: "L2", 4: "L4" };
