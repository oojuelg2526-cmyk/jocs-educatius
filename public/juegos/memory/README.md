# Memory de Barcelona (juego 1)

Primer juego de «Ildefons Cerdà perdió el plano». Se une cada monumento de Barcelona (su foto) con su nombre, su barrio o un dato histórico. Ficha del juego: [`propostes/oscar-memory-de-barcelona.md`](../../propostes/oscar-memory-de-barcelona.md).

HTML, CSS y JavaScript sin librerías, sin módulos y sin `<canvas>`.

## Cómo abrirlo
Se abre desde la web del proyecto (`php artisan serve` y `http://localhost:8000/juegos/memory/index.html`), porque carga `/js/sesion.js` desde la raíz del sitio: de ahí salen el usuario, el `session_id` y el envío de las métricas (ver `docs/metricas-juegos.md` del repositorio).

Pruebas de las reglas (Node 18 o más nuevo):

```bash
npm test
```

## Reglas
| Nivel | Parejas | La imagen se une con… | Carta de texto |
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
| `test/reglas.test.js` | Pruebas de las reglas y de que cada foto existe y tiene sus créditos |
| `img/<id>.webp` | Fotos reales de los monumentos (3:4, ≤ 120 KB). Autor y licencia en `js/datos.js` y en los créditos de abajo |
| `img/<id>.png` | Ilustraciones 3D (Blender, `assets/blender/`): se usan si un monumento no tiene foto (ahora el Palau de la Música) o si la foto no carga |
| `docs/como-funciona.md` | Explicación paso a paso para la defensa |
| `docs/guia-de-estilo.html` | Manual de estilo (colores, letras, cartas) |

## Crèdits de les imatges
Les fotos dels monuments són de [Wikimedia Commons](https://commons.wikimedia.org/) i es fan servir segons la seva llicència. Totes s'han **retallat a 3:4 i reduït** per al joc; a la del Mercat de la Boqueria, a més, **s'ha tapat el rètol** perquè no doni la resposta. Les versions modificades de fotos CC BY-SA es comparteixen amb la mateixa llicència. Dins del joc, aquests crèdits surten al botó «Crèdits de les imatges» de la finestra d'instruccions.

| Monument | Autor | Llicència | Original |
|---|---|---|---|
| Sagrada Família | Canaan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [SF maig 2 cropped.jpg](<https://commons.wikimedia.org/wiki/File:SF_maig_2_cropped.jpg>) |
| Park Güell | john.purvis | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Guell Park Python (5361412701).jpg](<https://commons.wikimedia.org/wiki/File:Guell_Park_Python_(5361412701).jpg>) |
| Casa Batlló | ChristianSchd | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [Casa Batllo Overview Barcelona Spain cut.jpg](<https://commons.wikimedia.org/wiki/File:Casa_Batllo_Overview_Barcelona_Spain_cut.jpg>) |
| La Pedrera | Thomas Ledl | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Casa Milà, general view.jpg](<https://commons.wikimedia.org/wiki/File:Casa_Mil%C3%A0,_general_view.jpg>) |
| Catedral de Barcelona | Fernando | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Barcelona Cathedral Saint Eulalia.jpg](<https://commons.wikimedia.org/wiki/File:Barcelona_Cathedral_Saint_Eulalia.jpg>) |
| Castell de Montjuïc | Daniel Kronborg | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Castell de Montjuïc entrance.jpg](<https://commons.wikimedia.org/wiki/File:Castell_de_Montju%C3%AFc_entrance.jpg>) |
| Hospital de Sant Pau | Suicasmo | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Main facade of Hospital de la Santa Creu i Sant Pau 20171225.jpg](<https://commons.wikimedia.org/wiki/File:Main_facade_of_Hospital_de_la_Santa_Creu_i_Sant_Pau_20171225.jpg>) |
| Torre Glòries | Alvesgaspar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Barcelona March 2015-8a.jpg](<https://commons.wikimedia.org/wiki/File:Barcelona_March_2015-8a.jpg>) |
| Mercat de la Boqueria | Nicholas Gemini | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [Mercat de la Boqueria 02.jpg](<https://commons.wikimedia.org/wiki/File:Mercat_de_la_Boqueria_02.jpg>) |
| Temple del Tibidabo | Felix König | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | [Temple Expiatori del Sagrat Cor 2013.jpg](<https://commons.wikimedia.org/wiki/File:Temple_Expiatori_del_Sagrat_Cor_2013.jpg>) |
| Monestir de Pedralbes | Richard Mortel | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Monastery of Pedralbes, early 14th century, cloister (11)](<https://commons.wikimedia.org/wiki/File:Monastery_of_Pedralbes,_early_14th_century,_cloister_(11)_(30408494583).jpg>) |
| Palau de la Música Catalana | Equip del projecte | Il·lustració 3D pròpia (`assets/blender/`) | — |

### Com canviar o afegir una foto
1. Retallar-la a 3:4 (uns 600×800 px), en WebP i com a màxim 120 KB, i desar-la com a `img/<id>.webp` (p. ex. `img/palau.webp`).
2. A `js/datos.js`, afegir al monument una línia `foto: { archivo, autor, licencia, fuente }` com les dels altres. Si la llicència és nova, afegir-la a `LICENCIAS`.
3. Afegir la fila a la taula d'aquí dalt i passar `npm test` (comprova que el fitxer existeix, que pesa poc i que té crèdits).

## Pendiente
- Contrastar barrios y datos históricos con una fuente fiable.
- Qué pieza del plano se entrega al terminar y enlace con el juego 2.
- Mejoras opcionales, solo si sobra tiempo: modo contrarreloj, sonido y mapa con los contornos reales de los barrios.
