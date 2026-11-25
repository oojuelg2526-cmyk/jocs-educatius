// S es el origen, F es el destino, V es una zona verde y P es la plaza de paso.
export const niveles = [
    {
        limite: 6,
        verde: true,
        mapa: [
            "...V.",
            "...FV",
            "...V.",
            ".....",
            "S...."
        ]
    },
    {
        verde: true,
        mapa: [
            "...VF.",
            ".V.VV.",
            "....V.",
            "V.V.V.",
            "..V...",
            "S.V..."
        ]
    },
    {
        verde: true,
        requierePlaza: true,
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
        titulo: "Traça el camí de Cerdà",
        marca: "Cerdà ha perdut el plànol",
        saltar: "Ves al tauler", idioma: "Idioma", niveles: "Nivells",
        relato: "A la taula de Cerdà, assaja com connectar els espais de Barcelona abans de passar el recorregut al plànol.",
        mapa: "Plànol de treball", pasos: "Passos", porQue: "Per què?", leyenda: "Llegenda",
        origen: "Origen", destino: "Destí", verde: "Zona verda", plaza: "Plaça", calle: "Carrer",
        fila: "Fila", columna: "columna", tramoTrazado: "tram traçat",
        deshacer: "Desfés un pas", reiniciar: "Reinicia", siguiente: "Nivell següent",
        controles: "Arrossega amb el ratolí o el dit. També pots tocar cada casella o prémer Retorn a l’origen i continuar amb les fletxes.",
        inicio: "Comença el traçat a l’origen.",
        continuar: "Continua per una casella que comparteixi costat amb l’última.",
        continuaPlaza: "Ja has passat per la plaça. Ara connecta-la amb el destí.",
        lado: "Segueix el carrer. Les caselles han de compartir un costat i les diagonals no compten.",
        fuera: "Has arribat al límit del plànol. Gira cap a un carrer del tauler.",
        repetida: "Aquest tram ja forma part del camí. Desfés passos per canviar de direcció.",
        protegida: "Aquesta zona verda queda reservada. Busca un carrer al voltant per mantenir-la sencera.",
        faltaPlaza: "Passa per la plaça abans d’arribar al destí, així també quedarà connectada.",
        rodeo: "Amb aquesta volta no hi arribaràs en sis passos. Desfés un tram i busca una ruta més directa.",
        deshecho: "Has tret l’últim tram. Pots provar una altra direcció.",
        misiones: [
            {
                titulo: "Segueix la quadrícula",
                objetivo: "Arriba al destí en sis passos. Avança pels costats de les caselles.",
                motivo: "En una quadrícula pots separar el recorregut en passos horitzontals i verticals. Aquí en fan falta tres cap a la dreta i tres cap amunt.",
                victoria: "Connexió feta. Tres passos horitzontals i tres de verticals completen el camí més curt."
            },
            {
                titulo: "Conserva el verd",
                objetivo: "Connecta l’origen i el destí pels carrers, vorejant les zones verdes.",
                motivo: "Un bon recorregut ha de donar accés als espais sense partir-los. Els carrers permeten vorejar el verd.",
                victoria: "Has connectat els dos punts tot conservant les zones verdes."
            },
            {
                titulo: "Connecta la plaça",
                objetivo: "Passa per la plaça abans d’arribar al destí i respecta les zones verdes.",
                motivo: "Una plaça pot unir recorreguts. Si queda a mig camí, qui passa pel carrer també hi pot arribar.",
                victoria: "Plànol complet. El recorregut uneix l’origen, la plaça i el destí, i deixa intacte el verd."
            }
        ]
    },
    es: {
        titulo: "Traza el camino de Cerdà",
        marca: "Cerdà ha perdido el plano",
        saltar: "Ir al tablero", idioma: "Idioma", niveles: "Niveles",
        relato: "En la mesa de Cerdà, ensaya cómo conectar los espacios de Barcelona antes de pasar el recorrido al plano.",
        mapa: "Plano de trabajo", pasos: "Pasos", porQue: "¿Por qué?", leyenda: "Leyenda",
        origen: "Origen", destino: "Destino", verde: "Zona verde", plaza: "Plaza", calle: "Calle",
        fila: "Fila", columna: "columna", tramoTrazado: "tramo trazado",
        deshacer: "Deshacer un paso", reiniciar: "Reiniciar", siguiente: "Siguiente nivel",
        controles: "Arrastra con el ratón o el dedo. También puedes tocar cada casilla o pulsar Intro en el origen y seguir con las flechas.",
        inicio: "Empieza a trazar desde el origen.",
        continuar: "Sigue por una casilla que comparta lado con la última.",
        continuaPlaza: "Ya has pasado por la plaza. Ahora conéctala con el destino.",
        lado: "Sigue la calle. Las casillas deben compartir lado y las diagonales no cuentan.",
        fuera: "Has llegado al borde del plano. Gira hacia una calle del tablero.",
        repetida: "Este tramo ya forma parte del camino. Deshaz pasos para cambiar de dirección.",
        protegida: "Esta zona verde está reservada. Busca una calle alrededor para conservarla entera.",
        faltaPlaza: "Pasa por la plaza antes de llegar al destino para que también quede conectada.",
        rodeo: "Con este rodeo no llegarás en seis pasos. Deshaz un tramo y busca una ruta más directa.",
        deshecho: "Has quitado el último tramo. Puedes probar otra dirección.",
        misiones: [
            {
                titulo: "Sigue la cuadrícula",
                objetivo: "Llega al destino en seis pasos. Avanza por los lados de las casillas.",
                motivo: "En una cuadrícula puedes separar el recorrido en pasos horizontales y verticales. Aquí hacen falta tres a la derecha y tres hacia arriba.",
                victoria: "Conexión hecha. Tres pasos horizontales y tres verticales completan el camino más corto."
            },
            {
                titulo: "Conserva el verde",
                objetivo: "Conecta el origen y el destino por las calles, bordeando las zonas verdes.",
                motivo: "Un buen recorrido debe dar acceso a los espacios sin partirlos. Las calles permiten bordear las zonas verdes.",
                victoria: "Has conectado los dos puntos conservando las zonas verdes."
            },
            {
                titulo: "Conecta la plaza",
                objetivo: "Pasa por la plaza antes de llegar al destino y respeta las zonas verdes.",
                motivo: "Una plaza puede unir recorridos. Si queda a medio camino, quien pasa por la calle también puede llegar a ella.",
                victoria: "Plano completo. El recorrido une el origen, la plaza y el destino, y deja intactas las zonas verdes."
            }
        ]
    },
    en: {
        titulo: "Trace Cerdà’s route",
        marca: "Cerdà has lost his plan",
        saltar: "Skip to the board", idioma: "Language", niveles: "Levels",
        relato: "At Cerdà’s drafting table, try connecting places in Barcelona before drawing the route on the plan.",
        mapa: "Working plan", pasos: "Steps", porQue: "Why?", leyenda: "Legend",
        origen: "Start", destino: "Destination", verde: "Green space", plaza: "Square", calle: "Street",
        fila: "Row", columna: "column", tramoTrazado: "route segment",
        deshacer: "Undo a step", reiniciar: "Restart", siguiente: "Next level",
        controles: "Drag with a mouse or a finger. You can also tap each cell or press Enter at the start and use the arrow keys.",
        inicio: "Begin drawing at the starting point.",
        continuar: "Continue to a cell that shares an edge with the last one.",
        continuaPlaza: "You have reached the square. Now connect it to the destination.",
        lado: "Follow the street. Cells must share an edge, so diagonal steps do not count.",
        fuera: "You have reached the edge of the plan. Turn back towards a street on the board.",
        repetida: "This segment is already on the route. Undo steps to change direction.",
        protegida: "This green space is protected. Take a street around it to keep it whole.",
        faltaPlaza: "Pass through the square before you reach the destination so it stays connected too.",
        rodeo: "This detour will take more than six steps. Undo a step and look for a more direct route.",
        deshecho: "You removed the last segment. Try a different direction.",
        misiones: [
            {
                titulo: "Follow the grid",
                objetivo: "Reach the destination in six steps. Move between cells that share an edge.",
                motivo: "On a grid you can split a route into horizontal and vertical steps. Here you need three to the right and three up.",
                victoria: "Route connected. Three horizontal steps and three vertical steps make the shortest path."
            },
            {
                titulo: "Keep the green spaces",
                objetivo: "Connect the start and finish by following streets around the green spaces.",
                motivo: "A good route makes places accessible while keeping them whole. Streets can run around green spaces.",
                victoria: "You connected both points and kept the green spaces intact."
            },
            {
                titulo: "Connect the square",
                objetivo: "Pass through the square on your way to the destination while keeping green spaces intact.",
                motivo: "A square can join routes. Placing it along the way keeps it accessible to people using the street.",
                victoria: "Plan complete. Your route connects the start, the square and the destination while preserving green spaces."
            }
        ]
    }
};
