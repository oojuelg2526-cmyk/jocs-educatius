// El nivel del Laberinto de metro.
//
// El mapa es una lista de textos y cada letra es una casilla:
//   #        nada (pared)
//   1        vía de la línea L1
//   U C R    estación (su nombre está en `stations`)
//
// Los trozos del plano (`pieces`) se indican con [fila, columna].
// `bestMoves` es el número de movimientos de la mejor ruta.

const LEVEL = {
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
    U: "st_U",
    C: "st_C",
    R: "st_R",
  },
  start: "U",
  end: "R",
  pieces: [[2, 7]], // en Catalunya
  bestMoves: 14,
};
