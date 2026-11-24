// Textos de la web en los tres idiomas y cambio de idioma.
// El HTML ya llega en catalán desde Laravel; aquí solo se cambia si el visitante elige otro idioma.
// El idioma se guarda en localStorage con la misma clave que usan los juegos ("cerda_lang"),
// así el idioma elegido en la web sigue en los juegos y al revés.
// También se guarda en una cookie para que Laravel escriba los mensajes de error en ese idioma.

const IDIOMAS = ["ca", "es", "en"];

const TEXTOS = {
    ca: {
        saltar: "Salta al contingut",
        marca: "Cerdà ha perdut el plànol",
        idioma: "Idioma",
        "menu.boton": "Menú",
        "menu.etiqueta": "Menú principal",
        "menu.inicio": "Inici",
        "menu.juegos": "Jocs",
        "menu.records": "Rècords",
        "menu.equipo": "Equip",
        "menu.entrar": "Entrar",
        "menu.admin": "Administració",
        "menu.salir": "Surt",

        "titulo.inicio": "Inici",
        "titulo.juegos": "Jocs",
        "titulo.records": "Rècords",
        "titulo.equipo": "Equip",
        "titulo.entrar": "Entrar",
        "titulo.registro": "Crea un compte",
        "titulo.admin": "Usuaris i puntuacions",
        "titulo.administradores": "Administradors",
        "titulo.error": "Error",

        "inicio.antetitulo": "Història i geografia de Barcelona",
        "inicio.titulo": "Ildefons Cerdà ha perdut el plànol",
        "inicio.texto": "La ciutat s’ha desordenat. Recupera les quatre peces del plànol jugant pel centre de Barcelona, fins a arribar a Urquinaona.",
        "inicio.empezar": "Comença a jugar",
        "inicio.como": "Mira com funciona",
        "plano.etiqueta": "Plànol de Cerdà",
        "plano.estado": "Peces recuperades: {n} de 4",
        "plano.nota": "S’omple amb el teu progrés en aquest navegador",
        "como.titulo": "Com funciona",
        "paso1.titulo": "Crea el teu compte",
        "paso1.texto": "Registra’t amb un usuari i comença pel joc 1. Els altres s’obren en ordre.",
        "paso2.titulo": "Juga i aprèn",
        "paso2.texto": "Quatre jocs sobre Barcelona: monuments, Eixample, història i metro. Tres nivells cadascun.",
        "paso3.titulo": "Completa el plànol",
        "paso3.texto": "Cada joc superat retorna una peça. En acabar, el plànol de Cerdà queda restaurat.",
        "cifra.juegos": "jocs, un per persona de l’equip",
        "cifra.niveles": "nivells en total",
        "cifra.idiomas": "idiomes: català, castellano, English",

        "juegos.antetitulo": "Ruta pel centre de Barcelona",
        "juegos.titulo": "Els quatre jocs",
        "juegos.texto": "Es juguen en ordre. Els bloquejats es veuen, però no s’obren fins que superes l’anterior.",
        "juego.memory.nombre": "Memory de Barcelona",
        "juego.memory.descripcion": "Uneix cada monument amb el seu barri i la seva dada històrica.",
        "juego.eixample.nombre": "Reconstrueix l’Eixample",
        "juego.eixample.descripcion": "Col·loca les illes seguint les regles de Cerdà.",
        "juego.timeline.nombre": "Línia del temps",
        "juego.timeline.descripcion": "Ordena les fites de la història de la ciutat.",
        "juego.metro.nombre": "Laberint del metro",
        "juego.metro.descripcion": "Recorre el metro fins a Urquinaona i ajunta el plànol.",
        "estado.superado": "Superat",
        "estado.disponible": "Disponible",
        "estado.bloqueado": "Bloquejat",
        "boton.jugar": "Juga",
        "boton.rejugar": "Torna a jugar",
        "boton.bloqueado": "Supera el joc anterior",

        "records.antetitulo": "Comunitat",
        "records.titulo": "Rècords",
        "records.periodo": "Període",
        "records.hoy": "Avui",
        "records.semana": "Aquesta setmana",
        "records.juego": "Joc",
        "records.caption": "Les 10 millors puntuacions",
        "records.cargando": "Carregant els rècords…",
        "records.vacio": "Encara no hi ha rècords en aquest període. Sigues el primer!",
        "records.error": "No s’han pogut carregar els rècords. Torna-ho a provar més tard.",
        "col.posicion": "Posició",
        "col.jugador": "Jugador",
        "col.nivel": "Nivell",
        "col.puntos": "Punts",
        "col.usuario": "Usuari",
        "col.correo": "Correu",
        "col.estado": "Estat",
        "col.acciones": "Accions",
        "col.juego": "Joc",
        "col.fecha": "Data",

        "equipo.antetitulo": "Qui ho fa",
        "equipo.titulo": "L’equip",
        "equipo.texto": "Quatre estudiants de DAW2 a Politècnics Barcelona. Cadascú fa un joc i es reparteixen les tasques comunes.",
        "equipo.juego": "Joc",

        "cuenta.antetitulo": "El teu compte",
        "entrar.titulo": "Entrar",
        "entrar.recordar": "Recorda’m en aquest dispositiu",
        "entrar.boton": "Inicia la sessió",
        "entrar.sin_cuenta": "Encara no tens compte?",
        "entrar.registrate": "Registra’t",
        "registro.titulo": "Crea un compte",
        "registro.boton": "Crea el compte i juga",
        "registro.ya": "Ja tens compte?",
        "registro.entra": "Entra",
        "campo.usuario": "Usuari",
        "campo.correo": "Correu",
        "campo.contrasena": "Contrasenya",
        "campo.contrasena_nueva": "Contrasenya nova (opcional)",
        "campo.puntos": "Punts",
        "ayuda.usuario": "Lletres, números, guions i guions baixos.",
        "ayuda.contrasena8": "Mínim 8 caràcters.",
        "ayuda.contrasena12": "Mínim 12 caràcters.",
        "ph.usuario": "el teu usuari",
        "ph.correo": "nom@correu.cat",
        "ph.contrasena8": "Mínim 8 caràcters",

        "admin.antetitulo": "Administració",
        "admin.titulo": "Usuaris i puntuacions",
        "admin.submenu": "Seccions de l’administració",
        "admin.buscar": "Cerca un usuari",
        "admin.boton_buscar": "Cerca",
        "admin.limpiar": "Treu la cerca",
        "admin.usuarios": "Usuaris",
        "admin.puntuaciones": "Puntuacions",
        "admin.caption_usuarios": "Jugadors registrats",
        "admin.caption_puntuaciones": "Puntuació de cada partida, de més alta a més baixa",
        "admin.sin_usuarios": "No hi ha cap jugador amb aquesta cerca.",
        "admin.sin_jugadores": "Encara no hi ha cap jugador registrat.",
        "admin.sin_partidas": "Encara no hi ha cap puntuació.",
        "admin.sin_puntuaciones": "No hi ha cap puntuació amb aquesta cerca.",
        "admin.auditoria": "Cada canvi queda apuntat al registre d’auditoria.",
        "admin.confirmar_borrar": "Segur? Aquesta acció no es pot desfer.",
        "estado.activo": "Actiu",
        "estado.inactivo": "Desactivat",
        "boton.modificar": "Modifica",
        "boton.guardar": "Desa",
        "boton.desactivar": "Desactiva",
        "boton.activar": "Activa",
        "boton.borrar": "Esborra",
        "boton.si_borrar": "Sí, esborra-la",
        "admins.titulo": "Administradors",
        "admins.crear": "Crea un administrador",
        "admins.caption": "Administradors del lloc",
        "admins.sin": "Encara no hi ha cap administrador.",
        "admins.ayuda": "Només el superadministrador pot crear, modificar o desactivar administradors.",

        "paginacion.etiqueta": "Paginació",
        "paginacion.anterior": "Anterior",
        "paginacion.siguiente": "Següent",
        "paginacion.pagina": "Pàgina",

        "error.titulo": "Alguna cosa no ha anat bé",
        "error.403": "No tens permís per veure aquesta pàgina.",
        "error.404": "Aquesta pàgina no existeix o s’ha mogut.",
        "error.419": "La pàgina ha caducat. Torna enrere i prova-ho de nou.",
        "error.429": "Has fet massa intents seguits. Espera un minut i torna-ho a provar.",
        "error.volver": "Torna a l’inici"
    },

    es: {
        saltar: "Saltar al contenido",
        marca: "Cerdà perdió el plano",
        idioma: "Idioma",
        "menu.boton": "Menú",
        "menu.etiqueta": "Menú principal",
        "menu.inicio": "Inicio",
        "menu.juegos": "Juegos",
        "menu.records": "Récords",
        "menu.equipo": "Equipo",
        "menu.entrar": "Entrar",
        "menu.admin": "Administración",
        "menu.salir": "Salir",

        "titulo.inicio": "Inicio",
        "titulo.juegos": "Juegos",
        "titulo.records": "Récords",
        "titulo.equipo": "Equipo",
        "titulo.entrar": "Entrar",
        "titulo.registro": "Crear cuenta",
        "titulo.admin": "Usuarios y puntuaciones",
        "titulo.administradores": "Administradores",
        "titulo.error": "Error",

        "inicio.antetitulo": "Historia y geografía de Barcelona",
        "inicio.titulo": "Ildefons Cerdà perdió el plano",
        "inicio.texto": "La ciudad se ha desordenado. Recupera las cuatro piezas del plano jugando por el centro de Barcelona, hasta llegar a Urquinaona.",
        "inicio.empezar": "Empezar a jugar",
        "inicio.como": "Ver cómo funciona",
        "plano.etiqueta": "Plano de Cerdà",
        "plano.estado": "Piezas recuperadas: {n} de 4",
        "plano.nota": "Se rellena con tu progreso en este navegador",
        "como.titulo": "Cómo funciona",
        "paso1.titulo": "Crea tu cuenta",
        "paso1.texto": "Regístrate con un usuario y empieza por el juego 1. Los demás se abren en orden.",
        "paso2.titulo": "Juega y aprende",
        "paso2.texto": "Cuatro juegos sobre Barcelona: monumentos, Eixample, historia y metro. Tres niveles cada uno.",
        "paso3.titulo": "Completa el plano",
        "paso3.texto": "Cada juego superado devuelve una pieza. Al terminar, el plano de Cerdà queda restaurado.",
        "cifra.juegos": "juegos, uno por persona del equipo",
        "cifra.niveles": "niveles en total",
        "cifra.idiomas": "idiomas: català, castellano, English",

        "juegos.antetitulo": "Ruta por el centro de Barcelona",
        "juegos.titulo": "Los cuatro juegos",
        "juegos.texto": "Se juegan en orden. Los bloqueados se ven, pero no se abren hasta superar el anterior.",
        "juego.memory.nombre": "Memory de Barcelona",
        "juego.memory.descripcion": "Une cada monumento con su barrio y su dato histórico.",
        "juego.eixample.nombre": "Reconstruye el Eixample",
        "juego.eixample.descripcion": "Coloca las manzanas siguiendo las reglas de Cerdà.",
        "juego.timeline.nombre": "Línea del tiempo",
        "juego.timeline.descripcion": "Ordena los hitos de la historia de la ciudad.",
        "juego.metro.nombre": "Laberinto de metro",
        "juego.metro.descripcion": "Recorre el metro hasta Urquinaona y junta el plano.",
        "estado.superado": "Superado",
        "estado.disponible": "Disponible",
        "estado.bloqueado": "Bloqueado",
        "boton.jugar": "Jugar",
        "boton.rejugar": "Rejugar",
        "boton.bloqueado": "Supera el juego anterior",

        "records.antetitulo": "Comunidad",
        "records.titulo": "Récords",
        "records.periodo": "Periodo",
        "records.hoy": "Hoy",
        "records.semana": "Esta semana",
        "records.juego": "Juego",
        "records.caption": "Las 10 mejores puntuaciones",
        "records.cargando": "Cargando los récords…",
        "records.vacio": "Aún no hay récords en este periodo. ¡Sé el primero!",
        "records.error": "No se han podido cargar los récords. Vuelve a probar más tarde.",
        "col.posicion": "Posición",
        "col.jugador": "Jugador",
        "col.nivel": "Nivel",
        "col.puntos": "Puntos",
        "col.usuario": "Usuario",
        "col.correo": "Correo",
        "col.estado": "Estado",
        "col.acciones": "Acciones",
        "col.juego": "Juego",
        "col.fecha": "Fecha",

        "equipo.antetitulo": "Quién lo hace",
        "equipo.titulo": "El equipo",
        "equipo.texto": "Cuatro estudiantes de DAW2 en Politècnics Barcelona. Cada uno hace un juego y se reparten las tareas comunes.",
        "equipo.juego": "Juego",

        "cuenta.antetitulo": "Tu cuenta",
        "entrar.titulo": "Entrar",
        "entrar.recordar": "Recordarme en este dispositivo",
        "entrar.boton": "Iniciar sesión",
        "entrar.sin_cuenta": "¿Aún no tienes cuenta?",
        "entrar.registrate": "Regístrate",
        "registro.titulo": "Crear cuenta",
        "registro.boton": "Crear cuenta y jugar",
        "registro.ya": "¿Ya tienes cuenta?",
        "registro.entra": "Entra",
        "campo.usuario": "Usuario",
        "campo.correo": "Correo",
        "campo.contrasena": "Contraseña",
        "campo.contrasena_nueva": "Contraseña nueva (opcional)",
        "campo.puntos": "Puntos",
        "ayuda.usuario": "Letras, números, guiones y guiones bajos.",
        "ayuda.contrasena8": "Mínimo 8 caracteres.",
        "ayuda.contrasena12": "Mínimo 12 caracteres.",
        "ph.usuario": "tu usuario",
        "ph.correo": "nombre@correo.com",
        "ph.contrasena8": "Mínimo 8 caracteres",

        "admin.antetitulo": "Administración",
        "admin.titulo": "Usuarios y puntuaciones",
        "admin.submenu": "Secciones de la administración",
        "admin.buscar": "Buscar usuario",
        "admin.boton_buscar": "Buscar",
        "admin.limpiar": "Quitar la búsqueda",
        "admin.usuarios": "Usuarios",
        "admin.puntuaciones": "Puntuaciones",
        "admin.caption_usuarios": "Jugadores registrados",
        "admin.caption_puntuaciones": "Puntuación de cada partida, de más alta a más baja",
        "admin.sin_usuarios": "No hay ningún jugador con esta búsqueda.",
        "admin.sin_jugadores": "Aún no hay ningún jugador registrado.",
        "admin.sin_partidas": "Aún no hay ninguna puntuación.",
        "admin.sin_puntuaciones": "No hay ninguna puntuación con esta búsqueda.",
        "admin.auditoria": "Cada cambio queda apuntado en el registro de auditoría.",
        "admin.confirmar_borrar": "¿Seguro? Esta acción no se puede deshacer.",
        "estado.activo": "Activo",
        "estado.inactivo": "Desactivado",
        "boton.modificar": "Modificar",
        "boton.guardar": "Guardar",
        "boton.desactivar": "Desactivar",
        "boton.activar": "Activar",
        "boton.borrar": "Borrar",
        "boton.si_borrar": "Sí, bórrala",
        "admins.titulo": "Administradores",
        "admins.crear": "Crear administrador",
        "admins.caption": "Administradores del sitio",
        "admins.sin": "Aún no hay ningún administrador.",
        "admins.ayuda": "Solo el superadministrador puede crear, modificar o desactivar administradores.",

        "paginacion.etiqueta": "Paginación",
        "paginacion.anterior": "Anterior",
        "paginacion.siguiente": "Siguiente",
        "paginacion.pagina": "Página",

        "error.titulo": "Algo no ha ido bien",
        "error.403": "No tienes permiso para ver esta página.",
        "error.404": "Esta página no existe o se ha movido.",
        "error.419": "La página ha caducado. Vuelve atrás e inténtalo de nuevo.",
        "error.429": "Has hecho demasiados intentos seguidos. Espera un minuto y vuelve a probar.",
        "error.volver": "Volver al inicio"
    },

    en: {
        saltar: "Skip to content",
        marca: "Cerdà lost the map",
        idioma: "Language",
        "menu.boton": "Menu",
        "menu.etiqueta": "Main menu",
        "menu.inicio": "Home",
        "menu.juegos": "Games",
        "menu.records": "High scores",
        "menu.equipo": "Team",
        "menu.entrar": "Log in",
        "menu.admin": "Admin",
        "menu.salir": "Log out",

        "titulo.inicio": "Home",
        "titulo.juegos": "Games",
        "titulo.records": "High scores",
        "titulo.equipo": "Team",
        "titulo.entrar": "Log in",
        "titulo.registro": "Create account",
        "titulo.admin": "Users and scores",
        "titulo.administradores": "Administrators",
        "titulo.error": "Error",

        "inicio.antetitulo": "Barcelona history and geography",
        "inicio.titulo": "Ildefons Cerdà lost the map",
        "inicio.texto": "The city is in a mess. Get back the four pieces of the map by playing your way through central Barcelona, all the way to Urquinaona.",
        "inicio.empezar": "Start playing",
        "inicio.como": "See how it works",
        "plano.etiqueta": "Cerdà’s map",
        "plano.estado": "Pieces recovered: {n} of 4",
        "plano.nota": "It fills in with your progress in this browser",
        "como.titulo": "How it works",
        "paso1.titulo": "Create your account",
        "paso1.texto": "Sign up with a username and start with game 1. The others open in order.",
        "paso2.titulo": "Play and learn",
        "paso2.texto": "Four games about Barcelona: monuments, the Eixample, history and the metro. Three levels each.",
        "paso3.titulo": "Complete the map",
        "paso3.texto": "Each game you beat gives back a piece. At the end, Cerdà’s map is restored.",
        "cifra.juegos": "games, one per team member",
        "cifra.niveles": "levels in total",
        "cifra.idiomas": "languages: català, castellano, English",

        "juegos.antetitulo": "A route through central Barcelona",
        "juegos.titulo": "The four games",
        "juegos.texto": "They are played in order. Locked games are visible, but they only open once you beat the previous one.",
        "juego.memory.nombre": "Barcelona Memory",
        "juego.memory.descripcion": "Match each monument with its neighbourhood and a historical fact.",
        "juego.eixample.nombre": "Rebuild the Eixample",
        "juego.eixample.descripcion": "Place the blocks following Cerdà’s rules.",
        "juego.timeline.nombre": "Timeline",
        "juego.timeline.descripcion": "Put the milestones of the city’s history in order.",
        "juego.metro.nombre": "Metro maze",
        "juego.metro.descripcion": "Ride the metro to Urquinaona and put the map together.",
        "estado.superado": "Completed",
        "estado.disponible": "Available",
        "estado.bloqueado": "Locked",
        "boton.jugar": "Play",
        "boton.rejugar": "Play again",
        "boton.bloqueado": "Beat the previous game",

        "records.antetitulo": "Community",
        "records.titulo": "High scores",
        "records.periodo": "Period",
        "records.hoy": "Today",
        "records.semana": "This week",
        "records.juego": "Game",
        "records.caption": "Top 10 scores",
        "records.cargando": "Loading high scores…",
        "records.vacio": "No high scores in this period yet. Be the first!",
        "records.error": "High scores could not be loaded. Please try again later.",
        "col.posicion": "Rank",
        "col.jugador": "Player",
        "col.nivel": "Level",
        "col.puntos": "Points",
        "col.usuario": "Username",
        "col.correo": "Email",
        "col.estado": "Status",
        "col.acciones": "Actions",
        "col.juego": "Game",
        "col.fecha": "Date",

        "equipo.antetitulo": "Who makes it",
        "equipo.titulo": "The team",
        "equipo.texto": "Four DAW2 students at Politècnics Barcelona. Each one makes a game and they share the common tasks.",
        "equipo.juego": "Game",

        "cuenta.antetitulo": "Your account",
        "entrar.titulo": "Log in",
        "entrar.recordar": "Remember me on this device",
        "entrar.boton": "Log in",
        "entrar.sin_cuenta": "No account yet?",
        "entrar.registrate": "Sign up",
        "registro.titulo": "Create account",
        "registro.boton": "Create account and play",
        "registro.ya": "Already have an account?",
        "registro.entra": "Log in",
        "campo.usuario": "Username",
        "campo.correo": "Email",
        "campo.contrasena": "Password",
        "campo.contrasena_nueva": "New password (optional)",
        "campo.puntos": "Points",
        "ayuda.usuario": "Letters, numbers, hyphens and underscores.",
        "ayuda.contrasena8": "At least 8 characters.",
        "ayuda.contrasena12": "At least 12 characters.",
        "ph.usuario": "your username",
        "ph.correo": "name@email.com",
        "ph.contrasena8": "At least 8 characters",

        "admin.antetitulo": "Admin",
        "admin.titulo": "Users and scores",
        "admin.submenu": "Admin sections",
        "admin.buscar": "Search for a user",
        "admin.boton_buscar": "Search",
        "admin.limpiar": "Clear search",
        "admin.usuarios": "Users",
        "admin.puntuaciones": "Scores",
        "admin.caption_usuarios": "Registered players",
        "admin.caption_puntuaciones": "Score of each game session, highest first",
        "admin.sin_usuarios": "No players match this search.",
        "admin.sin_jugadores": "There are no registered players yet.",
        "admin.sin_partidas": "There are no scores yet.",
        "admin.sin_puntuaciones": "No scores match this search.",
        "admin.auditoria": "Every change is recorded in the audit log.",
        "admin.confirmar_borrar": "Are you sure? This cannot be undone.",
        "estado.activo": "Active",
        "estado.inactivo": "Deactivated",
        "boton.modificar": "Edit",
        "boton.guardar": "Save",
        "boton.desactivar": "Deactivate",
        "boton.activar": "Activate",
        "boton.borrar": "Delete",
        "boton.si_borrar": "Yes, delete it",
        "admins.titulo": "Administrators",
        "admins.crear": "Create administrator",
        "admins.caption": "Site administrators",
        "admins.sin": "There are no administrators yet.",
        "admins.ayuda": "Only the superadministrator can create, edit or deactivate administrators.",

        "paginacion.etiqueta": "Pagination",
        "paginacion.anterior": "Previous",
        "paginacion.siguiente": "Next",
        "paginacion.pagina": "Page",

        "error.titulo": "Something went wrong",
        "error.403": "You do not have permission to see this page.",
        "error.404": "This page does not exist or has moved.",
        "error.419": "The page has expired. Go back and try again.",
        "error.429": "Too many attempts in a row. Wait a minute and try again.",
        "error.volver": "Back to home"
    }
};

