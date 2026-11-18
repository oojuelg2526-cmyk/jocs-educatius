# Cómo funciona el Memory de Barcelona

Guía corta para explicar el juego en la defensa. El juego es HTML, CSS y JavaScript puros, con módulos ES (`import` / `export`) y sin librerías.

## La idea en una frase
`game.js` decide **qué pasa** (las reglas) y no toca la página; `main.js` recibe los clics, pregunta a `game.js` y luego pide a los módulos de pantalla (`cards.js`, `panel.js`, `dialogs.js`, `map.js`) que **lo enseñen**.

## Una partida paso a paso
1. **Arranque** (`main.js`): `setupControls()` conecta los botones (idioma, sonido, pista, ayuda, reiniciar) y `startLevel()` abre el primer nivel que no esté superado (lo lee `storage.js`).
2. **Nivel nuevo**: `createGame(nivel)` (`game.js`) elige los monumentos y baraja las cartas. Después se pinta todo: el tablero (`cards.buildBoard`), la misión y los marcadores (`panel.js`), los puntos del mapa (`map.buildMap`) y la ventana de instrucciones con el ejemplo animado (`dialogs.showIntro`).
3. **«Jugar»**: `play()` cierra la ventana y pone en marcha el reloj (`setInterval` cada segundo, que llama a `tickSecond`).
4. **Clic en una carta**: `onFlip(uid)` llama a `flip(game, uid)`. `flip` cambia el estado de la partida y devuelve un **evento**: `first`, `match`, `mismatch`, `lupa`, `trampa` o `ignored`.
5. **Según el evento**, `main.js` pone el sonido y la animación: chispas y tarjeta de aprendizaje al acertar (`onMatch`), sacudida y tapar las cartas a los 1,5 s al fallar (`onMismatch` + `clearMismatch`), todas las cartas a la vista 3 s con la lupa (`onLupa`), cartas que se deslizan con la trampa (`onTrampa`). Al final siempre `refresh()` vuelve a pintar cartas y marcadores.
6. **Última pareja**: `game.status` pasa a `"won"`. `endLevel()` calcula el resultado (`result`), guarda métricas y progreso, lanza el confeti y abre la ventana con estrellas y resumen (`dialogs.showWin`).

## Qué hace cada archivo
| Archivo | En una frase |
|---|---|
| `levels.js` | Datos: los 12 monumentos y la configuración de los 3 niveles |
| `game.js` | Las reglas, sin tocar la página (por eso se prueba con `npm test`) |
| `main.js` | El director: une clics, reglas, sonido y pantalla |
| `cards.js` | Dibuja cada carta y el tablero, y enseña su estado |
| `panel.js` | Pestañas, misión, marcadores, bocadillo de Cerdà y tarjeta de aprendizaje |
| `dialogs.js` | La ventana de instrucciones y la de final de nivel |
| `map.js` | Pone los puntos de los barrios en el mapa (el dibujo está en `index.html`) |
| `effects.js` | Chispas, confeti, textos que suben y animaciones con clases CSS |
| `dom.js` | Atajos: `$` (buscar por id), `make` y `text` (crear elementos) |
| `icons.js` | Iconos SVG y siluetas de reserva |
| `lang.js` | Textos en catalán, castellano e inglés: `t("clave")` |
| `sound.js` | Sonidos con Web Audio y silencio |
| `storage.js` / `metrics.js` | Progreso del jugador y métricas de cada sesión en `localStorage` |

