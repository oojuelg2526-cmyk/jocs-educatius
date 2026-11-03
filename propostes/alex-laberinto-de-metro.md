# Laberinto de metro
**Nivel 4 de «Ildefons Cerdà perdió el plano»** · Responsable del juego: Alex Campano

## Qué se aprende
Las líneas del metro de Barcelona (número y color), el orden de sus estaciones y las **correspondencias** (dónde se cambia de línea) para ir de un punto a otro de la ciudad. Público: jóvenes y adultos que viven en la ciudad y usan el metro, pero pocas veces miran el plano entero.

## Idea
El jugador baja al metro con la llave que consigue en el juego 3 y recorre un plano esquemático convertido en laberinto para recuperar los últimos trozos del plano de Cerdà. Solo puede avanzar por las vías y cambiar de línea en las estaciones con correspondencia, como en el metro real. Cada nivel quita ayudas: primero se ven todos los nombres de las estaciones; al final hay que recordar por dónde pasa cada línea. Todo con HTML, CSS y JS (DOM y eventos), **sin `<canvas>`**.

## Mecánica
- **Tablero:** rejilla CSS Grid; cada casilla es un `div`: vía de una línea (con su color), estación, correspondencia, túnel sin salida o pared. El nivel se define como un array de cadenas en un módulo JS y se dibuja desde ahí.
- **Movimiento:** flechas o WASD en el ordenador y una cruceta táctil en el móvil. La ficha avanza casilla a casilla y solo puede pisar las vías. Si choca con una pared, no se mueve y cuenta un `wall_hits`.
- **Cambiar de línea:** solo en una correspondencia (por ejemplo, Passeig de Gràcia: L2, L3, L4). Al llegar aparece un selector con las líneas disponibles (número y color) y el jugador elige por cuál sigue.
- **Misión:** cada nivel muestra la estación de salida, la de destino y los **trozos del plano** que hay que recoger por el camino, en estaciones concretas. No se puede terminar sin todos los trozos.
- **Obstáculos:**
  - *Estación cerrada por obras:* bloquea el paso y obliga a buscar otra ruta (nivel 2).
  - *Hora punta:* casillas con aglomeración que se abren y se cierran cada pocos segundos con `setInterval` (niveles 2 y 3).
  - *Trenes:* fichas que recorren su línea con un temporizador. Si te alcanzan, vuelves a la última estación (nivel 3).
- **¿Sabías que…?:** al pasar por algunas estaciones aparece un aviso corto con una curiosidad de la estación o del barrio. No interrumpe el juego.
- **Ayuda «Mirar el plano»:** muestra durante 3 s los nombres ocultos. Cuenta como `help_clicks` y resta puntos.
- **Puntos y estrellas:** el juego calcula el **camino más corto** con un recorrido en anchura (BFS) sobre la rejilla y lo compara con los movimientos del jugador.
  - `final_score = 1000 + 150 × trozos + 5 × segundos sobrantes − 10 × movimientos de más − 50 × ayudas − 100 × atropellos` (mínimo 0).
  - ★★★: 2 movimientos de más como máximo y sin ayudas · ★★: 8 de más como máximo · ★: nivel superado.
- **Progreso:** se guarda el último nivel superado. Al volver, el jugador entra directamente en ese nivel y puede rejugar los anteriores.

## Niveles de dificultad internos
| Nivel | Misión | Líneas | Trozos | Obstáculos | Ayudas | Reloj |
|---|---|---|---|---|---|---|
| 1 · Primer viaje | Universitat → Sagrada Família | Solo L2 (lila) | 1 (en Passeig de Gràcia) | Túneles sin salida | Todos los nombres visibles | Sin reloj (se aprende) |
| 2 · Correspondencias | Catalunya → Verdaguer | L3, L4, L5 | 2 | **Girona cerrada por obras** (la ruta por L4 no sirve: hay que ir por L3 hasta Diagonal y cambiar a L5) + hora punta | Nombres solo al acercarse a la estación | 150 s |
| 3 · El plano completo | Espanya → Glòries | L1, L2, L3, L5 | 3 (Paral·lel, Passeig de Gràcia y Sagrada Família) | Trenes en movimiento + hora punta | Nombres ocultos, salvo salida, destino y trozos | 240 s |

La dificultad sube también en lo educativo: seguir una línea → cambiar de línea y buscar alternativas → planificar una ruta con varias líneas casi de memoria.

- **Nivel 1:** la L2 en orden (Universitat, Passeig de Gràcia, Tetuan, Monumental, Sagrada Família), con túneles sin salida que despistan.
- **Nivel 2:** dos caminos reales para el mismo trayecto. El corto (L3 → Passeig de Gràcia → L4 → Girona → Verdaguer) está cortado, así que hay que pensar el otro (L3 → Diagonal → L5 → Verdaguer).
- **Nivel 3:** el recorrido directo por L1 lleva de Espanya a Glòries, pero los trozos obligan a dar un rodeo: L3 hasta Paral·lel y Passeig de Gràcia, L2 hasta Sagrada Família y Clot, y L1 hasta Glòries.

