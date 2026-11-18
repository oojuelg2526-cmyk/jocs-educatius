# Cómo funciona el Memory de Barcelona

Guía corta para explicar el juego en la defensa. Son tres archivos de JavaScript normales (sin `import`/`export`), cargados en orden al final de `index.html`:

```
datos.js   → qué hay (monumentos, niveles, textos)
reglas.js  → qué pasa (girar, parejas, fallos, pistas, estrellas). No toca la página
pantalla.js → qué se ve (pinta, escucha los clics y guarda el progreso)
```

Como son scripts normales, todo lo que se declara arriba del todo (`const MONUMENTOS`, `function girarCarta`…) lo pueden usar los archivos que se cargan después.

## Una partida paso a paso
1. **Arranque** (`pantalla.js`, al final): lee el idioma guardado, conecta los botones (idioma, pista, «?», empezar de nuevo) y llama a `empezarNivel()` con el primer nivel que no esté superado.
2. **`empezarNivel(numero)`**: `crearPartida(nivel)` elige los monumentos al azar y baraja las cartas. Después se pinta todo (`pintarTablero`, `pintarMision`, `pintarPestanas`, `pintarMapa`, `pintarMarcadores`), se abre la ventana de instrucciones y se pone en marcha un `setInterval` que suma un segundo mientras se juega.
3. **«¡A jugar!»**: `empezarAJugar()` cierra la ventana y pone `jugando = true`.
4. **Clic en una carta**: `alPulsarCarta(indice)` llama a `girarCarta(partida, indice)`, que devuelve qué ha pasado:
   - `"primera"`: solo se gira.
   - `"pareja"`: las dos se quedan boca arriba con brillo verde, debajo del tablero sale «Monumento — barrio — dato» y su barrio se ilumina en el mapa.
   - `"fallo"`: se suma un fallo y, a los 1,3 s (`setTimeout`), `taparFallo` las vuelve a tapar.
   - `"nada"`: no se puede girar (ya está girada, acertada o hay un fallo a la vista).
5. **Pista**: `usarPista(partida)` devuelve las posiciones de dos cartas de una pareja; la pantalla les pone la clase `pista` (brillan) y se la quita a los 2 s.
6. **Última pareja**: `partida.terminada` pasa a `true`. `terminarNivel()` para el reloj, calcula estrellas y puntos, guarda el progreso y las métricas y abre la ventana de final con «Siguiente nivel» y «Repetir nivel».

## Las funciones de `reglas.js`
| Función | Qué hace |
|---|---|
| `barajar(lista)` | Devuelve una copia desordenada (Fisher-Yates: recorre desde el final y cambia cada elemento por uno al azar) |
| `crearPartida(nivel)` | Crea el objeto `partida`: cartas (`{ pareja, tipo, estado }`), fallos, aciertos, pistas, segundos… |
| `girarCarta(partida, indice)` | Gira una carta y compara si ya hay dos boca arriba. Devuelve `"nada"`, `"primera"`, `"pareja"` o `"fallo"` |
| `taparFallo(partida)` | Vuelve a tapar las dos cartas del fallo y desbloquea el tablero |
| `usarPista(partida)` | Gasta una pista y dice qué cartas tienen que brillar (o `[]` si no quedan) |
| `contarSegundo(partida)` | Suma un segundo si la partida no ha terminado |
| `calcularEstrellas(partida)` | 3, 2 o 1 estrella según los fallos y los límites del nivel (`NIVELES[...].estrellas`) |
| `calcularPuntos(partida)` | 100 por pareja menos 10 por fallo, nunca menos de 0 |

Cada carta tiene un `estado`: `"tapada"`, `"girada"` o `"acertada"`. La pantalla solo mira ese estado para poner las clases CSS `girada` y `acertada`; el giro 3D lo hace el CSS (`transform: rotateY(180deg)` con `transition`).

