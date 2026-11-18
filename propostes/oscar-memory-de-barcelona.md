# Memory de Barcelona
**Nivel 1 de «Ildefons Cerdà perdió el plano»** · Responsable del juego: Óscar Ojuel

## Qué se aprende
Monumentos de Barcelona, el barrio donde están y un dato histórico de cada uno. Público: jóvenes y adultos que viven en la ciudad.

## Idea
Un Memory sencillo y bien hecho: cartas con giro 3D, ilustraciones 3D de los monumentos y un mapa de Barcelona que se ilumina barrio a barrio. Todo con HTML, CSS y JS (DOM y eventos), **sin `<canvas>`**.

## Mecánica
Parejas de cartas: siempre **ilustración del monumento + un texto**; el texto cambia con el nivel (ver abajo). No se pierde nunca: los fallos solo quitan estrellas y el reloj solo cuenta hacia arriba. Cada nivel empieza con una tarjeta de instrucciones con una pareja de ejemplo.

- **Al acertar:** las cartas brillan en verde, el barrio se ilumina en el mapa y debajo del tablero sale «Monumento — barrio — dato».
- **Al fallar:** las dos cartas se ven un momento y se tapan solas.
- **Pista** (3 por nivel): dos cartas de una pareja brillan 2 segundos.
- **Mapa de Barcelona:** panel lateral con los barrios; cada pareja acertada ilumina su barrio.
- **Estrellas** (1 a 3) según los fallos. **Puntos:** 100 por pareja y 10 menos por fallo. Se puede rejugar cualquier nivel superado.
- **Efectos:** solo el giro 3D, el brillo de acierto y de pista, la barra de progreso y el mapa. Sin sonido.

## Niveles de dificultad internos
| Nivel | Parejas | Qué se une | 3 / 2 estrellas |
|---|---|---|---|
| 1 · Reconoce | 4 | ilustración ↔ su nombre (placa) | hasta 2 / 5 fallos |
| 2 · Sitúa | 6 | ilustración ↔ su barrio (plano) | hasta 3 / 7 fallos |
| 3 · Recuerda | 8 | ilustración ↔ dato histórico (pergamino) | hasta 4 / 9 fallos |

La dificultad sube también en lo educativo: reconocer → situar en el mapa → recordar historia. Cambio tras la primera prueba (17/11): era demasiado difícil y no se entendía qué se unía, así que ahora no se pierde, hay menos parejas e instrucciones por nivel. Segundo cambio (18/11): versión final más corta y fácil de explicar, sin cartas especiales, combos, bonus de tiempo ni sonido.

**Mejoras opcionales pendientes** (solo si sobra tiempo): modo contrarreloj, sonido, mapa con los contornos reales de los barrios.

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

`[PENDENT]` Contrastar cada barrio y dato con una fuente fiable y anotarla. Nota: la Casa Batlló y La Pedrera comparten barrio, así que en el nivel de barrios nunca salen los dos a la vez.

## Estilo visual
Plano antiguo de Cerdà: papel envejecido, tinta, líneas rectas. El reverso de las cartas lleva la trama de manzanas del Eixample con sus chaflanes. Giro de carta con transformaciones 3D de CSS (`rotateY`).

## Esbozo de la interfaz
```
┌──────────────────────────────────────────────────────────┐
│ Memory de Barcelona   Nivel 2 · Sitúa    ★★☆   ?  ES     │
├───────────────────────────────────────┬──────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │   MAPA DE        │
│  │ ? │ │ ? │ │ ? │ │ ? │              │   BARCELONA      │
│  └───┘ └───┘ └───┘ └───┘              │  (barrios        │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐              │   iluminados     │
│  │ ? │ │ ? │ │ ? │ │ ? │              │   al acertar)    │
│  └───┘ └───┘ └───┘ └───┘              │                  │
├───────────────────────────────────────┴──────────────────┤
│ Fallos 3 · Tiempo 01:32 · Puntos 450 · Pista (2)         │
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
- Mucho contenido para un solo juego: resuelto con la versión corta del 18/11; el contrarreloj y el sonido quedan como mejoras opcionales.
