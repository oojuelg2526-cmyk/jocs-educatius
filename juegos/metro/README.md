# Laberinto de metro (juego 4)

Último juego de «Ildefons Cerdà perdió el plano». El jugador baja al metro con la llave de Universitat, recoge los trozos del plano y llega a Urquinaona, donde se junta el plano completo. La ficha del juego está en [`propostes/alex-laberinto-de-metro.md`](../../propostes/alex-laberinto-de-metro.md).

HTML, CSS y JavaScript puros, sin librerías y **sin `<canvas>`**: el tablero son `div` dentro de un CSS Grid.

## Cómo probarlo
Los módulos de JavaScript necesitan un servidor (no basta con abrir `index.html`). Desde esta carpeta:

```bash
npx serve .
```

Abre la dirección que te dé con `?dev=1` al final. Sin `?dev=1` el juego sale **bloqueado**, porque se desbloquea al superar el juego 3.

Pruebas de las reglas (no hace falta navegador):

```bash
npm test
```

## Qué hace cada archivo
| Archivo | Para qué sirve |
|---|---|
| `js/levels.js` | Los 3 niveles: mapas, estaciones, trozos, obras, hora punta y tiempo límite |
| `js/game.js` | Las reglas: mover, cambiar de línea, recoger trozos, ganar, puntos y estrellas. No toca la página |
| `js/ui.js` | Dibuja el tablero y el panel y enseña mensajes y tarjetas |
| `js/main.js` | Une todo: teclas, reloj (`setInterval`), hora punta y paso de un nivel a otro |
| `js/lang.js` | Todos los textos en catalán, castellano e inglés |
| `js/storage.js` | Progreso del jugador (de momento en `localStorage`) |
| `js/metrics.js` | Métricas de cada sesión |
| `css/metro.css` | Estilo (variables de color y tipografía del proyecto) |
| `test/game.test.js` | Pruebas de las reglas y comprobación de que cada nivel tiene solución |

## Cómo funciona, en pocas palabras
1. **El mapa** es una lista de textos. Cada letra es una casilla: `#` nada, `1`, `2` o `4` vía de esa línea, y una letra mayúscula es una estación.
2. **Mover la ficha:** una tecla llama a `move()`. La ficha solo entra en una casilla si es de la línea en la que viaja; no puede pasar por una estación cerrada ni por la casilla de hora punta cuando está cerrada.
3. **Cambiar de línea** solo se puede en una estación con varias líneas, con los botones de línea.
4. **Ganar:** llegar a Urquinaona con todos los trozos del plano.
5. **Puntos:** 1000 − 5 por movimiento − 50 por ayuda + 100 por trozo. Estrellas según los movimientos de más respecto a la mejor ruta (`bestMoves`).

## Datos que guarda
- **Progreso** (`cerda_progress`), con el mismo formato que la tabla `user_game_progress`: estado, último nivel superado y mejor puntuación.
- **Sesiones** (`cerda_sessions`): `username`, `session_id`, `date_time`, `session_length`, y por cada intento `level_time`, `moves_count`, `help_clicks`, `score`, `stars`, además de `level_reached` y `final_score`.

## Pendiente
- Conectar `storage.js` y `metrics.js` con Laravel y SQL Server (hoy solo escriben en el navegador).
- Usar el CSS común del equipo cuando exista.
- Comprobar las estaciones y las líneas con el plano oficial de TMB y los datos de «¿Sabías que…?».
- Cuando el juego 3 guarde su progreso, comprobar que el desbloqueo funciona con su formato real.
