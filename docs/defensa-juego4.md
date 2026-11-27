# Chuleta para defender el juego 4 (Laberinto de metro)

Una página para la presentación técnica. Primero la idea en 30 segundos, después la demostración y las preguntas más probables.

## En 30 segundos
El juego es un laberinto: se mueve una ficha por las vías del metro de Barcelona, se recogen los trozos del plano de Cerdà y se llega a Urquinaona. Tiene 3 niveles. Está hecho con HTML, CSS y JavaScript, sin `<canvas>`: el tablero es un CSS Grid de `div`. Al terminar cada nivel, los resultados se guardan en el navegador y se envían al servidor (Laravel), que los guarda en SQL Server.

## Cómo está organizado
| Archivo | Papel |
|---|---|
| `js/levels.js` | Los 3 mapas, como listas de textos |
| `js/game.js` | Las **reglas**. No toca la página |
| `js/ui.js` | **Dibuja** la página. No decide reglas |
| `js/lang.js` | Los textos en català, castellano e inglés |
| `js/storage.js` | Guarda el progreso y prepara los datos para el servidor |
| `js/main.js` | Une todo: teclas, botones, reloj |
| `/js/sesion.js` (común) | Usuario, `session_id` y envío a la API, iguales para los 4 juegos |
| `/css/variables.css` (común) | Colores y tipografías de toda la web |

**Idea clave:** reglas separadas de la pantalla. Por eso se puede probar el juego sin navegador y cambiar un nivel sin tocar el código.

## Demostración de 2 minutos
1. Abrir `/juegos/metro/` y enseñar el nivel 1 (la L1 real). Mover la ficha, coger los trozos y ver cómo, al coger el último, el juego dice a qué estación hay que ir.
2. Nivel 2: Catalunya está cerrada. Intentar pasar para ver el aviso, rodear por la L2 y cambiar a la L4 en Passeig de Gràcia. 
3. Pulsar «Mirar el plano» para ver que cuesta 50 puntos.
4. Nivel 3: tiempo límite, nombres ocultos y 7 trozos. Al terminar, sale el plano completo. Pulsar «¿Cómo se juega?» para enseñar las instrucciones (el reloj se para).
5. Cambiar el idioma. Abrir las herramientas del navegador, pestaña Red, y enseñar la petición `POST /api/guardar-metricas`.

## Preguntas probables

**¿El mapa tiene relación con el metro real?**
Sí. Los tres mapas están dibujados a mano como un esquema simplificado del centro de Barcelona, con los colores reales de las líneas (L1 roja, L2 morada, L3 verde y L4 amarilla) y las estaciones en su orden real. Los cruces también son reales: Passeig de Gràcia une la L2, la L3 y la L4, Universitat la L1 y la L2, Catalunya la L1 y la L3, y Urquinaona la L1 y la L4. Las distancias y los ángulos no están a escala: las vías son rectas en ángulo recto, para que se vean bien en una cuadrícula. Cada mapa es una lista de textos que se puede cambiar a mano en `levels.js`.

**¿Por qué la pantalla del juego es fija?**
Para que los botones de línea y la cruceta se vean siempre, sin hacer scroll. La página ocupa toda la ventana (`height: 100vh` y `overflow: hidden`) y se reparte con Flexbox: arriba el nivel, en el centro el tablero y abajo el mensaje y los botones de línea. Las casillas tienen un tamaño fijo (`--cell`). Si el mapa no cabe, la ventana del tablero tiene scroll y, después de cada movimiento, `followToken` llama a `scrollIntoView` para dejar la ficha en el centro.

**¿Cómo sabe el jugador a dónde ir al final?**
La estación de destino lleva una bandera ⚑. Al coger el último trozo el juego dice «ve a Urquinaona», y la estación se ilumina con un halo verde.

**¿Cómo se dibuja el mapa?**
Cada nivel es una lista de textos: `#` es pared, `1`, `2`, `3`, `4` son vías y una letra mayúscula es una estación. `makeGrid` la recorre con dos bucles `for` y crea una tabla de casillas. `buildBoard` crea un `div` por casilla dentro de un CSS Grid.

