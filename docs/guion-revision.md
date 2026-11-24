# Guion para explicar el juego 4 (Laberinto de metro)

Versión actual: **3 niveles más largos**, sin servidor y con JavaScript sencillo (sin módulos, sin `async`, sin sintaxis que no se haya visto en clase).

## Cómo se abre
```bash
cd public/juegos/metro
npx serve .
```
Se juega con las flechas o WASD (o la cruceta en el móvil).

## Qué hace el juego, en una frase
Recorres el metro de Barcelona recogiendo los trozos del plano de Cerdà y llegas a **Urquinaona**. En el nivel 2 una estación está cerrada y hay que rodear cambiando de línea; en el nivel 3 hay tiempo límite y los nombres están ocultos.

## Idea clave para defender el código
- **El mapa es una lista de textos** (`levels.js`). Hacer un nivel más largo es dibujar un mapa más grande: el código no cambia.
- **Reglas separadas de la pantalla**: `game.js` decide, `ui.js` solo dibuja, `main.js` los une.
- **Pocas piezas**: una estación cerrada, cambio de línea y tiempo límite. Nada más.

## Los archivos (se cargan en este orden)
| Archivo | Qué hace | Tema de clase |
|---|---|---|
| `js/levels.js` | Los datos de los 3 niveles | Arrays y objetos |
| `js/lang.js` | Textos en ca/es/en y `t("clave")` | Objetos, funciones, strings |
| `js/game.js` | Las reglas del juego | Funciones, arrays, objetos, bucles |
| `js/ui.js` | Dibuja tablero, panel y tarjetas | DOM (`createElement`, `classList`, `dataset`) |
| `js/storage.js` | Progreso y sesiones | `localStorage`, JSON |
| `js/main.js` | Teclas, botones, reloj, idioma | Eventos, `setInterval`, `setTimeout` |

## `game.js`, función por función
- `makeGrid(level)`: dos bucles `for` convierten el mapa de textos en una tabla de casillas: pared, vía o estación.
- `createGame(level)`: crea el estado de la partida (posición, línea, movimientos, ayudas, segundos, trozos).
- `cellAt`, `pieceAt`, `piecesLeft`: miran una casilla, el trozo que hay en ella y cuántos faltan.
- `canEnter(game, r, c)`: dice si puedes entrar en una casilla. Devuelve `"ok"` o el motivo: `"wall"` (pared o fuera del mapa), `"line"` (vía de otra línea) o `"closed"` (estación cerrada).
- `move(game, dir)`: **la más importante**. Calcula la casilla nueva con la dirección, pregunta a `canEnter`, y si se puede mueve la ficha, suma un movimiento, recoge el trozo si lo hay y comprueba si has llegado a Urquinaona con todos los trozos. Devuelve un «evento» para que la pantalla lo cuente.
- `chooseLine`: en una estación con varias líneas, elige por cuál sigues.
- `tickSecond`: suma un segundo y, si hay tiempo límite y se acaba, pone el estado en `timeout`.
- `score` y `stars`: `1000 − 5 por movimiento − 50 por ayuda + 100 por trozo`; 3 estrellas si te pasas como mucho 2 movimientos de la mejor ruta y no pides ayuda.

## `main.js`, el director de orquesta
- `startLevel(n)`: crea la partida del nivel, dibuja y arranca el reloj con `setInterval`.
- `step(dir)`: pasa el movimiento a `move()` y enseña el mensaje que toque.
- `endLevel()`: para el reloj, guarda la sesión y enseña la tarjeta de victoria o de tiempo agotado.
- Eventos: `keydown` (teclas), `click` (cruceta, línea, ayuda, reiniciar), `change` (idioma).

## Qué pasa desde que abres hasta que ganas
1. Se carga la página: `main.js` pone el idioma y abre el nivel que toca.
2. `createGame` crea la partida y `buildBoard` dibuja el tablero.
3. Pulsas una flecha: `keydown` → `step` → `move` → `render`.
4. Al llegar a Urquinaona con todos los trozos, `move` devuelve `won` → `endLevel`.
5. `endLevel` guarda la mejor puntuación y la sesión, y enseña «Nivel superado».

## Métricas (lo que piden los profes)
Cada sesión guarda `username`, `session_id`, `date_time` y `session_length`. Las métricas propias del juego, por cada intento de nivel, son `level_time`, `moves_count`, `help_clicks`, `score` y `stars`, y en la sesión `level_reached` y `final_score`.

## Preguntas que pueden hacer
- **¿Por qué no `<canvas>`?** Porque está prohibido: el tablero son `div` en una cuadrícula CSS.
- **¿Cómo cambian los idiomas?** Ningún texto está en el código: todo está en `lang.js` y se pide con `t("clave")`.
- **¿Cómo alargas un nivel?** Dibujando un mapa más grande y poniendo más trozos en `levels.js`.
- **¿Cómo se avisa a los otros juegos?** «Con `localStorage`, como acordó el equipo: este juego se abre con `juego3Superado` y, al ganar el nivel 3, guarda `juego4Superado`.»
- **¿Dónde se guardan los datos?** En el navegador (`localStorage`). El siguiente paso es la base de datos con Laravel; el diseño y el contrato de datos están en `docs/`.
- **¿Qué falta?** Conectar con la base de datos y el login, y unirlo con los otros juegos en la landing.
- **¿Cómo lo has hecho?** Sé sincero. Si has usado una herramienta de IA para ayudarte, dilo y explica qué has entendido y comprobado tú.

## Para practicar
1. Cuenta `move()` con tus palabras, de arriba abajo.
2. Sigue `startLevel` → `step` → `endLevel` en `main.js`.
3. Mira en `levels.js` qué cambia de un nivel a otro: estación cerrada, líneas y tiempo límite.
