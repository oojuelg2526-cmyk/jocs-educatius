# Memory de Barcelona
**Nivel 1 de «Ildefons Cerdà perdió el plano»** · Responsable del juego: Óscar Ojuel

## Qué se aprende
Monumentos de Barcelona, el barrio donde están y un dato histórico de cada uno. Público: jóvenes y adultos que viven en la ciudad.

## Idea
Un Memory pensado para sorprender: cartas con giro 3D, mapa de Barcelona que se ilumina barrio a barrio, combos, cartas especiales y un modo contrarreloj. Todo con HTML, CSS y JS (DOM y eventos), **sin `<canvas>`**.

## Mecánica
Parejas de cartas con intentos limitados y reloj. Lo que forma cada pareja cambia con el nivel (ver abajo).

- **Combos:** aciertos seguidos suben el multiplicador de puntos (×2, ×3, ×4). Un fallo lo reinicia.
- **Cartas especiales** (entre las cartas del tablero; al girarlas actúan y desaparecen, sin gastar intento):
  - Comodín «Lupa de Cerdà» (dorada): enseña todas las cartas 3 segundos.
  - Trampa «Plano desordenado» (roja): baraja las cartas que aún no se han acertado.
- **Mapa de Barcelona:** panel lateral con los barrios; cada pareja acertada ilumina su barrio.
- **Modo contrarreloj** (modo extra, se desbloquea al superar el nivel 3): 8 parejas al azar del banco de monumentos, 90 s; cada acierto suma 3 s y cada fallo resta 2 s. Cuenta para el récord.
- **Estrellas** (1 a 3) según los fallos cometidos. Se puede rejugar cualquier nivel superado.
- **Sonido:** girar carta, acierto, fallo, combo, comodín, trampa y nivel superado. Con botón para silenciar.

## Niveles de dificultad internos
| Nivel | Parejas | Qué se une | Fallos permitidos | Reloj | Especiales |
|---|---|---|---|---|---|
| 1 · Reconoce | 6 | foto del monumento ↔ su nombre | 8 | sin reloj (se aprende) | ninguna |
| 2 · Sitúa | 8 | monumento ↔ su barrio | 8 | 150 s | 1 comodín + 1 trampa |
| 3 · Recuerda | 12 | monumento ↔ dato histórico | 10 | 240 s | 1 comodín + 2 trampas |

La dificultad sube también en lo educativo: reconocer → situar en el mapa → recordar historia. `[PENDENT]` Ajustar fallos y tiempos tras probar el juego.

### Banco de monumentos (propuesta, a contrastar con fuentes antes de publicar)
| Monumento | Barrio | Dato (nivel 3) |
|---|---|---|
| Sagrada Família | la Sagrada Família | Las obras empezaron en 1882 |
| Park Güell | la Salut | Patrimonio Mundial de la UNESCO desde 1984 |
| Casa Batlló | la Dreta de l'Eixample | Gaudí la reformó entre 1904 y 1906 |
| La Pedrera | la Dreta de l'Eixample | Se construyó entre 1906 y 1912 |
| Catedral de Barcelona | el Gòtic | Su construcción gótica empezó en 1298 |
| Palau de la Música Catalana | Sant Pere, Santa Caterina i la Ribera | Obra de Domènech i Montaner, de 1905 a 1908 |
| Castell de Montjuïc | Montjuïc | El castillo actual se levantó a partir de 1751 |
| Hospital de Sant Pau | el Baix Guinardó | Patrimonio Mundial de la UNESCO desde 1997 |
| Torre Glòries | el Parc i la Llacuna del Poblenou | Obra de Jean Nouvel, inaugurada en 2005 |
| Mercat de la Boqueria | el Raval | Mercado oficial desde 1840 |
| Temple del Tibidabo | Vallvidrera, el Tibidabo i les Planes | Se construyó entre 1902 y 1961 |
| Monestir de Pedralbes | Pedralbes | Fundado en 1326 |

`[PENDENT]` Contrastar cada barrio y dato con una fuente fiable y anotarla.

## Estilo visual
Plano antiguo de Cerdà: papel envejecido, tinta, líneas rectas. El reverso de las cartas lleva la trama de manzanas del Eixample con sus chaflanes. Giro de carta con transformaciones 3D de CSS (`rotateY`).

## Esbozo de la interfaz
```
┌──────────────────────────────────────────────────────────┐
│ Memory de Barcelona   Nivel 2 · Sitúa    ★★☆   🔊        │
├───────────────────────────────────────┬──────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │   MAPA DE        │
│  │ ? │ │ ? │ │ ? │ │ ? │              │   BARCELONA      │
│  └───┘ └───┘ └───┘ └───┘              │  (barrios        │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │   iluminados     │
│  │ ? │ │ ? │ │ ? │ │ ? │              │   al acertar)    │
│  └───┘ └───┘ └───┘ └───┘              │                  │
├───────────────────────────────────────┴──────────────────┤
│ Fallos 3/8 · Tiempo 01:32 · Combo ×3 · Puntos 1.450      │
└──────────────────────────────────────────────────────────┘
```
`[PENDENT]` Dibujo final de la interfaz (wireframe) para el diseño.

## Lugar en la historia
Cerdà ha perdido los planos del Eixample y cada juego recupera una pieza. Este es el juego 1 de 4 y es el primero. `[PENDENT]` Qué pieza recupera al terminarlo y su enlace con el juego 2: se acuerda con el responsable del juego 2.

## Métricas propias (≥4)
Propuesta inicial: `attempts`, `errors_made`, `level_reached`, `level_time`. Además registra `username`, `session_id`, `date_time` y `session_length`. `[PENDENT]` Decidir con el equipo si cada juego usa métricas propias o se comparte un mismo sistema.

## Riesgos
- Imágenes de monumentos: fotos de dominio público, con licencia libre o generadas, con el origen anotado de cada una.
- Mapa de barrios: partir de datos abiertos del Ayuntamiento (Open Data BCN) `[PENDENT]` verificar licencia.
- Sonidos: usar sonidos de licencia libre anotando el origen `[PENDENT]` elegirlos.
- Mucho contenido para un solo juego: priorizar nivel 1 y 2 jugables antes del 17/11 y dejar combos, especiales y contrarreloj para después.
