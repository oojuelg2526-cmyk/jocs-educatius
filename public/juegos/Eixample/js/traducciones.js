export const traducciones = {
    ca: {
        bloqueado: "Primer has de superar el Memory de Barcelona.",
        irAMemory: "Ves al Memory",
        volverPortada: "Torna a la portada",
        juego: "Reconstruïm l’Eixample",
        historia: "Ildefons Cerdà ha perdut el plànol",
        subtitulo: "Joc 2 · Reconstruïm l’Eixample",
        idioma: "Idioma",
        introduccion: "Has recuperat el calc de la quadrícula al Memory de Barcelona. Ara, a la taula de dibuix de Cerdà, fes-lo servir per reconstruir les primeres illes de cases.",
        empezar: "Comença la reconstrucció",
        siguiente: "Nivell següent",
        continuarHistoria: "Ves a la línia del temps",
        movimientos: "Moviments",
        ayudas: "Ajudes",
        puntuacion: "Puntuació",
        tablero: "Quadrícula de reconstrucció",
        mision: "Missió",
        comprobar: "Comprova el plànol",
        curiosidad: "Sabies que…?",
        datoHistorico: "El pla original de Cerdà preveia espais verds a l’interior de les illes i donava importància a la llum natural i a la ventilació dels habitatges.",
        inventario: "Peces disponibles",
        instrucciones: "Arrossega una peça fins a una casella buida o selecciona la peça i prem la casella.",
        pista: "Consulta la pista",
        retirar: "Retira una peça",
        reiniciar: "Reinicia el nivell",
        progreso: "Reconstrucció del plànol",
        pie: "Projecte educatiu · Jocs per aprendre",
        nivel: (numero, detalle) => `Nivell ${numero} · ${detalle}`,
        casilla: (fila, columna, contenido) => `Fila ${fila}, columna ${columna}: ${contenido}`,
        vacia: "buida",
        estados: {
            actiu: "Actiu",
            disponible: "Disponible",
            bloquejat: "Bloquejat",
            completat: "Superat"
        },
        piezas: {
            vivienda: "Habitatge",
            parque: "Zona verda",
            equipamiento: "Equipament"
        },
        niveles: {
            1: {
                titulo: "Les primeres illes",
                descripcion: "Omple les 25 caselles amb 21 habitatges i 4 zones verdes. Posa una zona verda a cada quadrant i deixa la fila i la columna centrals per als habitatges.",
                pista: "La creu més fosca separa els quatre quadrants. Cada quadrant té quatre caselles on pots posar la seva zona verda.",
                parquesCuadrante: "Posa una zona verda a cada quadrant i reserva els eixos centrals per als habitatges.",
                victoria: "Nivell superat! Cada quadrant té la seva zona verda."
            },
            2: {
                titulo: "Una ciutat amb serveis",
                descripcion: "Omple les 49 caselles amb 41 habitatges, 4 zones verdes i 4 equipaments. Posa una zona verda a cada quadrant i un equipament a cada braç dels eixos centrals. Reserva la casella del mig per a un habitatge.",
                pista: "Comença amb els equipaments. La casella del mig divideix els eixos més foscos en quatre braços, un per equipament.",
                parquesCuadrante: "Posa una zona verda a cada quadrant, fora dels eixos centrals.",
                victoria: "Nivell superat! Cada quadrant té verd i cada braç dels eixos té un equipament."
            },
            3: {
                titulo: "El plànol definitiu",
                descripcion: "Omple les 81 caselles amb 69 habitatges, 8 zones verdes i 4 equipaments. Posa dues zones verdes a cada quadrant, sense que comparteixin costat. Posa un equipament a cada braç dels eixos centrals, amb una zona verda al costat. Reserva la casella del mig per a un habitatge.",
                pista: "Posa primer un equipament a cada braç. Col·loca-hi una zona verda just al costat i completa els quadrants. Les diagonals no compten com a costat.",
                parquesCuadrante: "Posa dues zones verdes a cada quadrant, fora dels eixos centrals.",
                victoria: "Has reconstruït l’Eixample! Recuperes la peça de les illes i, dins la comporta secreta, trobes els manuscrits per a la línia del temps."
            }
        },
        avisos: {
            inicio: "Tria una peça per començar.",
            retirada: "Peça retirada.",
            vacia: "Aquesta casella és buida.",
            sinSeleccion: "Tria una peça abans de col·locar-la.",
            ocupada: "Aquesta casella ja està ocupada.",
            parqueEnEje: "Les zones verdes han d’anar fora dels eixos centrals.",
            tableroIncompleto: "Omple totes les caselles abans de comprovar el plànol.",
            equipamientosEjes: "Posa un equipament a cada braç dels eixos centrals i deixa la casella del mig per a un habitatge.",
            parquesJuntos: "Separa les zones verdes perquè no comparteixin cap costat.",
            equipamientoSinParque: "Cada equipament ha de compartir un costat amb una zona verda.",
            listoParaComprobar: "El tauler és ple. Ja pots comprovar el plànol.",
            colocada: "Peça col·locada.",
            agotada: "No queden peces d’aquest tipus.",
            seleccionada: nombre => `Peça seleccionada: ${nombre}.`,
            retirar: "Prem la casella de la peça que vols retirar.",
            cancelarRetirada: "Retirada cancel·lada."
        }
    },
    es: {
        bloqueado: "Primero debes superar el Memory de Barcelona.",
        irAMemory: "Ve a Memory",
        volverPortada: "Volver a la portada",
        juego: "Reconstruye el Eixample",
        historia: "Ildefons Cerdà ha perdido el plano",
        subtitulo: "Juego 2 · Reconstruye el Eixample",
        idioma: "Idioma",
        introduccion: "Has recuperado el calco de la cuadrícula en Memory de Barcelona. Ahora, en la mesa de dibujo de Cerdà, úsalo para reconstruir las primeras manzanas.",
        empezar: "Empieza la reconstrucción",
        siguiente: "Nivel siguiente",
        continuarHistoria: "Ve a la línea del tiempo",
        movimientos: "Movimientos",
        ayudas: "Ayudas",
        puntuacion: "Puntuación",
        tablero: "Rejilla de reconstrucción",
        mision: "Misión",
        comprobar: "Comprueba el plano",
        curiosidad: "¿Sabías que…?",
        datoHistorico: "El plan original de Cerdà preveía espacios verdes en el interior de las manzanas y daba importancia a la luz natural y a la ventilación de las viviendas.",
        inventario: "Piezas disponibles",
        instrucciones: "Arrastra una pieza a una casilla vacía o selecciona la pieza y pulsa la casilla.",
        pista: "Consulta la pista",
        retirar: "Retira una pieza",
        reiniciar: "Reinicia el nivel",
        progreso: "Reconstrucción del plano",
        pie: "Proyecto educativo · Jocs per aprendre",
        nivel: (numero, detalle) => `Nivel ${numero} · ${detalle}`,
        casilla: (fila, columna, contenido) => `Fila ${fila}, columna ${columna}: ${contenido}`,
        vacia: "vacía",
        estados: {
            actiu: "Activo",
            disponible: "Disponible",
            bloquejat: "Bloqueado",
            completat: "Superado"
        },
        piezas: {
            vivienda: "Vivienda",
            parque: "Zona verde",
            equipamiento: "Equipamiento"
        },
        niveles: {
            1: {
                titulo: "Las primeras manzanas",
                descripcion: "Llena las 25 casillas con 21 viviendas y 4 zonas verdes. Coloca una zona verde en cada cuadrante y deja la fila y la columna centrales para las viviendas.",
                pista: "La cruz más oscura separa los cuatro cuadrantes. Cada cuadrante tiene cuatro casillas donde puedes colocar su zona verde.",
                parquesCuadrante: "Coloca una zona verde en cada cuadrante y reserva los ejes centrales para las viviendas.",
                victoria: "¡Nivel superado! Cada cuadrante tiene su zona verde."
            },
            2: {
                titulo: "Una ciudad con servicios",
                descripcion: "Llena las 49 casillas con 41 viviendas, 4 zonas verdes y 4 equipamientos. Coloca una zona verde en cada cuadrante y un equipamiento en cada brazo de los ejes centrales. Reserva la casilla del medio para una vivienda.",
                pista: "Empieza por los equipamientos. La casilla del medio divide los ejes más oscuros en cuatro brazos, uno por equipamiento.",
                parquesCuadrante: "Coloca una zona verde en cada cuadrante, fuera de los ejes centrales.",
                victoria: "¡Nivel superado! Cada cuadrante tiene una zona verde y cada brazo de los ejes tiene un equipamiento."
            },
            3: {
                titulo: "El plano definitivo",
                descripcion: "Llena las 81 casillas con 69 viviendas, 8 zonas verdes y 4 equipamientos. Coloca dos zonas verdes en cada cuadrante, sin que compartan lado. Coloca un equipamiento en cada brazo de los ejes centrales, con una zona verde al lado. Reserva la casilla del medio para una vivienda.",
                pista: "Coloca primero un equipamiento en cada brazo. Pon una zona verde justo al lado y completa los cuadrantes. Las diagonales no cuentan como lado.",
                parquesCuadrante: "Coloca dos zonas verdes en cada cuadrante, fuera de los ejes centrales.",
                victoria: "¡Has reconstruido el Eixample! Recuperas la pieza de las manzanas y, dentro de la compuerta secreta, encuentras los manuscritos para la línea del tiempo."
            }
        },
        avisos: {
            inicio: "Elige una pieza para empezar.",
            retirada: "Pieza retirada.",
            vacia: "Esta casilla está vacía.",
            sinSeleccion: "Elige una pieza antes de colocarla.",
            ocupada: "Esta casilla ya está ocupada.",
            parqueEnEje: "Las zonas verdes deben ir fuera de los ejes centrales.",
            tableroIncompleto: "Llena todas las casillas antes de comprobar el plano.",
            equipamientosEjes: "Coloca un equipamiento en cada brazo de los ejes centrales y deja la casilla del medio para una vivienda.",
            parquesJuntos: "Separa las zonas verdes para que no compartan ningún lado.",
            equipamientoSinParque: "Cada equipamiento debe compartir un lado con una zona verde.",
            listoParaComprobar: "El tablero está lleno. Ya puedes comprobar el plano.",
            colocada: "Pieza colocada.",
            agotada: "No quedan piezas de este tipo.",
            seleccionada: nombre => `Pieza seleccionada: ${nombre}.`,
            retirar: "Pulsa la casilla de la pieza que quieres retirar.",
            cancelarRetirada: "Retirada cancelada."
        }
    },
    en: {
        bloqueado: "Complete Barcelona Memory first.",
        irAMemory: "Go to Barcelona Memory",
        volverPortada: "Back to the home page",
        juego: "Rebuild the Eixample",
        historia: "Ildefons Cerdà has lost the plan",
        subtitulo: "Game 2 · Rebuild the Eixample",
        idioma: "Language",
        introduccion: "You recovered the grid tracing in Barcelona Memory. Now use it at Cerdà’s drafting table to rebuild the first blocks.",
        empezar: "Start rebuilding",
        siguiente: "Next level",
        continuarHistoria: "Go to the timeline",
        movimientos: "Moves",
        ayudas: "Hints",
        puntuacion: "Score",
        tablero: "Reconstruction grid",
        mision: "Mission",
        comprobar: "Check the plan",
        curiosidad: "Did you know…?",
        datoHistorico: "Cerdà’s original plan made room for green spaces inside the blocks and emphasised natural light and ventilation in homes.",
        inventario: "Available pieces",
        instrucciones: "Drag a piece to an empty square, or select the piece and then the square.",
        pista: "Show hint",
        retirar: "Remove a piece",
        reiniciar: "Restart level",
        progreso: "Rebuilding the plan",
        pie: "Educational project · Jocs per aprendre",
        nivel: (numero, detalle) => `Level ${numero} · ${detalle}`,
        casilla: (fila, columna, contenido) => `Row ${fila}, column ${columna}: ${contenido}`,
        vacia: "empty",
        estados: {
            actiu: "Active",
            disponible: "Available",
            bloquejat: "Locked",
            completat: "Completed"
        },
        piezas: {
            vivienda: "Housing",
            parque: "Green space",
            equipamiento: "Public facility"
        },
        niveles: {
            1: {
                titulo: "The first blocks",
                descripcion: "Fill all 25 squares with 21 housing pieces and 4 green spaces. Put one green space in each quadrant and leave the centre row and column for housing.",
                pista: "The darker cross divides the four quadrants. Each quadrant has four squares where you can place its green space.",
                parquesCuadrante: "Put one green space in each quadrant and keep the centre row and column for housing.",
                victoria: "Level complete! Every quadrant has its own green space."
            },
            2: {
                titulo: "A city with public services",
                descripcion: "Fill all 49 squares with 41 housing pieces, 4 green spaces and 4 public facilities. Put one green space in each quadrant and one public facility on each arm of the central cross. Keep the middle square for housing.",
                pista: "Start with the public facilities. The middle square divides the darker cross into four arms, one for each facility.",
                parquesCuadrante: "Put one green space in each quadrant, away from the central cross.",
                victoria: "Level complete! Each quadrant has green space and each arm of the cross has a public facility."
            },
            3: {
                titulo: "The final plan",
                descripcion: "Fill all 81 squares with 69 housing pieces, 8 green spaces and 4 public facilities. Put two green spaces in each quadrant without letting them share an edge. Put one facility on each arm of the central cross, with a green space beside it. Keep the middle square for housing.",
                pista: "Put one facility on each arm first. Place a green space directly beside each facility, then finish the quadrants. Diagonals do not count as shared edges.",
                parquesCuadrante: "Put two green spaces in each quadrant, away from the central cross.",
                victoria: "You rebuilt the Eixample! You recover the block fragment and find the manuscripts for the timeline inside the secret compartment."
            }
        },
        avisos: {
            inicio: "Choose a piece to begin.",
            retirada: "Piece removed.",
            vacia: "This square is empty.",
            sinSeleccion: "Choose a piece before placing it.",
            ocupada: "This square is already occupied.",
            parqueEnEje: "Green spaces must go outside the central axes.",
            tableroIncompleto: "Fill every square before checking the plan.",
            equipamientosEjes: "Put one public facility on each arm of the central cross and keep the middle square for housing.",
            parquesJuntos: "Keep green spaces apart so that they do not share an edge.",
            equipamientoSinParque: "Each public facility must share an edge with a green space.",
            listoParaComprobar: "The board is full. You can now check the plan.",
            colocada: "Piece placed.",
            agotada: "There are no pieces of this type left.",
            seleccionada: nombre => `Selected piece: ${nombre}.`,
            retirar: "Select the square containing the piece you want to remove.",
            cancelarRetirada: "Removal cancelled."
        }
    }
};