### Esbozo del nivel 1 (rejilla)
```
#  pared      ═  vía L2      ● estación      ★ trozo del plano
S  salida     D  destino     ┄  túnel sin salida

 # # # # # # # # # # # #
 # S ═ ═ ★ ═ ═ ● ┄ ┄ # #
 # ┄ # # # # # ═ # # # #
 # ┄ ┄ # ● ═ ═ ═ # # # #
 # # ┄ # ═ # # # # # # #
 # # # # ═ ═ ═ ═ ═ D # #
 # # # # # # # # # # # #

 S = Universitat · ★ = Passeig de Gràcia · ● = Tetuan (arriba) y Monumental · D = Sagrada Família
```
`[PENDENT]` Dibujar las rejillas definitivas de los niveles 2 y 3 y ajustar tiempos tras probar el juego.

### Estaciones y correspondencias que se usan (a contrastar con el plano oficial de TMB)
| Estación | Líneas | Nivel |
|---|---|---|
| Universitat | L1, L2 | 1 |
| Passeig de Gràcia | L2, L3, L4 | 1, 2, 3 |
| Tetuan, Monumental | L2 | 1 |
| Sagrada Família | L2, L5 | 1, 3 |
| Catalunya | L1, L3 | 2 |
| Diagonal | L3, L5 | 2 |
| Girona | L4 | 2 (cerrada) |
| Verdaguer | L4, L5 | 2 |
| Espanya | L1, L3 | 3 |
| Paral·lel | L2, L3 | 3 |
| Clot | L1, L2 | 3 |
| Glòries | L1 | 3 |

`[PENDENT]` Verificar cada estación, su orden y las curiosidades con el plano y la web de TMB, y anotar la fuente.

## Estilo visual
Mezcla del plano antiguo de Cerdà (papel envejecido y tinta, igual que el resto de juegos) con la señalética del metro: líneas gruesas con el color de cada línea, estaciones redondas y correspondencias con doble borde. La ficha del jugador es el sombrero de Cerdà. Los trozos del plano son fragmentos de papel con la trama del Eixample. Usa las variables del CSS común (colores, tipografías y botones).

## Esbozo de la interfaz
![Esbozo de la interfaz del Laberinto de metro](img/laberinto-de-metro-esbozo.svg)

```
┌─────────────────────────────────────────────────────────────┐
│ Laberinto de metro   Nivel 2 · Correspondencias  ★★☆   🔊   │
├────────────────────────────────────────┬────────────────────┤
│  # # # # # # # # # # # # # #           │ MISIÓN             │
│  # S ═══●═══╗     ┄┄┄ #                │ Catalunya →        │
│  #      ║   ╚═══◎═══✖═══╗ #            │ Verdaguer          │
│  #  ★   ║       ║       ║ #            │ Trozos: ▣ ▢        │
│  #  ╚═══◎═══════◎═══★═══D #            │ Tiempo: 01:48      │
│  # # # # # # # # # # # # # #           │ Movimientos: 23    │
│                                        │ [ Mirar el plano ] │
├────────────────────────────────────────┴────────────────────┤
│ 💡 ¿Sabías que…?  (aviso corto al pasar por una estación)   │
│                         [▲]                                 │
│                      [◀][▼][▶]   (cruceta en el móvil)      │
└─────────────────────────────────────────────────────────────┘
 ◎ correspondencia (abre el selector de línea) · ✖ estación cerrada por obras
```
`[PENDENT]` Wireframe definitivo con la herramienta de prototipado del equipo.

## Lugar en la historia
Cerdà ha perdido los planos del Eixample y cada juego recupera una pieza. Este es el juego 4 de 4, el último. Se desbloquea al superar el juego 3 (Línea del tiempo), que da la llave de la estación de **Universitat**: por eso el nivel 1 empieza allí. Los últimos trozos del plano se han perdido por el metro, y el viaje termina en **Glòries**, la plaza que Cerdà imaginó como el nuevo centro de la ciudad. Al llegar, se juntan las cuatro piezas, el plano del Eixample aparece restaurado en una animación final y se abren el ranking y la pantalla de fin de la historia.

## Métricas propias (≥4)
| Métrica | Qué mide |
|---|---|
| `level_reached` | Último nivel al que ha llegado el jugador (1-3) |
| `level_time` | Segundos que tarda en superar el nivel |
| `moves_count` | Movimientos totales de la ficha |
| `extra_moves` | Movimientos de más respecto al camino más corto (BFS) |
| `wall_hits` | Choques contra paredes o vías de otra línea |
| `items_collected` | Trozos del plano recogidos |
| `help_clicks` | Veces que se usa «Mirar el plano» |
| `final_score` | Puntuación del nivel |

Además registra `username`, `session_id`, `date_time` y `session_length`. Para la simulación de datos, la hipótesis de frustración es que muchos `wall_hits`, `extra_moves` o `help_clicks` en el nivel 2 aumentan la probabilidad de no volver a jugar. Se comprueba con el modelo.

## Riesgos
- **Datos del metro:** comprobar estaciones, orden y correspondencias con el plano oficial de TMB. El plano del juego es esquemático y no reproduce el diseño oficial: se dibuja con los colores de cada línea, pero con estilo propio.
- **Laberintos equilibrados:** el BFS sirve también para comprobar que cada nivel tiene solución y para medir su longitud mínima.
- **Temporizadores:** con trenes, hora punta y reloj a la vez, hay que limpiar los `setInterval` al pausar, cambiar de nivel o salir.
- **Móvil:** cruceta táctil y rejilla que quepa en 375 px.
- **Alcance:** antes del 17/11, el nivel 1 jugable con movimiento, misión y guardado. Los trenes, la hora punta y la animación final, después.
