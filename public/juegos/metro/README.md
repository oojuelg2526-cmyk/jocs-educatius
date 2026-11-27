# Laberinto de metro (juego 4)

Último juego de «Ildefons Cerdà perdió el plano». El jugador recorre el metro de Barcelona recogiendo los trozos del plano y llega a Urquinaona. Ficha del juego: [`propostes/alex-laberinto-de-metro.md`](../../../propostes/alex-laberinto-de-metro.md).

HTML, CSS y JavaScript puros, sin librerías y **sin `<canvas>`**. El tablero usa elementos `div` en un CSS Grid. Laravel sirve el juego desde `public/juegos/metro/`.

## Cómo probarlo
Arranca Laravel con `php artisan serve`. Abre la portada en `http://localhost:8000/` y completa los tres juegos anteriores en ese mismo navegador. La entrada directa es `http://localhost:8000/juegos/metro/index.html`.

Pruebas (los 3 niveles tienen solución y la mejor ruta es la que dice `bestMoves`):

```bash
npm test
```

Se mueve la ficha con las flechas o WASD (o la cruceta en el móvil).

## Los 3 niveles
| Nivel | Qué pasa | Mejor ruta |
|---|---|---|
| 1 · Primer viaje | La L1 real, de Rocafort a Glòries, con las estaciones en su orden. Los 3 trozos están en los extremos de la línea | 46 movimientos |
| 2 · Correspondencias | El centro con la L1, L2, L3 y L4. Catalunya está cerrada: hay que ir por la L2 y la L4 y cambiar de línea. 6 trozos | 72 movimientos |
| 3 · El plano completo | Toda la red del centro. 7 trozos, 300 segundos de tiempo límite y los nombres de las estaciones ocultos | 110 movimientos |

Para hacer un nivel más largo basta con dibujar un mapa más grande en `js/levels.js`: el código no cambia.

## Qué hace cada archivo
Se cargan con `<script>` en este orden y cada uno puede usar lo de los anteriores.

| Archivo | Para qué sirve |
|---|---|
| `js/levels.js` | Los datos de los 3 niveles: mapas, estaciones, trozos, estación cerrada y tiempo límite |
| `js/lang.js` | Todos los textos en catalán, castellano e inglés y la función `t("clave")` |
| `js/game.js` | Las reglas: mover, cambiar de línea, recoger trozos, ganar, puntos y estrellas. No toca la página |
| `js/ui.js` | Dibuja el tablero y el panel y enseña mensajes y tarjetas |
| `../../js/progresion.js` | Consulta las victorias consecutivas de la aventura |
| `js/storage.js` | Guarda el progreso y las sesiones con sus métricas en `localStorage` |
| `js/main.js` | Comprueba el acceso y conecta teclas, botones, reloj e idioma |
| `css/metro.css` | Estilo (variables de color y tipografía del proyecto) |

## Cómo funciona, en pocas palabras
1. **El mapa** es una lista de textos. Cada letra es una casilla: `#` pared, `1`, `2` o `4` vía de esa línea, y una letra mayúscula es una estación.
2. **Mover la ficha:** una tecla llama a `move()`. La ficha solo entra en una casilla si es de la línea en la que viaja y no está cerrada.
3. **Cambiar de línea:** solo en una estación con varias líneas, con los botones L1, L2 o L4.
4. **Ganar:** llegar a Urquinaona con todos los trozos del plano.
5. **Puntos:** 1000 − 5 por movimiento − 50 por ayuda + 100 por trozo. Estrellas según los movimientos de más respecto a la mejor ruta (`bestMoves`).

## Aviso entre juegos
En la versión de Laravel, el Metro se abre cuando el navegador ha guardado las tres victorias anteriores (`juego1Superado`, `juego2Superado` y `juego3Superado` con valor `"true"`). Al superar su nivel 3 guarda `juego4Superado = "true"`, que la portada usa para marcar el plano como completado.

## Datos que guarda
- **Progreso** (`cerda_progress`, mismo formato que los otros juegos): `games[4]` con `status`, `last_level_completed`, `level_scores` y `best_score`.
- **Sesiones** (`cerda_sessions`): `username`, `session_id` (con forma de UUID), `date_time`, `session_length`, `level_reached`, `final_score` y, por cada intento, `level_time`, `moves_count`, `help_clicks`, `score` y `stars`.

## Pendiente
- Conectar con la base de datos (SQL Server) y el login; el contrato de datos se escribirá en `docs/`.
- Usar el CSS común de la landing cuando se comparta entre todos los juegos.
- Comprobar las estaciones y las líneas con el plano oficial de TMB y los datos de «¿Sabías que…?» (sin verificar con fuente).
