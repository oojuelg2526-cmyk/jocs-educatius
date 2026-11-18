// REGLAS DEL MEMORY. Aquí no se toca la página (nada de document ni de botones):
// solo se cambia el objeto «partida». Así las reglas se pueden probar con `npm test`.
// Usa MONUMENTOS, PISTAS_POR_NIVEL y los puntos de datos.js, que se carga antes.

// Baraja una lista y devuelve una copia (algoritmo de Fisher-Yates).
// Recorre la lista desde el final y cambia cada elemento por otro al azar de los anteriores.
function barajar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const guardada = copia[i];
    copia[i] = copia[j];
    copia[j] = guardada;
  }
  return copia;
}

// Crea la partida de un nivel: elige monumentos al azar y hace dos cartas de cada uno,
// la ilustración y el texto del nivel (nombre, barrio o dato). Después las baraja.
function crearPartida(nivel) {
  // En el nivel de barrios no puede haber dos monumentos del mismo barrio (Casa Batlló y
  // La Pedrera están en la Dreta de l'Eixample): la pareja sería ambigua.
  const monumentos = [];
  barajar(MONUMENTOS).forEach((monumento) => {
    const repetido = monumentos.some((m) => m.barrio === monumento.barrio);
    if (monumentos.length < nivel.parejas && !(nivel.tipo === "barrio" && repetido)) {
      monumentos.push(monumento);
    }
  });
  const cartas = [];
  monumentos.forEach((monumento) => {
    cartas.push({ pareja: monumento.id, tipo: "imagen", estado: "tapada" });
    cartas.push({ pareja: monumento.id, tipo: nivel.tipo, estado: "tapada" });
  });

  return {
    nivel: nivel,
    monumentos: monumentos,
    cartas: barajar(cartas),
    giradas: [], // cartas boca arriba que aún no son pareja (0, 1 o 2)
    aciertos: 0,
    fallos: 0,
    movimientos: 0, // cada vez que se giran dos cartas
    pistas: PISTAS_POR_NIVEL, // pistas que quedan
    pistasUsadas: 0,
    segundos: 0,
    bloqueada: false, // true mientras se ven las dos cartas de un fallo
    terminada: false,
  };
}

// Gira la carta que está en la posición «indice». Devuelve qué ha pasado:
// "nada" (no se puede girar), "primera", "pareja" o "fallo".
function girarCarta(partida, indice) {
  const carta = partida.cartas[indice];
  if (partida.bloqueada || partida.terminada || carta.estado !== "tapada") {
    return "nada";
  }

  carta.estado = "girada";
  partida.giradas.push(carta);
  if (partida.giradas.length === 1) {
    return "primera";
  }

  // Ya hay dos cartas boca arriba: se comparan
  partida.movimientos++;
  const primera = partida.giradas[0];
  const segunda = partida.giradas[1];

  if (primera.pareja === segunda.pareja) {
    primera.estado = "acertada";
    segunda.estado = "acertada";
    partida.giradas = [];
    partida.aciertos++;
    partida.terminada = partida.aciertos === partida.nivel.parejas;
    return "pareja";
  }

  // No son pareja: se suma un fallo y no se puede girar nada hasta taparlas
  partida.fallos++;
  partida.bloqueada = true;
  return "fallo";
}

// Tapa las dos cartas del fallo. La pantalla la llama cuando ya se han visto un rato.
function taparFallo(partida) {
  partida.giradas.forEach((carta) => {
    carta.estado = "tapada";
  });
  partida.giradas = [];
  partida.bloqueada = false;
}

// Pista: devuelve las posiciones de las dos cartas de una pareja que aún está tapada.
// Si ya hay una carta girada, devuelve la que le falta. Si no quedan pistas, devuelve [].
function usarPista(partida) {
  if (partida.pistas === 0 || partida.bloqueada || partida.terminada) {
    return [];
  }

  let pareja;
  if (partida.giradas.length === 1) {
    pareja = partida.giradas[0].pareja;
  } else {
    const tapadas = partida.cartas.filter((carta) => carta.estado === "tapada");
    pareja = tapadas[Math.floor(Math.random() * tapadas.length)].pareja;
  }

  partida.pistas--;
  partida.pistasUsadas++;
  const posiciones = [];
  partida.cartas.forEach((carta, i) => {
    if (carta.pareja === pareja && carta.estado === "tapada") {
      posiciones.push(i);
    }
  });
  return posiciones;
}

// Suma un segundo al reloj de la partida (no hay tiempo límite: solo se cuenta).
function contarSegundo(partida) {
  if (!partida.terminada) {
    partida.segundos++;
  }
}

// Estrellas según los fallos. Nunca menos de 1: en este juego no se pierde.
function calcularEstrellas(partida) {
  const maximoPara3 = partida.nivel.estrellas[0];
  const maximoPara2 = partida.nivel.estrellas[1];
  if (partida.fallos <= maximoPara3) return 3;
  if (partida.fallos <= maximoPara2) return 2;
  return 1;
}

// Puntos: 100 por pareja y 10 menos por cada fallo (nunca por debajo de 0).
function calcularPuntos(partida) {
  const puntos = partida.aciertos * PUNTOS_POR_PAREJA - partida.fallos * PUNTOS_MENOS_POR_FALLO;
  return Math.max(0, puntos);
}
