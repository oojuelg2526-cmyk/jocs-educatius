# Laberinto de metro (juego 4)

Último juego de «Ildefons Cerdà perdió el plano». El jugador recorre el metro de Barcelona recogiendo los trozos del plano y llega a Urquinaona. Ficha del juego: [`propostes/alex-laberinto-de-metro.md`](../../propostes/alex-laberinto-de-metro.md).

HTML, CSS y JavaScript puros, sin librerías y **sin `<canvas>`**: el tablero son `div` en un CSS Grid. Funciona solo, sin servidor.

## Cómo probarlo
Desde esta carpeta:

```bash
npx serve .
```

Se mueve la ficha con las flechas o WASD (o la cruceta en el móvil).

## Los 3 niveles
| Nivel | Qué pasa | Mejor ruta |
|---|---|---|
| 1 · Primer viaje | La L1 de Urgell a Arc de Triomf: 3 trozos del plano | 18 movimientos |
| 2 · Correspondencias | Catalunya está cerrada: hay que dar la vuelta por la L2 y la L4 y cambiar de línea en Passeig de Gràcia. 3 trozos | 31 movimientos |
| 3 · El plano completo | 5 trozos, 150 segundos de tiempo límite y los nombres de las estaciones ocultos | 36 movimientos |

Para hacer un nivel más largo basta con dibujar un mapa más grande en `js/levels.js`: el código no cambia.

## Qué hace cada archivo
Se cargan con `<script>` en este orden y cada uno puede usar lo de los anteriores.

| Archivo | Para qué sirve |
|---|---|
| `js/levels.js` | Los datos de los 3 niveles: mapas, estaciones, trozos, estación cerrada y tiempo límite |
| `js/lang.js` | Todos los textos en catalán, castellano e inglés y la función `t("clave")` |
| `js/game.js` | Las reglas: mover, cambiar de línea, recoger trozos, ganar, puntos y estrellas. No toca la página |
| `js/ui.js` | Dibuja el tablero y el panel y enseña mensajes y tarjetas |
| `js/storage.js` | Guarda el progreso y las sesiones (con sus métricas) en `localStorage` |
| `js/main.js` | Une todo: teclas, botones, reloj e idioma |
| `css/metro.css` | Estilo (variables de color y tipografía del proyecto) |

## Cómo funciona, en pocas palabras
1. **El mapa** es una lista de textos. Cada letra es una casilla: `#` pared, `1`, `2` o `4` vía de esa línea, y una letra mayúscula es una estación.
2. **Mover la ficha:** una tecla llama a `move()`. La ficha solo entra en una casilla si es de la línea en la que viaja y no está cerrada.
3. **Cambiar de línea:** solo en una estación con varias líneas, con los botones L1, L2 o L4.
4. **Ganar:** llegar a Urquinaona con todos los trozos del plano.
5. **Puntos:** 1000 − 5 por movimiento − 50 por ayuda + 100 por trozo. Estrellas según los movimientos de más respecto a la mejor ruta (`bestMoves`).

## Datos que guarda
- **Progreso** (`cerda_progress`): último nivel superado y mejor puntuación de cada nivel.
- **Sesiones** (`cerda_sessions`): `username`, `session_id`, `date_time`, `session_length`, `level_reached`, `final_score` y, por cada intento, `level_time`, `moves_count`, `help_clicks`, `score` y `stars`.

## Pendiente
- Conectar con la base de datos (SQL Server) y el login; el contrato está en `docs/api-contrato.md`.
- Unir con los otros juegos en la landing y usar su CSS común.
- Comprobar las estaciones y las líneas con el plano oficial de TMB y los datos de «¿Sabías que…?» (sin verificar con fuente).
