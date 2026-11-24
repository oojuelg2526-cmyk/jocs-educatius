# Memory de Barcelona (juego 1)

Primer juego de «Ildefons Cerdà perdió el plano». Se une cada monumento de Barcelona (su ilustración) con su nombre, su barrio o un dato histórico. Ficha del juego: [`propostes/oscar-memory-de-barcelona.md`](../../propostes/oscar-memory-de-barcelona.md).

HTML, CSS y JavaScript sin librerías, sin módulos y sin `<canvas>`.

## Cómo abrirlo
Se abre desde la web del proyecto (`php artisan serve` y `http://localhost:8000/juegos/memory/index.html`), porque carga `/js/sesion.js` desde la raíz del sitio: de ahí salen el usuario, el `session_id` y el envío de las métricas (ver `docs/metricas-juegos.md` del repositorio).

Pruebas de las reglas (Node 18 o más nuevo):

```bash
npm test
```

## Reglas
| Nivel | Parejas | La ilustración se une con… | Carta de texto |
|---|---|---|---|
| 1 · Reconoce | 4 | su nombre | placa blanca |
| 2 · Sitúa | 6 | su barrio | plano verde |
| 3 · Recuerda | 8 | un dato histórico | pergamino |

- **No se pierde nunca.** Los fallos solo bajan las estrellas (de 3 a 1). El reloj solo cuenta hacia arriba.
- Puntos: 100 por pareja y 10 menos por fallo (nunca negativos).
- Al fallar, las dos cartas se ven un momento y se tapan solas.
- **Pista** (3 por nivel): dos cartas de una pareja brillan 2 segundos.
- Al acertar, la carta brilla en verde, su barrio se ilumina en el mapa y debajo del tablero sale «Monumento — barrio — dato».
- Cada nivel empieza con una ventana de instrucciones con una pareja de ejemplo (botón «?» para volver a verla).

## Qué hace cada archivo
| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página: cabecera, tablero, panel con marcadores y el mapa SVG |
| `css/estilo.css` | Todo el estilo: colores, cartas, giro 3D y versión móvil |
| `js/datos.js` | Los 12 monumentos, los 3 niveles y los textos en catalán, castellano e inglés |
| `js/reglas.js` | Las reglas del juego, sin tocar la página (por eso se pueden probar con `npm test`) |
| `js/pantalla.js` | Todo lo que se ve: pinta cartas, marcadores y mapa, recibe los clics y guarda el progreso |
| `test/reglas.test.js` | 11 pruebas de las reglas |
| `img/<id>.png` | Ilustraciones 3D de los monumentos (Blender, `assets/blender/`) |
| `docs/como-funciona.md` | Explicación paso a paso para la defensa |
| `docs/guia-de-estilo.html` | Manual de estilo (colores, letras, cartas) |

## Pendiente
- Contrastar barrios y datos históricos con una fuente fiable.
- Qué pieza del plano se entrega al terminar y enlace con el juego 2.
- Mejoras opcionales, solo si sobra tiempo: modo contrarreloj, sonido y mapa con los contornos reales de los barrios.
