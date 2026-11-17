# Memory de Barcelona (juego 1)

Primer juego de «Ildefons Cerdà perdió el plano». El jugador recupera el calco de la cuadrícula del Eixample uniendo monumentos de Barcelona con su nombre, su barrio y un dato histórico. La ficha del juego está en [`propostes/oscar-memory-de-barcelona.md`](../../propostes/oscar-memory-de-barcelona.md).

HTML, CSS y JavaScript puros, sin librerías y **sin `<canvas>`**: las cartas son `button` y el giro 3D es CSS (`rotateY`).

## Cómo probarlo
Los módulos de JavaScript necesitan un servidor (no basta con abrir `index.html`). Desde esta carpeta:

```bash
npx serve .
```

Pruebas de las reglas (no hace falta navegador):

```bash
npm test
```

## Qué hace cada archivo
| Archivo | Para qué sirve |
|---|---|
| `js/levels.js` | Los 12 monumentos y los 3 niveles (parejas, fallos, tiempo, cartas especiales) |
| `js/game.js` | Las reglas: girar, parejas, combos, fallos, lupa, trampa, puntos y estrellas. No toca la página |
| `js/ui.js` | Dibuja tablero, panel y tarjetas |
| `js/main.js` | Une todo: clics, reloj, sonidos y paso de un nivel a otro |
| `js/lang.js` | Todos los textos en catalán, castellano e inglés |
| `js/storage.js` | Progreso del jugador (de momento en `localStorage`) |
| `js/metrics.js` | Métricas de sesión: comunes (`username`, `session_id`, `date_time`, `session_length`) y propias (`attempts`, `errors_made`, `level_reached`, `level_time`) |
| `js/sound.js` | Sonidos con Web Audio y botón de silencio |

## Qué está hecho
- Niveles 1 (Reconoce), 2 (Sitúa) y 3 (Recuerda), con fallos máximos y reloj según el nivel.
- Combos ×2–×4, lupa de Cerdà, trampa «Plano desordenado», estrellas, sonido y 3 idiomas.
- Panel de barrios que se iluminan al acertar.

## Pendiente
- Ilustraciones o renders de los monumentos: de momento cada carta enseña un emblema con las iniciales (`img/<id>.svg` se usará cuando exista).
- Mapa de Barcelona en lugar de la lista de barrios.
- Modo contrarreloj.
- Contrastar barrios y datos históricos con una fuente fiable.
- Enlace con el juego 2 (qué pieza se entrega al terminar) y envío de métricas al servidor.
