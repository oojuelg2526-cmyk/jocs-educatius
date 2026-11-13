# Contrato de datos entre el juego y el servidor (borrador)

Qué le pide el juego al servidor al abrirse y qué le envía al terminar un nivel. Está escrito para el **juego 4 (Laberinto de metro)**, pero sirve igual para los otros tres cambiando el `slug`. Las tablas son las de [`modelo-relacional-bd.md`](modelo-relacional-bd.md). Borrador para que lo valide Alex antes de programar nada del servidor.

## Idea general
- El juego es JavaScript en el navegador. El servidor es Laravel y la base es SQL Server.
- El juego habla con el servidor con `fetch` y JSON. Todo pasa por la **sesión de Laravel** (cookie) y lleva el **token CSRF** en la cabecera `X-CSRF-TOKEN`. No hay tokens de API aparte.
- Si no hay servidor, o el jugador no ha iniciado sesión, el juego **sigue guardando en `localStorage`** como hasta ahora.
- Los números de juego son `games.order_no` (1 Memory, 2 Eixample, 3 Línea del tiempo, 4 Metro). Se siembra la tabla para que `games.id` sea igual que `order_no`.
- Las reglas importantes (qué juego está desbloqueado, la mejor puntuación, el progreso) las calcula **el servidor**. El juego solo manda lo que ha pasado.

## Datos que le llegan al juego al abrir la página
La vista de Laravel (fase 4) los pone en el HTML, para no hacer una petición solo para saber quién es el jugador:

```html
<meta name="csrf-token" content="...">
<script>window.CERDA = { user: { username: "ana", language: "ca" } };</script>
```

Si no hay sesión, `window.CERDA` no existe y el juego trabaja en modo local (invitado).

## Rutas

| Método | Ruta | Para qué | Cuándo la usa el juego |
|---|---|---|---|
| GET | `/api/progress` | Progreso del jugador en todos los juegos | Al abrir: saber si el juego 4 está desbloqueado y por qué nivel va |
| PUT | `/api/sessions/{session_id}` | Crear o actualizar una partida con sus intentos | Cada vez que termina un nivel (ganado o por tiempo) |

Solo dos rutas. `PUT` es «guardar esto con este identificador»: si se repite, no se duplica nada. Así un reintento por mala conexión es seguro.

### GET `/api/progress`
Sin cuerpo. Respuesta `200`:

```json
{
  "user": { "username": "ana", "language": "ca" },
  "games": {
    "3": { "status": "completed", "last_level_completed": 3, "best_score": 2450 },
    "4": { "status": "unlocked",  "last_level_completed": 1, "best_score": 905 }
  }
}
```

- Sale de `user_game_progress` (más `users`). La clave es `games.order_no`.
- `status` es `locked`, `unlocked` o `completed`. Un juego sin fila cuenta como `locked`.
- Es el mismo formato que ya guarda `storage.js` (`status`, `last_level_completed`, `best_score`).

### PUT `/api/sessions/{session_id}`
`session_id` es un UUID que crea el juego (`crypto.randomUUID()`). Cuerpo:

```json
{
  "game": 4,
  "date_time": "2026-11-13T10:15:00.000Z",
  "session_length": 212,
  "level_reached": 2,
  "final_score": 905,
  "attempts": [
    { "level": 1, "level_time": 95, "moves_count": 16, "help_clicks": 0, "score": 905, "stars": 3, "completed": true },
    { "level": 2, "level_time": 120, "moves_count": 0, "help_clicks": 1, "score": 0, "stars": 0, "completed": false }
  ]
}
```

El cuerpo lleva **la sesión entera hasta ahora**, no solo el último intento. El servidor la sustituye (reemplaza los intentos de esa sesión). `username` no se envía: el servidor lo toma de la sesión de login.

Dónde se guarda cada campo:

| Campo del JSON | Tabla y columna | Nota |
|---|---|---|
| `session_id` (ruta) | `game_sessions.session_id` | UUID |
| `game` | `game_sessions.game_id` | Debe ser un juego que exista |
| `date_time` | `game_sessions.date_time` | Inicio, ISO 8601 |
| `session_length` | `game_sessions.session_length` | Segundos hasta ahora |
| `level_reached` | `game_sessions.level_reached` | 1 a 3 |
| `final_score` | `game_sessions.final_score` | Suma de los niveles ganados |
| `attempts[].level` | `level_attempts.level_id` | El servidor busca el nivel con `games.id` y `levels.level_no` |
| `attempts[].level_time` | `level_attempts.level_time` | Segundos |
| `attempts[].moves_count` | `level_attempts.moves_count` | Los que lleve al acabar el tiempo |
| `attempts[].help_clicks` | `level_attempts.help_clicks` | |
| `attempts[].score` | `level_attempts.score` | 0 si no se ha ganado |
| `attempts[].stars` | `level_attempts.stars` | 0 a 3 |
| `attempts[].completed` | `level_attempts.completed` | `true` si ganó el nivel |
| *(no se envía)* | `level_attempts.errors_made` | Queda a `NULL`: este juego no lo mide |
| *(sesión de login)* | `game_sessions.user_id` | Lo pone el servidor |

