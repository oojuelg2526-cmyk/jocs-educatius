// Datos del juego: los monumentos y los 3 niveles.
// [PENDENT] contrastar cada barrio y dato con una fuente fiable antes de publicar.

export const MONUMENTS = [
  { id: "sagrada", name: "Sagrada Família", barrio: "la Sagrada Família", hue: 28 },
  { id: "guell", name: "Park Güell", barrio: "la Salut", hue: 95 },
  { id: "batllo", name: "Casa Batlló", barrio: "la Dreta de l'Eixample", hue: 190 },
  { id: "pedrera", name: "La Pedrera", barrio: "l'Antiga Esquerra de l'Eixample", hue: 35 },
  { id: "catedral", name: "Catedral de Barcelona", barrio: "el Gòtic", hue: 215 },
  { id: "palau", name: "Palau de la Música Catalana", barrio: "Sant Pere, Santa Caterina i la Ribera", hue: 350 },
  { id: "montjuic", name: "Castell de Montjuïc", barrio: "Montjuïc", hue: 140 },
  { id: "santpau", name: "Hospital de Sant Pau", barrio: "el Baix Guinardó", hue: 15 },
  { id: "glories", name: "Torre Glòries", barrio: "el Parc i la Llacuna del Poblenou", hue: 270 },
  { id: "boqueria", name: "Mercat de la Boqueria", barrio: "el Raval", hue: 5 },
  { id: "tibidabo", name: "Temple del Tibidabo", barrio: "Vallvidrera, el Tibidabo i les Planes", hue: 240 },
  { id: "pedralbes", name: "Monestir de Pedralbes", barrio: "Pedralbes", hue: 60 },
];

// mode: qué se une en cada pareja.
//   name  → foto del monumento ↔ su nombre
//   barrio → nombre del monumento ↔ su barrio
//   fact  → nombre del monumento ↔ un dato histórico
export const LEVELS = [
  { id: 1, nameKey: "level1_name", mode: "name", pairs: 6, maxErrors: 8, timeLimit: 0, lupas: 0, trampas: 0 },
  { id: 2, nameKey: "level2_name", mode: "barrio", pairs: 8, maxErrors: 8, timeLimit: 150, lupas: 1, trampas: 1 },
  { id: 3, nameKey: "level3_name", mode: "fact", pairs: 12, maxErrors: 10, timeLimit: 240, lupas: 1, trampas: 2 },
];

export const PEEK_SECONDS = 3;
