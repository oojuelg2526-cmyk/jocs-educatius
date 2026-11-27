# Métricas de los juegos

Los cuatro juegos envían el resultado de cada nivel superado a `POST /api/guardar-metricas` (`app/Http/Controllers/MetricasController.php`), que lo guarda en `game_sessions`, `level_attempts` y `user_game_progress`.

## Usuario y sesión: `public/js/sesion.js`

Cada `index.html` de juego carga `<script src="/js/sesion.js"></script>` antes de sus scripts. Define el objeto `Cerda`:

| Función | Qué hace |
|---|---|
| `Cerda.usuario()` | Nombre del jugador: `localStorage.cerda_username` (lo guarda la web al iniciar sesión); si no, el antiguo `username`; si no, `invitado`. Lo que no sea letra, número, `_` o `-` se cambia por `_` y se corta a 40 caracteres (reglas `alpha_dash` y `max:40` de la API). |
| `Cerda.sesionActual(juego)` | `session_id` (UUID v4) de esta visita al juego. Se guarda en `sessionStorage` (`cerda_session_<juego>`): si se recarga la página sigue la misma sesión; al cerrar la pestaña, la próxima visita es otra. |
| `Cerda.nuevaSesion(juego)` | Crea una sesión nueva y la devuelve. |
| `Cerda.inicioSesion(juego)` / `Cerda.segundosDeSesion(juego)` | Cuándo empezó la visita (`cerda_inicio_<juego>`) y los segundos que lleva, para `session_length`. |
| `Cerda.enviar(datos)` | `fetch` POST JSON a `/api/guardar-metricas`. Si falla la red o el servidor da error, solo avisa en la consola: el juego sigue. |

Como los juegos usan una ruta absoluta (`/js/sesion.js`), se tienen que abrir desde la web (`php artisan serve`), no con doble clic en el archivo.

## Qué envía cada juego

Comunes a todos: `username`, `session_id`, `game`, `date_time`, `session_length`, `level_time`, `final_score`. Todos los números son enteros.

| Juego (`game`) | Nivel | Campos propios | Notas |
|---|---|---|---|
| Memory (`memory`) | `level` | `errors_made` (fallos), `moves_count` (parejas giradas), `help_clicks` (pistas), `stars`, `completed: true` | Lo envía `guardarIntento` en `js/pantalla.js`. También guarda la copia en `cerda_sessions`. |
| Eixample (`eixample`) | `level` | `errors_made` (planos comprobados con error), `moves_count` (piezas puestas y quitadas), `help_clicks` (ayudas), `completed: true` | Lo envía `enviarMetricas` en `js/principal.js`. `final_score` es la puntuación del juego (`1000 − 10·movimientos − 50·ayudas`). No tiene estrellas: no se envían (la BD guarda 0). El tiempo del nivel cuenta desde que se abre el nivel; si se recarga la página, vuelve a empezar. |
| Línea del Tiempo (`timeline`) | `nivel_jugado` | `errors_made`, `hints_used` | Lo envía `guardarMetricasBD` en `js/game.js`. El controlador traduce `nivel_jugado` → `level` y `hints_used` → `help_clicks`. No envía `completed` (solo se envía al ganar; el servidor lo da por superado). |
| Metro (`metro`) | `level` | `moves_count`, `help_clicks`, `stars`, `completed` | Lo arma `buildPayload` en `js/storage.js`. |

## Cómo se prueba

- `cd public/js && npm test`: `sesion.js` (usuario, limpieza del nombre, UUID, sesión estable por juego, `enviar` sin romper si falla `fetch`).
- `cd public/juegos/memory && npm test` y `cd public/juegos/metro && npm test`: pruebas propias de cada juego (las de Metro cargan también `sesion.js`).
- `php artisan test`: `tests/Feature/MetricasJuegosTest.php` envía a la API el JSON exacto de cada juego y comprueba el 201 y las filas; `MetricasApiTest.php` prueba las reglas de la API.
- A mano: `php artisan serve`, jugar un nivel y mirar en la pestaña Red del navegador la petición a `/api/guardar-metricas` (respuesta 201).

## Limitación conocida (decisión del proyecto)

La API no pide contraseña ni token: cualquiera puede enviar métricas con el nombre de otro jugador, y todos los que juegan sin iniciar sesión se juntan bajo el usuario `invitado`. Es una decisión del proyecto para que los juegos sean estáticos y sencillos, no un fallo oculto. Lo que sí se impide: usar un administrador (403) y reutilizar una sesión de otro usuario o de otro juego (403).