Las 5 métricas propias del juego 4 (`level_reached`, `level_time`, `moves_count`, `help_clicks`, `final_score`) entran todas en columnas comunes; **no hace falta `session_metrics` ni `metric_definitions`** para este juego.

#### Qué hace el servidor además de guardar
1. Crea o actualiza la fila de `game_sessions` y reemplaza sus filas de `level_attempts`.
2. Recalcula `user_game_progress` del jugador para ese juego: `last_level_completed` = nivel más alto con `completed = true`; `best_score` = suma de la mejor puntuación de cada nivel ganado; `status = completed` cuando está el nivel 3.
3. Si el juego pasa a `completed`, abre el siguiente (`unlocked`) si estaba `locked`.

Respuesta `200` (o `201` la primera vez): el progreso ya actualizado, para que el juego lo use sin otra petición.

```json
{ "progress": { "status": "unlocked", "last_level_completed": 2, "best_score": 1810 } }
```

## Reglas de validación (las comprueba el servidor)
- `session_id`: UUID válido. Si ya existe y es de **otro usuario**, `403`.
- `game`: entero que existe en `games`.
- `level`: entero de 1 a 3. `stars`: 0 a 3. `level_time`, `moves_count`, `help_clicks`, `score`, `session_length`: enteros mayores o iguales que 0, con un máximo razonable (por ejemplo `level_time` y `session_length` ≤ 86400).
- `attempts`: lista de como máximo 100 elementos.
- El juego pedido debe estar desbloqueado para ese usuario; si no, `403` (`game_locked`).

## Errores
Siempre JSON con un **código** (no un texto): los textos para el jugador viven en los archivos de idioma del juego.

```json
{ "error": "validation", "fields": { "attempts.0.level": "invalid" } }
```

| Código HTTP | `error` | Cuándo | Qué hace el juego |
|---|---|---|---|
| 401 | `unauthenticated` | No hay sesión de login | Pasa a modo local (`localStorage`) |
| 403 | `game_locked` | El juego aún no está desbloqueado | Muestra la tarjeta de «bloqueado» |
| 403 | `forbidden` | El `session_id` es de otro usuario | No reintenta; queda en local |
| 419 | `csrf` | Token CSRF caducado | Recarga la página con el progreso local guardado |
| 422 | `validation` | Datos que no cumplen las reglas | No reintenta; guarda en local |
| 5xx o sin red | — | Servidor caído | Guarda en local y reintenta en la siguiente partida |

## Qué pasa sin servidor (respaldo)
- El juego **siempre escribe primero en `localStorage`** (`cerda_progress`, `cerda_sessions`) y después intenta enviar al servidor. Así nunca se pierde una partida.
- Las sesiones que no se pudieron enviar se reintentan al abrir el juego (se envían con el mismo `session_id`, y como `PUT` no duplica, no hay problema).
- Con `?dev=1` el juego se abre siempre, como ahora, para poder probarlo.

## Seguridad
- Cada jugador solo puede leer y escribir **sus** datos: el `user_id` sale de la sesión, nunca del cuerpo de la petición.
- Todas las rutas van detrás de la comprobación de login y del token CSRF de Laravel.
- El servidor no se fía de `final_score`, `stars` ni del progreso que diga el juego en el navegador: recalcula el progreso a partir de los intentos. Una puntuación manipulada desde el navegador se puede acotar, pero no impedir del todo en un juego que corre en el cliente; se deja anotado como limitación.

## Cómo está hecho en Laravel
- Las dos rutas están en `routes/web.php` (no en `api.php`) para tener sesión y CSRF. Controladores en `app/Http/Controllers/Api/`.
- Registro abierto (`/register`) y entrada (`/login`); quien se registra es siempre `player` y empieza con el juego 1 abierto.
- El juego se sirve en `/juegos/metro` (vista `resources/views/juegos/metro.blade.php`), que pone el token CSRF y `window.CERDA`.
- Pruebas: `php artisan test` (usan SQLite en memoria).

## Por decidir con el equipo
- ¿Se puede jugar como **invitado** (solo `localStorage`) o hace falta cuenta? Este contrato soporta ambas cosas.
- Si Memory, Eixample y Línea del tiempo quieren la misma ruta `PUT /api/sessions/{id}`: solo cambia `game` y las columnas que usen.
- Métricas individuales de otros juegos (`attempts`, `puzzles_solved`…): irían en un campo extra `metrics` del mismo cuerpo, que el servidor guardaría en `session_metrics`. El juego 4 no lo usa.