## Las 5 funciones clave de `game.js`
1. **`createGame(level, rng)`**: elige monumentos (en el nivel de barrios, sin barrios repetidos), crea dos cartas por monumento (ilustración + texto) más las especiales, las baraja con `shuffle` (Fisher-Yates) y devuelve el objeto de la partida (`cards`, `score`, `errors`, `combo`...).
2. **`flip(game, uid)`**: gira una carta. Si es especial la marca como usada; si es la primera, espera; si es la segunda compara `pair`: acierto (suma `100 × multiplicador` y mira si se ha ganado) o fallo (suma un error, combo a 0 y bloquea el tablero).
3. **`clearMismatch(game)`**: tapa las dos cartas del fallo y desbloquea el tablero. La llama la pantalla cuando ya se han visto.
4. **`hint(game)`**: gasta una pista y devuelve qué cartas iluminar (la pareja de la carta girada o una pareja tapada al azar). Pone el combo a 0.
5. **`stars(game)`**: estrellas según los fallos y los límites del nivel (`level.stars`); nunca menos de 1. Junto con `timeBonus` y `result` da el resumen final.

`rng` es el generador de números al azar: en el juego es `Math.random`; en las pruebas es uno fijo, para que el resultado sea siempre el mismo.

## Cómo se pinta una carta
- Cada carta es un `<button class="card">` con un `<span class="inner">` que lleva dos caras: el reverso (`.face.back`) y la cara (`.face.front`, la crea `faceContent`).
- El giro es solo CSS: la cara está girada 180° (`rotateY`) y `backface-visibility: hidden` esconde la que queda de espaldas. Cuando la carta tiene la clase `up`, `.inner` gira 180° y se ve la cara.
- `renderCards` no crea nada: solo pone o quita clases (`up`, `matched`, `used`, `peek`) según el `state` de cada carta en `game.js`, y su `aria-label` para el lector de pantalla.
- El aspecto de cada tipo (marco dorado, placa, chincheta, pergamino) sale de la clase `f-image`, `f-name`, `f-barrio` o `f-fact`.

## Puntos y métricas
- **Puntos**: 100 por pareja × multiplicador del combo (×1 a ×4). En los niveles 2 y 3, al ganar se suma el bonus: `(segundos del nivel − segundos usados) × 5`, nunca negativo.
- **Progreso** (`storage.js`, clave `cerda_progress`): último nivel superado, mejor puntuación de cada nivel y su suma. Es el mismo formato que tendrá la tabla `user_game_progress`.
- **Métricas** (`metrics.js`, clave `cerda_sessions`): una sesión por visita con `username`, `session_id`, `date_time`, `session_length` y una fila por nivel jugado (`level_time`, `errors_made`, `moves_count`, `help_clicks`, `score`, `stars`).

## Preguntas probables
- **¿Por qué `game.js` no toca el DOM?** Para separar reglas y pantalla: así las reglas se prueban con `node --test` sin navegador y la pantalla se puede cambiar sin romperlas.
- **¿Cómo sabe el juego si dos cartas son pareja?** Las dos cartas de un monumento tienen el mismo `pair` (su id). `flip` compara el `pair` de las dos cartas giradas.
- **¿Por qué no se pueden girar más cartas durante un fallo?** `flip` pone `game.locked = true` y no acepta clics hasta que `clearMismatch` lo desbloquea, 1,5 s después.
- **¿Cómo se baraja?** Con el algoritmo Fisher-Yates (`shuffle`): recorre la lista desde el final y cambia cada elemento por otro al azar de los anteriores.
- **¿Cómo funciona la trampa?** `shuffleHidden` solo baraja las posiciones de las cartas tapadas. Después `reorderBoard` mueve los botones y `flipMove` (técnica FLIP) los desliza desde su sitio antiguo.
- **¿Dónde están los textos y cómo se cambia de idioma?** En `lang.js`. El código nunca lleva textos: pide `t("clave")`. Al cambiar el idioma se traducen los textos fijos (`data-i18n`) y se vuelve a empezar el nivel.
- **¿Es accesible?** Las cartas son botones (Tab, Intro, Espacio y flechas), cada una tiene `aria-label`, los mensajes se leen con `aria-live`, la ventana atrapa el foco y se cierra con Escape, y con «reducir movimiento» no hay confeti ni giros.
- **¿Por qué no usáis `<canvas>`?** Porque todo son elementos del DOM y SVG: se pueden leer con el lector de pantalla, se estilan con CSS y las animaciones son transiciones y `@keyframes`.
