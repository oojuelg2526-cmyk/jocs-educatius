# Memory de Barcelona (juego 1)

Primer juego de «Ildefons Cerdà perdió el plano». El jugador recupera el calco de la cuadrícula del Eixample uniendo cada monumento de Barcelona (su ilustración) con su nombre, su barrio o un dato histórico. La ficha del juego está en [`propostes/oscar-memory-de-barcelona.md`](../../propostes/oscar-memory-de-barcelona.md).

HTML, CSS y JavaScript puros, sin librerías y **sin `<canvas>`**: las cartas son `button`, el giro 3D es CSS (`rotateY`), el mapa y los iconos son SVG dentro de la página y los efectos (chispas, confeti, números que suben) son elementos del DOM animados con CSS.

## Cómo probarlo
Los módulos de JavaScript necesitan un servidor (no basta con abrir `index.html`). Desde esta carpeta:

```bash
python3 -m http.server 8777   # o bien: npx serve .
```

y abrir `http://localhost:8777`. Para empezar directamente en el nivel 3, en la consola del navegador:

```js
localStorage.setItem("cerda_progress", JSON.stringify({ games: { 1: { last_level_completed: 2, level_scores: {}, status: "unlocked" } } }));
```

Pruebas de las reglas (no hace falta navegador):

```bash
npm test
```

## Reglas
Todas las parejas son **ilustración del monumento + un texto**. Lo que cambia en cada nivel es el texto:

| Nivel | Parejas | Se une la ilustración con… | Carta de texto | Especiales | Reloj |
|---|---|---|---|---|---|
| 1 · Reconoce | 4 | su nombre | placa de mármol | — | solo cuenta |
| 2 · Sitúa | 6 | su barrio | chincheta de mapa | 2 lupas | bonus de puntos (120 s) |
| 3 · Recuerda | 8 | un dato histórico | pergamino | 1 lupa + 1 trampa | bonus de puntos (180 s) |

- **No se pierde nunca.** Los fallos solo bajan las estrellas (cada nivel tiene sus límites en `levels.js`). El reloj de los niveles 2 y 3 no acaba la partida: los segundos que sobran dan puntos extra.
- Al fallar, las dos cartas se ven un rato y se tapan solas (1,5 s con el giro).
- **Pista** (3 por nivel): ilumina una pareja; si ya hay una carta girada, ilumina la que le falta. Reinicia el combo.
- **Lupa de Cerdà** (dorada): enseña todas las cartas 3 segundos. **Plano desordenado** (roja, solo nivel 3): las cartas tapadas cambian de sitio y se ve cómo se mueven.
- **Combos**: aciertos seguidos multiplican los puntos (×2, ×3, ×4).
- Cada nivel empieza con una **tarjeta de instrucciones** con un ejemplo animado de pareja; se puede volver a abrir con el botón «?».
- Al acertar sale una **tarjeta de aprendizaje** con el monumento, su barrio y su dato, y el barrio se ilumina en el **mapa**.

## Cómo está organizado
Las reglas y la pantalla van separadas: `game.js` decide **qué pasa** y no toca la página; `main.js` recibe los clics, pregunta a `game.js` y pide a los módulos de pantalla que **lo enseñen**. Explicación paso a paso para la defensa: [`docs/como-funciona.md`](docs/como-funciona.md).

```
clic en una carta → main.js → game.js (flip) → evento (match, mismatch, lupa...)
                       └→ cards.js · panel.js · map.js · dialogs.js · effects.js · sound.js
```

## Qué hace cada archivo
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página, Cerdà y el dibujo del mapa en SVG |
| `css/memory.css` | Todo el estilo: colores, cartas, giro 3D, animaciones y versión móvil |
| `js/levels.js` | Los 12 monumentos (color, silueta y posición en el mapa) y los 3 niveles |
| `js/game.js` | Las reglas: girar, parejas, combos, fallos, pista, lupa, trampa, bonus, puntos y estrellas. No toca la página |
| `js/main.js` | Une todo: clics, reloj, sonidos y paso de un nivel a otro |
| `js/cards.js` | Dibuja cada carta y el tablero, y enseña su estado (tapada, girada, acertada) |
| `js/panel.js` | Pestañas de nivel, misión, marcadores, bocadillo de Cerdà y tarjeta de aprendizaje |
| `js/dialogs.js` | Ventana de instrucciones (con ejemplo animado) y de final de nivel |
| `js/map.js` | Pone los barrios en el mapa y los ilumina al acertar |
| `js/effects.js` | Chispas, confeti, números que flotan y movimiento de cartas (respeta «reducir movimiento») |
| `js/dom.js` | Atajos para buscar y crear elementos (`$`, `make`, `text`) |
| `js/icons.js` | Iconos SVG y siluetas de reserva de cada monumento |
| `js/lang.js` | Todos los textos en catalán, castellano e inglés, y el idioma elegido |
| `js/storage.js` | Progreso del jugador (de momento en `localStorage`) |
| `js/metrics.js` | Métricas de sesión: comunes (`username`, `session_id`, `date_time`, `session_length`) y propias (`attempts`, `errors_made`, `level_reached`, `level_time`) |
| `js/sound.js` | Sonidos con Web Audio y botón de silencio |
| `test/game.test.js` | Pruebas de las reglas (`npm test`) |
| `img/<id>.png` | Renders 3D de los monumentos (512 × 512, fondo transparente). Si falta alguno, la carta enseña una silueta y el nombre |

## Accesibilidad
- Se juega con teclado: Tab para entrar en el tablero, flechas para moverse, Intro o Espacio para girar, Escape para cerrar las ventanas.
- Cada carta dice qué es (`aria-label`); los mensajes de Cerdà y la tarjeta de aprendizaje se leen solos (`aria-live`).
- Con «reducir movimiento» activado no hay confeti ni chispas y los giros son instantáneos.

## Qué está hecho
- Niveles 1, 2 y 3 con las reglas de arriba, instrucciones con ejemplo animado y frase fija encima del tablero.
- Cartas distintas a la vista según el tipo (marco dorado, placa, chincheta, pergamino).
- Animaciones: reparto de cartas, giro con rebote, elevación al pasar el ratón, brillo y chispas al acertar, sacudida al fallar, puntos y combos que flotan, barra de progreso, estrellas una a una, confeti al ganar y paso entre niveles.
- Mapa de Barcelona, Cerdà con bocadillos, fondo de plano antiguo, 3 idiomas, sonido y versión móvil.

## Pendiente
- Contrastar barrios y datos históricos con una fuente fiable.
- Mapa con los contornos reales de los barrios (Open Data BCN); ahora es un esquema.
- Modo contrarreloj.
- Enlace con el juego 2 (qué pieza se entrega al terminar) y envío de métricas al servidor.
