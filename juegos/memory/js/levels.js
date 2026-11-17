// Datos del juego: los monumentos y los 3 niveles.
// [PENDENT] contrastar cada barrio y dato con una fuente fiable antes de publicar.

// hue: color de fondo de la ilustración. shape: silueta que se dibuja si aún no hay render.
// map: posición del barrio en el mapa esquemático (viewBox 320 × 260).
export const MONUMENTS = [
  { id: "sagrada", name: "Sagrada Família", barrio: "la Sagrada Família", hue: 28, shape: "spires", map: [184, 120] },
  { id: "guell", name: "Park Güell", barrio: "la Salut", hue: 95, shape: "park", map: [152, 78] },
  { id: "batllo", name: "Casa Batlló", barrio: "la Dreta de l'Eixample", hue: 190, shape: "wave", map: [156, 140] },
  { id: "pedrera", name: "La Pedrera", barrio: "l'Antiga Esquerra de l'Eixample", hue: 35, shape: "wave", map: [128, 132] },
  { id: "catedral", name: "Catedral de Barcelona", barrio: "el Gòtic", hue: 215, shape: "gothic", map: [150, 182] },
  { id: "palau", name: "Palau de la Música Catalana", barrio: "Sant Pere, Santa Caterina i la Ribera", hue: 350, shape: "palace", map: [168, 172] },
  { id: "montjuic", name: "Castell de Montjuïc", barrio: "Montjuïc", hue: 140, shape: "castle", map: [78, 200] },
  { id: "santpau", name: "Hospital de Sant Pau", barrio: "el Baix Guinardó", hue: 15, shape: "palace", map: [202, 100] },
  { id: "glories", name: "Torre Glòries", barrio: "el Parc i la Llacuna del Poblenou", hue: 270, shape: "tower", map: [236, 142] },
  { id: "boqueria", name: "Mercat de la Boqueria", barrio: "el Raval", hue: 5, shape: "market", map: [128, 182] },
  { id: "tibidabo", name: "Temple del Tibidabo", barrio: "Vallvidrera, el Tibidabo i les Planes", hue: 240, shape: "temple", map: [104, 34] },
  { id: "pedralbes", name: "Monestir de Pedralbes", barrio: "Pedralbes", hue: 60, shape: "cloister", map: [54, 96] },
];

// Todas las parejas son «ilustración del monumento ↔ texto». mode dice qué texto:
//   name   → su nombre (placa)
//   barrio → su barrio (chincheta del mapa)
//   fact   → un dato histórico (pergamino)
// No se pierde nunca: los fallos solo quitan estrellas (stars = fallos máximos para 3 y 2 estrellas)
// y bonusTime son los segundos que dan puntos extra (0 = sin bonus de reloj).
// cols / mobileCols: columnas del tablero en escritorio y en móvil.
export const LEVELS = [
  { id: 1, nameKey: "level1_name", mode: "name", pairs: 4, lupas: 0, trampas: 0, hints: 3, bonusTime: 0, stars: [2, 5], cols: 4, mobileCols: 4 },
  { id: 2, nameKey: "level2_name", mode: "barrio", pairs: 6, lupas: 2, trampas: 0, hints: 3, bonusTime: 120, stars: [3, 7], cols: 7, mobileCols: 4 },
  { id: 3, nameKey: "level3_name", mode: "fact", pairs: 8, lupas: 1, trampas: 1, hints: 3, bonusTime: 180, stars: [4, 9], cols: 6, mobileCols: 3 },
];

export const PEEK_SECONDS = 3;
// Puntos por cada segundo que sobra del bonus de tiempo.
export const BONUS_PER_SECOND = 5;
