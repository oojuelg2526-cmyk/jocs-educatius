# Laberinto de metro (juego 4) · versión de revisión

Último juego de «Ildefons Cerdà perdió el plano». El jugador baja al metro en Universitat, recoge el trozo del plano en Catalunya y llega a Urquinaona. Ficha del juego: [`propostes/alex-laberinto-de-metro.md`](../../propostes/alex-laberinto-de-metro.md).

Esta versión tiene **solo el nivel 1**, funciona sola y no usa servidor. HTML, CSS y JavaScript puros, sin librerías y **sin `<canvas>`**: el tablero son `div` en un CSS Grid. El juego completo está en la rama `feature/alex-integracion-laravel`.

## Cómo probarlo
Desde esta carpeta:

```bash
npx serve .
```

Se mueve la ficha con las flechas o WASD.

## Qué hace cada archivo
| Archivo | Para qué sirve |
|---|---|
| `js/levels.js` | El nivel: mapa, estaciones y trozo del plano |
| `js/lang.js` | Todos los textos en catalán, castellano e inglés |
| `js/game.js` | Las reglas: mover, recoger, ganar, puntos y estrellas. No toca la página |
| `js/ui.js` | Dibuja el tablero y el panel y enseña mensajes y tarjetas |
| `js/storage.js` | Guarda mejor puntuación y partidas en `localStorage` |
| `js/main.js` | Une todo: teclas, botones, reloj e idioma |
| `css/metro.css` | Estilo (variables de color y tipografía del proyecto) |

Guion para explicarlo: [`docs/guion-revision.md`](../../docs/guion-revision.md).

## Pendiente
- Niveles 2 y 3.
- Conectar con la base de datos (SQL Server) y el login.
- Unir con los otros juegos en la landing y usar su CSS común.