// Idioma guardado; si no hay ninguno (o no se puede leer), catalán.
function idiomaActual() {
    let guardado = null;
    try {
        guardado = localStorage.getItem("cerda_lang");
    } catch (error) {
        guardado = null;
    }
    if (IDIOMAS.includes(guardado)) {
        return guardado;
    }
    return "ca";
}

// Devuelve el texto de una clave en el idioma actual. {n} y similares se sustituyen por "valores".
function textoTraducido(clave, valores = {}) {
    const idioma = idiomaActual();
    let texto = TEXTOS[idioma][clave] ?? TEXTOS.ca[clave] ?? clave;
    for (const nombre of Object.keys(valores)) {
        texto = texto.replace(`{${nombre}}`, valores[nombre]);
    }
    return texto;
}

// Cambia todos los textos marcados con data-i18n (y sus variantes para atributos).
function aplicarIdioma() {
    const idioma = idiomaActual();
    document.documentElement.lang = idioma;

    for (const elemento of document.querySelectorAll("[data-i18n]")) {
        const clave = elemento.dataset.i18n;
        if (elemento.tagName === "TITLE") {
            elemento.textContent = `${textoTraducido(clave)} · ${textoTraducido("marca")}`;
        } else {
            elemento.textContent = textoTraducido(clave);
        }
    }
    for (const elemento of document.querySelectorAll("[data-i18n-placeholder]")) {
        elemento.placeholder = textoTraducido(elemento.dataset.i18nPlaceholder);
    }
    for (const elemento of document.querySelectorAll("[data-i18n-aria-label]")) {
        elemento.setAttribute("aria-label", textoTraducido(elemento.dataset.i18nAriaLabel));
    }

    const selector = document.getElementById("idioma");
    if (selector) {
        selector.value = idioma;
    }

    // Aviso para los scripts de cada página que pintan textos propios (plano, juegos, récords)
    document.dispatchEvent(new CustomEvent("idioma-cambiado", { detail: { idioma } }));
}

// Guarda el idioma elegido en localStorage (para los juegos) y en una cookie (para Laravel).
function guardarIdioma(idioma) {
    try {
        localStorage.setItem("cerda_lang", idioma);
    } catch (error) {
        console.warn("No s’ha pogut desar l’idioma.", error);
    }
    document.cookie = `cerda_lang=${idioma}; path=/; max-age=31536000; SameSite=Lax`;
}

document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("idioma");
    if (selector) {
        selector.addEventListener("change", () => {
            guardarIdioma(selector.value);
            aplicarIdioma();
        });
    }

    // Si el idioma viene de un juego, la cookie se pone al día para los mensajes del servidor
    const idioma = idiomaActual();
    if (!document.cookie.includes(`cerda_lang=${idioma}`)) {
        guardarIdioma(idioma);
    }

    // En catalán el HTML ya está bien; solo se repinta si hace falta
    if (idioma !== "ca") {
        aplicarIdioma();
    }
});

// Al volver de un juego con el botón «atrás» el idioma puede haber cambiado
window.addEventListener("pageshow", (evento) => {
    if (evento.persisted) {
        aplicarIdioma();
    }
});
