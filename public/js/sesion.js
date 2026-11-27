// SESIÓN COMÚN DE LOS CUATRO JUEGOS
// Cada juego lo carga antes que sus scripts con <script src="/js/sesion.js"></script>.
// Da tres cosas a todos los juegos por igual:
//   - el nombre del jugador (el que guarda la web al iniciar sesión),
//   - el session_id de esta visita al juego (un UUID, como pide la base de datos),
//   - el envío de las métricas de un nivel a /api/guardar-metricas.
// Todo va dentro del objeto Cerda para no chocar con las funciones de cada juego.

const Cerda = {
  // ---------- Jugador ----------

  // Nombre del jugador. Primero el de la web (cerda_username), después el nombre
  // antiguo (username) y, si no hay ninguno, "invitado".
  usuario() {
    let nombre = Cerda.leer(Cerda.almacenLocal(), "cerda_username");
    if (nombre === null || nombre === "") {
      nombre = Cerda.leer(Cerda.almacenLocal(), "username");
    }
    if (nombre === null) {
      nombre = "";
    }
    return Cerda.limpiarNombre(nombre);
  },

  // El servidor solo acepta letras, números, _ y - (regla alpha_dash) y 40 caracteres.
  // Lo demás (espacios, puntos, @...) se cambia por _.
  limpiarNombre(nombre) {
    let limpio = String(nombre).trim().replace(/[^\p{L}\p{M}\p{N}_-]/gu, "_");
    limpio = limpio.slice(0, 40);
    if (limpio === "") {
      return "invitado";
    }
    return limpio;
  },

  // ---------- Sesión de la visita ----------
  // Se guarda en sessionStorage: si se recarga la página, la pestaña sigue en la
  // misma sesión; si se cierra la pestaña, la próxima visita es una sesión nueva.

  // Crea una sesión nueva para el juego y devuelve su session_id.
  nuevaSesion(juego) {
    const id = Cerda.crearUuid();
    Cerda.escribir(Cerda.almacenSesion(), "cerda_session_" + juego, id);
    Cerda.escribir(Cerda.almacenSesion(), "cerda_inicio_" + juego, String(Date.now()));
    return id;
  },

  // session_id de la visita actual. Si no hay ninguno (o no es válido), crea uno.
  sesionActual(juego) {
    const guardado = Cerda.leer(Cerda.almacenSesion(), "cerda_session_" + juego);
    if (guardado !== null && Cerda.esUuid(guardado)) {
      return guardado;
    }
    return Cerda.nuevaSesion(juego);
  },

  // Momento (en milisegundos) en que empezó la sesión de esta visita.
  inicioSesion(juego) {
    Cerda.sesionActual(juego); // por si aún no hay sesión
    const inicio = Number(Cerda.leer(Cerda.almacenSesion(), "cerda_inicio_" + juego));
    if (inicio > 0) {
      return inicio;
    }
    const ahora = Date.now();
    Cerda.escribir(Cerda.almacenSesion(), "cerda_inicio_" + juego, String(ahora));
    return ahora;
  },

  // Segundos enteros desde que empezó la sesión de esta visita.
  segundosDeSesion(juego) {
    return Math.round((Date.now() - Cerda.inicioSesion(juego)) / 1000);
  },

  // UUID versión 4. Si el navegador tiene crypto.randomUUID se usa; si no, se hace
  // a mano: 32 cifras hexadecimales al azar con guiones y las marcas de la versión 4.
  crearUuid() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    const hex = "0123456789abcdef";
    let id = "";
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        id += "-";
      } else if (i === 14) {
        id += "4"; // versión 4
      } else if (i === 19) {
        id += "89ab"[Math.floor(Math.random() * 4)]; // variante
      } else {
        id += hex[Math.floor(Math.random() * 16)];
      }
    }
    return id;
  },

  esUuid(texto) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(texto);
  },

  // ---------- Envío al servidor ----------

  // Envía las métricas de un nivel. Nunca rompe el juego: si falla la red o el
  // servidor contesta con un error, solo se avisa en la consola.
  enviar(datos) {
    try {
      return fetch("/api/guardar-metricas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(datos),
        keepalive: true, // así se envía aunque el jugador cambie de página justo después
      })
        .then((respuesta) => {
          if (!respuesta.ok) {
            console.warn("El servidor no ha guardado las métricas. Estado:", respuesta.status);
          }
          return respuesta;
        })
        .catch((error) => {
          console.warn("No se han podido enviar las métricas.", error);
          return null;
        });
    } catch (error) {
      console.warn("No se han podido enviar las métricas.", error);
      return Promise.resolve(null);
    }
  },

  // ---------- Lectura y escritura sin errores ----------
  // En modo privado o con las cookies bloqueadas, localStorage y sessionStorage
  // pueden fallar. Entonces se usa una caja en memoria que dura mientras la página.

  memoria: {},

  leer(almacen, clave) {
    if (almacen !== null) {
      try {
        const valor = almacen.getItem(clave);
        if (valor !== null) {
          return valor;
        }
      } catch (error) {
        // se sigue con la memoria
      }
    }
    if (Object.hasOwn(Cerda.memoria, clave)) {
      return Cerda.memoria[clave];
    }
    return null;
  },

  escribir(almacen, clave, valor) {
    Cerda.memoria[clave] = valor;
    if (almacen !== null) {
      try {
        almacen.setItem(clave, valor);
      } catch (error) {
        // ya está en la memoria
      }
    }
  },

  // Devuelven localStorage o sessionStorage, o null si el navegador no deja usarlos.
  almacenLocal() {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage;
      }
    } catch (error) {
      // el navegador no deja usarlo
    }
    return null;
  },

  almacenSesion() {
    try {
      if (typeof sessionStorage !== "undefined") {
        return sessionStorage;
      }
    } catch (error) {
      // el navegador no deja usarlo
    }
    return null;
  },
};

// Para que lo vean también los scripts de tipo módulo (como el del Eixample).
if (typeof window !== "undefined") {
  window.Cerda = Cerda;
}
