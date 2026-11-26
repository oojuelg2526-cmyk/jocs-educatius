// Los tres niveles del Laberinto de metro. Cada mapa está dibujado a mano y se parece a la red real
// del centro de Barcelona (es un esquema simplificado): L1 roja, L2 morada, L3 verde y L4 amarilla.
//
// Cada mapa es una lista de textos y cada letra es una casilla:
//   #          nada (pared)
//   1 2 3 4    vía de la línea L1, L2, L3 o L4
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
//   tipKey     consejo que sale en el panel al empezar el nivel

const LEVELS = [
  {
    // Nivel 1: la L1 de verdad, de Rocafort a Glòries. Los trozos están en los dos extremos de la línea.
    id: 1,
    nameKey: "level1_name",
    tipKey: "tip_level1",
    map: [
      "#####################",
      "###################L#",
      "###################1#",
      "###################1#",
      "###################M#",
      "###################1#",
      "###################1#",
      "###################A#",
      "###################1#",
      "###################1#",
      "#F111G111U111C111R11#",
      "#####################",
    ],
    stations: {
      L: { nameKey: "st_glories", lines: [1] },
      M: { nameKey: "st_marina", lines: [1] },
      A: { nameKey: "st_arc", lines: [1] },
      F: { nameKey: "st_rocafort", lines: [1] },
      G: { nameKey: "st_urgell", lines: [1] },
      U: { nameKey: "st_universitat", lines: [1] },
      C: { nameKey: "st_catalunya", lines: [1] },
      R: { nameKey: "st_urquinaona", lines: [1] },
    },
    start: "U",
    end: "R",
    pieces: [[10, 1], [4, 19], [1, 19]], // Rocafort, Marina, Glòries
    closed: [],
    timeLimit: null,
    hideNames: false,
    bestMoves: 46,
  },
  {
    // Nivel 2: el centro. Catalunya está cerrada por obras: hay que ir por la L2 y la L4.
    id: 2,
    nameKey: "level2_name",
    tipKey: "tip_level2",
    map: [
      "#####################",
      "#############V#######",
      "#############4#######",
      "#############4#######",
      "#############I#######",
      "#############4#######",
      "#############4#######",
      "#############4#####M#",
      "#########2222P4444#1#",
      "#########2###3###4#1#",
      "#########2###3###4#1#",
      "#########2###3###4#A#",
      "#########2###3###4#1#",
      "#########2###3###4#1#",
      "#####G111U111C111R11#",
      "#########2#######4###",
      "#########2#######4###",
      "#########S#######J###",
      "#####################",
    ],
    stations: {
      V: { nameKey: "st_verdaguer", lines: [4] },
      I: { nameKey: "st_girona", lines: [4] },
      M: { nameKey: "st_marina", lines: [1] },
      P: { nameKey: "st_passeig", lines: [2, 3, 4] },
      A: { nameKey: "st_arc", lines: [1] },
      G: { nameKey: "st_urgell", lines: [1] },
      U: { nameKey: "st_universitat", lines: [1, 2] },
      C: { nameKey: "st_catalunya", lines: [1, 3] },
      R: { nameKey: "st_urquinaona", lines: [1, 4] },
      S: { nameKey: "st_santantoni", lines: [2] },
      J: { nameKey: "st_jaume", lines: [4] },
    },
    start: "U",
    end: "R",
    pieces: [[14, 5], [17, 9], [4, 13], [1, 13], [17, 17], [7, 19]], // Urgell, Sant Antoni, Girona, Verdaguer, Jaume I, Marina
    closed: ["C"], // Catalunya está cerrada por obras
    timeLimit: null,
    hideNames: false,
    bestMoves: 72,
  },
  {
    // Nivel 3: toda la red del centro, con más trozos, tiempo límite y los nombres ocultos.
    id: 3,
    nameKey: "level3_name",
    tipKey: "tip_level3",
    map: [
      "#####################",
      "#############O#####T#",
      "#############4#####1#",
      "#############4#####1#",
      "#############V#####1#",
      "#############4#####1#",
      "#############4#####L#",
      "#############I#####1#",
      "#############4#####1#",
      "#############4#####1#",
      "#############4#####M#",
      "#########2222P4444#1#",
      "#########2###3###4#1#",
      "#########2###3###4#1#",
      "#########2###3###4#A#",
      "#########2###3###4#1#",
      "#########2###3###4#1#",
      "#F111G111U111C111R11#",
      "#########2###3###4###",
      "#########2###3###4###",
      "#########S###K###J###",
      "#####################",
    ],
    stations: {
      O: { nameKey: "st_joanic", lines: [4] },
      T: { nameKey: "st_clot", lines: [1] },
      V: { nameKey: "st_verdaguer", lines: [4] },
      L: { nameKey: "st_glories", lines: [1] },
      I: { nameKey: "st_girona", lines: [4] },
      M: { nameKey: "st_marina", lines: [1] },
      P: { nameKey: "st_passeig", lines: [2, 3, 4] },
      A: { nameKey: "st_arc", lines: [1] },
      F: { nameKey: "st_rocafort", lines: [1] },
      G: { nameKey: "st_urgell", lines: [1] },
      U: { nameKey: "st_universitat", lines: [1, 2] },
      C: { nameKey: "st_catalunya", lines: [1, 3] },
      R: { nameKey: "st_urquinaona", lines: [1, 4] },
      S: { nameKey: "st_santantoni", lines: [2] },
      K: { nameKey: "st_liceu", lines: [3] },
      J: { nameKey: "st_jaume", lines: [4] },
    },
    start: "U",
    end: "R",
    pieces: [[17, 1], [20, 9], [20, 13], [20, 17], [1, 13], [10, 19], [1, 19]], // Rocafort, Sant Antoni, Liceu, Jaume I, Joanic, Marina, Clot
    closed: [],
    timeLimit: 300, // segundos
    hideNames: true,
    bestMoves: 110,
  },
];

// Cómo se llama cada línea en pantalla.
const LINE_NAMES = { 1: "L1", 2: "L2", 3: "L3", 4: "L4" };
