// S és l'origen, F és el destí, V és zona verda i P és la plaça de pas.
export const nivells = [
    {
        limit: 6,
        mapa: [
            "..F..",
            ".....",
            ".....",
            ".....",
            "S...."
        ]
    },
    {
        verd: true,
        mapa: [
            "...V.F",
            ".VVV..",
            ".....V",
            ".VVV.V",
            "...V..",
            "S.V..."
        ]
    },
    {
        verd: true,
        placa: true,
        mapa: [
            ".....VF",
            ".VV.V..",
            "....V.V",
            ".V.P...",
            "..V..V.",
            ".VV.V..",
            "S......"
        ]
    }
];

export const textos = {
    ca: {
        titol: "Traça el camí de Cerdà",
        marca: "Cerdà ha perdut el plànol",
        saltar: "Ves al tauler", idioma: "Idioma", nivells: "Nivells",
        relat: "A la taula de Cerdà, assaja com connectar els espais de Barcelona abans de passar el recorregut al plànol.",
        mapa: "Plànol de treball", passos: "Passos", perQue: "Per què?", llegenda: "Llegenda",
        origen: "Origen", desti: "Destí", verd: "Zona verda", placa: "Plaça", carrer: "Carrer",
        fila: "Fila", columna: "columna", tracat: "tram traçat",
        desfer: "Desfés un pas", reiniciar: "Reinicia", seguent: "Nivell següent",
        controls: "Arrossega amb el ratolí o el dit. També pots tocar cada casella o prémer Retorn a l’origen i continuar amb les fletxes.",
        inici: "Comença el traçat a l’origen.",
        seguint: "Continua per una casella que comparteixi costat amb l’última.",
        continuaPlaca: "Ja has passat per la plaça. Ara connecta-la amb el destí.",
        costat: "Segueix el carrer. Les caselles han de compartir un costat i les diagonals no compten.",
        fora: "Has arribat al límit del plànol. Gira cap a un carrer del tauler.",
        repetida: "Aquest tram ja forma part del camí. Desfés passos per canviar de direcció.",
        protegida: "Aquesta zona verda queda reservada. Busca un carrer al voltant per mantenir-la sencera.",
        faltaPlaca: "Passa per la plaça abans d’arribar al destí, així també quedarà connectada.",
        massaVolta: "Amb aquesta volta no hi arribaràs en sis passos. Desfés un tram i busca una ruta més directa.",
        desfet: "Has tret l’últim tram. Pots provar una altra direcció.",
        missions: [
            {
                titol: "Segueix la quadrícula",
                objectiu: "Arriba al destí en sis passos. Avança pels costats de les caselles.",
                motiu: "En una quadrícula pots separar el recorregut en passos horitzontals i verticals. Aquí en fan falta dos cap a la dreta i quatre cap amunt.",
                victoria: "Connexió feta. Dos passos horitzontals i quatre de verticals completen el camí més curt."
            },
            {
                titol: "Conserva el verd",
                objectiu: "Connecta l’origen i el destí pels carrers, vorejant les zones verdes.",
                motiu: "Un bon recorregut ha de donar accés als espais sense partir-los. Els carrers permeten vorejar el verd.",
                victoria: "Has connectat els dos punts tot conservant les zones verdes."
            },
            {
                titol: "Connecta la plaça",
                objectiu: "Passa per la plaça abans d’arribar al destí i respecta les zones verdes.",
                motiu: "Una plaça pot unir recorreguts. Si queda a mig camí, qui passa pel carrer també hi pot arribar.",
                victoria: "Plànol complet. El recorregut uneix l’origen, la plaça i el destí, i deixa intacte el verd."
            }
        ]
    },
    es: {
        titol: "Traza el camino de Cerdà",
        marca: "Cerdà ha perdido el plano",
        saltar: "Ir al tablero", idioma: "Idioma", nivells: "Niveles",
        relat: "En la mesa de Cerdà, ensaya cómo conectar los espacios de Barcelona antes de pasar el recorrido al plano.",
        mapa: "Plano de trabajo", passos: "Pasos", perQue: "¿Por qué?", llegenda: "Leyenda",
        origen: "Origen", desti: "Destino", verd: "Zona verde", placa: "Plaza", carrer: "Calle",
        fila: "Fila", columna: "columna", tracat: "tramo trazado",
        desfer: "Deshacer un paso", reiniciar: "Reiniciar", seguent: "Siguiente nivel",
        controls: "Arrastra con el ratón o el dedo. También puedes tocar cada casilla o pulsar Intro en el origen y seguir con las flechas.",
        inici: "Empieza a trazar desde el origen.",
        seguint: "Sigue por una casilla que comparta lado con la última.",
        continuaPlaca: "Ya has pasado por la plaza. Ahora conéctala con el destino.",
        costat: "Sigue la calle. Las casillas deben compartir lado y las diagonales no cuentan.",
        fora: "Has llegado al borde del plano. Gira hacia una calle del tablero.",
        repetida: "Este tramo ya forma parte del camino. Deshaz pasos para cambiar de dirección.",
        protegida: "Esta zona verde está reservada. Busca una calle alrededor para conservarla entera.",
        faltaPlaca: "Pasa por la plaza antes de llegar al destino para que también quede conectada.",
        massaVolta: "Con este rodeo no llegarás en seis pasos. Deshaz un tramo y busca una ruta más directa.",
        desfet: "Has quitado el último tramo. Puedes probar otra dirección.",
        missions: [
            {
                titol: "Sigue la cuadrícula",
                objectiu: "Llega al destino en seis pasos. Avanza por los lados de las casillas.",
                motiu: "En una cuadrícula puedes separar el recorrido en pasos horizontales y verticales. Aquí hacen falta dos a la derecha y cuatro hacia arriba.",
                victoria: "Conexión hecha. Dos pasos horizontales y cuatro verticales completan el camino más corto."
            },
            {
                titol: "Conserva el verde",
                objectiu: "Conecta el origen y el destino por las calles, bordeando las zonas verdes.",
                motiu: "Un buen recorrido debe dar acceso a los espacios sin partirlos. Las calles permiten bordear las zonas verdes.",
                victoria: "Has conectado los dos puntos conservando las zonas verdes."
            },
            {
                titol: "Conecta la plaza",
                objectiu: "Pasa por la plaza antes de llegar al destino y respeta las zonas verdes.",
                motiu: "Una plaza puede unir recorridos. Si queda a medio camino, quien pasa por la calle también puede llegar a ella.",
                victoria: "Plano completo. El recorrido une el origen, la plaza y el destino, y deja intactas las zonas verdes."
            }
        ]
    },
    en: {
        titol: "Trace Cerdà’s route",
        marca: "Cerdà has lost his plan",
        saltar: "Skip to the board", idioma: "Language", nivells: "Levels",
        relat: "At Cerdà’s drafting table, try connecting places in Barcelona before drawing the route on the plan.",
        mapa: "Working plan", passos: "Steps", perQue: "Why?", llegenda: "Legend",
        origen: "Start", desti: "Destination", verd: "Green space", placa: "Square", carrer: "Street",
        fila: "Row", columna: "column", tracat: "route segment",
        desfer: "Undo a step", reiniciar: "Restart", seguent: "Next level",
        controls: "Drag with a mouse or a finger. You can also tap each cell or press Enter at the start and use the arrow keys.",
        inici: "Begin drawing at the starting point.",
        seguint: "Continue to a cell that shares an edge with the last one.",
        continuaPlaca: "You have reached the square. Now connect it to the destination.",
        costat: "Follow the street. Cells must share an edge, so diagonal steps do not count.",
        fora: "You have reached the edge of the plan. Turn back towards a street on the board.",
        repetida: "This segment is already on the route. Undo steps to change direction.",
        protegida: "This green space is protected. Take a street around it to keep it whole.",
        faltaPlaca: "Pass through the square before you reach the destination so it stays connected too.",
        massaVolta: "This detour will take more than six steps. Undo a step and look for a more direct route.",
        desfet: "You removed the last segment. Try a different direction.",
        missions: [
            {
                titol: "Follow the grid",
                objectiu: "Reach the destination in six steps. Move between cells that share an edge.",
                motiu: "On a grid you can split a route into horizontal and vertical steps. Here you need two to the right and four up.",
                victoria: "Route connected. Two horizontal steps and four vertical steps make the shortest path."
            },
            {
                titol: "Keep the green spaces",
                objectiu: "Connect the start and finish by following streets around the green spaces.",
                motiu: "A good route makes places accessible while keeping them whole. Streets can run around green spaces.",
                victoria: "You connected both points and kept the green spaces intact."
            },
            {
                titol: "Connect the square",
                objectiu: "Pass through the square on your way to the destination while keeping green spaces intact.",
                motiu: "A square can join routes. Placing it along the way keeps it accessible to people using the street.",
                victoria: "Plan complete. Your route connects the start, the square and the destination while preserving green spaces."
            }
        ]
    }
};