## Cómo se guarda
Con `localStorage`, lo mínimo, en tres claves que comparten los cuatro juegos:
- `cerda_lang`: el idioma elegido (`"ca"`, `"es"` o `"en"`).
- `cerda_progress`: el progreso. Para el Memory (juego 1): `last_level_completed`, `level_scores`, `best_score` y `status` (`"completed"` al superar el nivel 3, lo que abre el juego 2).
- `juego1Superado`: se pone a `"true"` al superar el nivel 3. Es el aviso que acordó el equipo para desbloquear el siguiente juego (el juego 2 mira esa clave, igual que el 3 mira `juego2Superado`).
- `cerda_sessions`: las métricas de cada visita: `username`, `session_id`, `date_time`, `session_length`, `level_reached` y una fila por nivel con `level_time`, `errors_made`, `moves_count`, `help_clicks`, `score` y `stars`.

Como `localStorage` solo guarda texto, se usa `JSON.stringify` para guardar y `JSON.parse` para leer. Los nombres son los de las columnas de la base de datos (tablas `user_game_progress`, `game_sessions` y `level_attempts`), para que más adelante se puedan enviar al servidor sin cambiarlos. De momento también se enseñan con `console.log`.

## Preguntas probables del profesor
1. **¿Por qué hay tres archivos JS y no uno?** Para separar los datos, las reglas y la pantalla. Las reglas no tocan la página, así que se pueden probar solas con `npm test`.
2. **¿Cómo sabe el juego que dos cartas son pareja?** Cada carta guarda el `id` del monumento en `pareja`. Si las dos cartas giradas tienen el mismo `pareja`, son pareja (`girarCarta`).
3. **¿Cómo se baraja?** Con `barajar`: recorre la lista desde el final y cambia cada carta por otra al azar con `Math.random()`. Trabaja sobre una copia (`slice`) para no cambiar la lista original.
4. **¿Por qué no se pueden girar más cartas mientras se ve un fallo?** `girarCarta` pone `partida.bloqueada = true` y devuelve `"nada"` mientras esté bloqueada. `taparFallo` la desbloquea pasado el `setTimeout`.
5. **¿Cómo se hace el giro 3D?** Cada carta tiene dos caras una encima de otra con `backface-visibility: hidden`. Al poner la clase `girada`, el CSS gira el interior 180° con `rotateY` y una `transition` de 0,5 s.
6. **¿Cómo funciona el reloj?** Un `setInterval` cada 1000 ms llama a `contarSegundo` solo si `jugando` es `true` (no cuenta con una ventana abierta). Al terminar el nivel se para con `clearInterval`.
7. **¿Cómo se cambia de idioma?** Todos los textos están en `TEXTOS` (`datos.js`) por idioma. La función `t("clave")` busca el texto del idioma actual; los textos fijos del HTML llevan `data-texto` y `traducirPagina()` los rellena.
8. **¿Se puede jugar con teclado?** Sí: las cartas son `<button>`, así que se llega con Tab y se giran con Enter o espacio. Cada carta tiene un `aria-label` que dice qué es, y el mensaje de debajo del tablero tiene `aria-live` para que el lector de pantalla lo lea.

## Temas de clase que se usan
- Variables con `let` y `const`, `if` y el operador ternario, `||` para valores por defecto.
- Bucles `for` y `forEach`; arrays con `push`, `map`, `filter`, `reduce` y `slice`; `Math.random`, `Math.floor` y `Math.max`.
- Funciones normales y funciones flecha; callbacks en `addEventListener`, `setTimeout` y `setInterval`.
- Plantillas de texto (`` `${...}` ``) y objetos literales.
- DOM: `getElementById`, `querySelector`, `createElement`, `appendChild`, `remove`, `textContent`, `classList`, `dataset`, `style`.
- `Date` para la hora de la sesión.
- CSS: variables en `:root`, grid y flex, `transition`, una `@keyframes` y `@media` para el móvil.
- Fuera de lo dado hasta ahora, y usado lo mínimo: `localStorage` con `JSON.stringify`/`JSON.parse` (explicado arriba).