**¿Qué hace `move`?**
Calcula la casilla nueva sumando la dirección, pregunta a `canEnter` si se puede entrar (pared, otra línea o estación cerrada) y, si se puede, mueve la ficha, suma un movimiento y recoge el trozo si lo hay. Si es el destino y faltan trozos, avisa. Devuelve un «evento» para que `main.js` muestre el mensaje.

**¿Por qué separas `game.js` y `ui.js`?**
Porque las reglas no deberían depender de cómo se ven. Así se pueden probar solas y se puede cambiar el diseño sin romper el juego.

**¿Cómo se calculan los puntos y las estrellas?**
1000 puntos, menos 5 por movimiento, menos 50 por ayuda, más 100 por trozo; nunca menos de 0. Las estrellas dependen de cuántos movimientos te pasas de la mejor ruta (`bestMoves`).

**¿Cómo sabes que los niveles tienen solución?**
Las pruebas (`npm test`) recorren cada nivel con un algoritmo de búsqueda (BFS) y comprueban que hay camino y que el más corto es el que dice `bestMoves`.

**¿Qué es `localStorage`?**
Un almacén del navegador que guarda texto con claves. Como solo guarda texto, el progreso se convierte con `JSON.stringify` y se lee con `JSON.parse`. Además del progreso, al terminar el nivel 3 se guarda `juego4Superado = "true"` para avisar a la web.

**¿Cómo se desbloquea el juego?**
Los juegos se abren en orden. Cada juego guarda `juegoNSuperado` al terminar y el siguiente lo comprueba. El juego 4 necesita haber superado los anteriores.

**¿Cómo se envían los datos al servidor?**
Con `fetch`, que es una petición HTTP desde JavaScript. Envía un POST con JSON a `/api/guardar-metricas`. Si falla (sin conexión, por ejemplo), no se rompe el juego, porque los datos ya están en `localStorage`.

**¿Qué métricas se guardan?**
Las comunes: `username`, `session_id`, `date_time` y `session_length`. Y las propias: `level_reached`, `level_time`, `moves_count`, `help_clicks` y `final_score`.

**¿Qué es el `session_id`?**
Un UUID que identifica cada visita al juego. Lo genera `sesion.js` y es el mismo formato que pide la base de datos.

**¿Qué hace el servidor con esos datos?**
`MetricasController` valida los datos (si no son correctos, responde 422), crea al jugador si no existe, guarda la sesión, el intento del nivel y el progreso. Va todo dentro de una transacción: o se guarda todo o nada.

**¿Es seguro?**
Tiene validación de todos los campos, un límite de 60 envíos por minuto por IP, y no permite usar el nombre de un administrador ni reutilizar la sesión de otro jugador. Limitación conocida: la ruta no exige iniciar sesión, así que cualquiera podría enviar datos con un nombre de jugador. Una mejora sería identificar al jugador con su sesión de Laravel.

**¿Por qué no hay `<canvas>`?**
El enunciado lo prohíbe. El tablero son `div` con CSS Grid, y la ficha es un `div` que se coloca con `left` y `top`.

**¿Cómo funcionan los idiomas?**
Todos los textos están en `lang.js` con claves. La función `t("clave")` devuelve el texto del idioma actual. Los textos fijos del HTML llevan `data-i18n` y `applyTexts` los rellena.

**¿Cómo funciona en el móvil?**
Hay una cruceta con botones y el tablero se adapta al ancho. Se ha probado en 375 px sin desbordes.

**¿Qué mejorarías?**
Comprobar los datos curiosos de las estaciones con la información oficial de TMB, identificar al jugador con la sesión de Laravel y añadir más niveles con nuevas estaciones.

## Si te preguntan por una línea que no entiendes
Di qué hace la función en una frase y qué datos entran y salen. Por ejemplo: «`canEnter` recibe la partida y una posición, y devuelve `"ok"` o el motivo por el que no se puede entrar».
