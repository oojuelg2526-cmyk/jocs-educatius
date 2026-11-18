# Guion para la revisión del juego 4 (Laberinto de metro)

Versión de revisión: **solo el nivel 1**, sin servidor, con JavaScript sencillo (sin módulos, sin `async`, sin sintaxis que no se haya visto en clase). El juego completo (3 niveles, servidor, login) sigue en la rama `feature/alex-integracion-laravel`.

## Cómo se abre
```bash
cd juegos/metro
npx serve .
```
Abre la dirección que te dé. Se juega con las flechas o WASD (o la cruceta en el móvil).

## Qué hace el juego, en una frase
Eres Cerdà bajando al metro: vas de **Universitat** a **Urquinaona** por la L1, pasas por **Catalunya** a recoger un trozo del plano y llegas al final. Los puntos y las estrellas dependen de cuánto te desvíes y de cuántas veces mires el plano.

## Qué hay hecho y qué falta (decirlo tal cual)
| Hecho | Falta |
|---|---|
| Nivel 1 jugable: mover la ficha, recoger el trozo, ganar | Niveles 2 y 3 (existen en otra rama, aún no se enseñan) |
| Puntos, estrellas, botón de ayuda, reloj | Conectar con el servidor y la base de datos |
| Textos en catalán, castellano e inglés | Unir con los otros tres juegos y la landing |
| Guarda la mejor puntuación y las partidas en el navegador (`localStorage`) | Estilo común definitivo de la landing |

## Los archivos (un trabajo por archivo)
Se cargan con `<script>` en este orden, y cada uno puede usar lo del anterior:

| Archivo | Qué hace | Tema de clase |
|---|---|---|
| `js/levels.js` | Los datos del nivel: el mapa como lista de textos, las estaciones, el trozo del plano | Arrays y objetos |
| `js/lang.js` | Todos los textos en ca/es/en y la función `t("clave")` que da el del idioma actual | Objetos, funciones, strings |
| `js/game.js` | Las reglas: crear la partida, mover, recoger, ganar, puntos y estrellas. No toca la página | Funciones, arrays, objetos, bucles |
| `js/ui.js` | Dibuja el tablero y el panel y enseña mensajes y la tarjeta final | DOM (seleccionar, crear, estilos, `dataset`) |
| `js/storage.js` | Guarda mejor puntuación y partidas | `localStorage`, JSON |
| `js/main.js` | Une todo: teclas, botones, reloj, idioma | Eventos, `setInterval` (BOM) |

**Idea clave para explicar:** separamos *reglas* (`game.js`) de *pantalla* (`ui.js`). Así las reglas no saben nada del navegador y cada parte se entiende por separado.

## Cómo funciona, paso a paso
1. **El mapa** (`levels.js`): una lista de textos. `#` es pared, `1` es vía de la L1 y una letra mayúscula (`U`, `C`, `R`) es una estación.
2. **Crear la partida** (`createGame`): recorre el mapa con dos bucles `for` y construye una tabla de casillas (`{type: "wall" | "track" | "station"}`). Busca dónde está la estación de salida y pone ahí la ficha.
3. **Dibujar** (`buildBoard`): por cada casilla crea un `div` dentro de un CSS Grid (`createElement`, `appendChild`, `classList`). No usamos `<canvas>`.
4. **Mover** (`move`): suma o resta a la fila y la columna según la tecla (`DIRS`). Si la casilla es pared o se sale del mapa, no se mueve ("Por ahí no hay vía"). Si hay un trozo, lo recoge. Si llega a Urquinaona sin todos los trozos, avisa; con todos, **gana**.
5. **Puntos** (`score`): `1000 − 5 por movimiento − 50 por ayuda + 100 por trozo`. **Estrellas** (`stars`): 3 si te pasas como mucho 2 movimientos de la mejor ruta (14) y no pides ayuda.
6. **Eventos** (`main.js`): `keydown` para las teclas, `click` para los botones, `change` para el idioma. `setInterval` suma un segundo cada segundo.
7. **Guardar** (`storage.js`): al ganar, guarda la sesión (`username`, `session_id`, `date_time`, `session_length` y las métricas) como JSON en `localStorage`.

## Métricas (lo que piden los profes)
Cada sesión guarda: `username`, `session_id`, `date_time`, `session_length` y, propias del juego, `level_reached`, `level_time`, `moves_count`, `help_clicks`, `final_score` (y `stars`). Son más de 4 métricas propias.

## Preguntas que pueden hacer y cómo responder
- **¿Por qué no `<canvas>`?** Porque está prohibido: el tablero son `div` en una cuadrícula CSS.
- **¿Cómo cambian los idiomas?** Ningún texto está en el código: todo está en `lang.js` y se pide con `t("clave")`. El selector guarda el idioma en `localStorage`.
- **¿Cómo sabes que el nivel se puede ganar?** La mejor ruta son 14 movimientos (todo recto a la derecha). En la rama completa hay pruebas automáticas que comprueban cada nivel.
- **¿Dónde se guardan los datos?** Hoy en el navegador (`localStorage`). El siguiente paso es la base de datos del equipo (SQL Server) con Laravel; el diseño de tablas y el contrato de datos ya están en `docs/modelo-relacional-bd.md` y `docs/api-contrato.md`.
- **¿Qué falta?** Niveles 2 y 3, servidor, y unirlo con los otros juegos en la landing.
- **¿Cómo lo has hecho?** Sé sincero. Si has usado una herramienta de IA para generar o ayudarte con el código, dilo y explica qué has entendido y qué has comprobado tú. Nadie te pide que sepas de memoria cada línea, pero sí que puedas explicar lo que presentas.

## Para practicar antes de la revisión
Abre `js/game.js` y sé capaz de contar con tus palabras `move()` (es la función más importante) y `score()`. Después `js/main.js`: dónde se escuchan las teclas y qué hace `endLevel()`.
