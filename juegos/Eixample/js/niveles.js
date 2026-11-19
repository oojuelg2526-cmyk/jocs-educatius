
export const niveles = [

    // NIVEL 1
    {
        id: 1,
        titulo: "Primeras manzanas",
        descripcion: "Empieza a reconstruir las manzanas del Eixample.",

        filas: 5,
        columnas: 5,

        // Orden de las piezas de izquierda a derecha y de arriba abajo.
        solucion: [
            "vivienda", "vivienda", "vivienda",
            "vivienda", "parque",   "vivienda",
            "vivienda", "vivienda", "vivienda"
        ],

        // Cantidad de piezas disponibles.
        inventario: {
            vivienda: 8,
            parque: 1,
            equipamiento: 0
        },

        pista: "El espacio verde debe quedar en el centro de la manzana."
    },


    // NIVEL 2
    {
        id: 2,
        titulo: "Una ciudad organizada",
        descripcion: "Continúa el plano incorporando zonas verdes y equipamientos.",

        filas: 7,
        columnas: 7,

        solucion: [
            "vivienda",     "vivienda",     "vivienda",     "vivienda",
            "vivienda",     "parque",       "vivienda",     "vivienda",
            "vivienda",     "equipamiento", "parque",       "vivienda",
            "vivienda",     "vivienda",     "equipamiento", "vivienda"
        ],

        inventario: {
            vivienda: 12,
            parque: 2,
            equipamiento: 2
        },

        pista: "Distribuye los dos parques y los dos equipamientos por el plano."
    },


    // NIVEL 3
    {
        id: 3,
        titulo: "El plano definitivo",
        descripcion: "Completa la última reconstrucción de las manzanas de Cerdà.",

        filas: 9,
        columnas: 9,

        solucion: [
            "vivienda", "vivienda",     "vivienda",     "vivienda", "vivienda",
            "vivienda", "parque",       "vivienda",     "parque",   "vivienda",
            "vivienda", "vivienda",     "equipamiento", "vivienda", "vivienda",
            "vivienda", "parque",       "vivienda",     "parque",   "vivienda",
            "vivienda", "vivienda",     "vivienda",     "equipamiento", "vivienda"
        ],

        inventario: {
            vivienda: 19,
            parque: 4,
            equipamiento: 2
        },

        pista: "Comprueba que has colocado las cuatro zonas verdes y los dos equipamientos."
    }

];
