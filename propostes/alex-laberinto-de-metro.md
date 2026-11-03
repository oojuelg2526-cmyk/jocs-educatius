# Laberinto de metro
**Nivel 4 de «Ildefons Cerdà perdió el plano»** · Responsable del juego: Alex Campano

## Qué se aprende
A moverse por el metro de Barcelona: qué color tiene cada línea, por qué estaciones pasa y dónde se puede cambiar de una línea a otra.

## De qué va
Tras el juego 3 tenemos la llave de la estación de Universitat y bajamos al metro, donde se han perdido los últimos trozos del plano de Cerdà. El metro es un laberinto: movemos una ficha por las vías, recogemos los trozos y llegamos a la estación de destino.

## Cómo se juega
- La ficha se mueve con las flechas del teclado, o con los botones de la pantalla en el móvil.
- Solo se puede ir por las vías. Si chocas contra una pared, no te mueves.
- Para cambiar de línea hay que estar en una estación con correspondencia. Ahí aparecen unos botones con las líneas y eliges una.
- Hay que recoger todos los trozos del plano antes de llegar al destino.
- Si te pierdes, el botón «Mirar el plano» enseña los nombres de las estaciones durante 3 segundos, pero resta puntos.

## Niveles
| Nivel | Viaje | Qué lo hace más difícil |
|---|---|---|
| 1 | Universitat → Sagrada Família | Una sola línea (L2) y todos los nombres a la vista. Sirve para aprender a moverse. |
| 2 | Catalunya → Verdaguer | Hay que cambiar de línea, Girona está cerrada por obras y una casilla de «hora punta» se abre y se cierra cada pocos segundos. |
| 3 | Espanya → Glòries | Varias líneas, nombres ocultos (salvo salida, destino y trozos) y un tiempo límite. |

Al acabar el nivel 3 se juntan las cuatro piezas del plano y termina la historia. Glòries es la plaza que Cerdà pensó como centro de la ciudad.

## Puntos y estrellas
- Empiezas con 1000 puntos. Cada movimiento resta 5, cada ayuda resta 50 y cada trozo recogido suma 100.
- Cada nivel tiene apuntado el número de movimientos de la ruta buena. Si lo haces con esos movimientos o muy pocos más, te llevas 3 estrellas; si te pasas un poco, 2; si te pasas mucho, 1.

## Cómo se programa
La idea es que sea fácil de programar y de explicar:
- **El mapa** de cada nivel es un array de textos, y cada letra es una casilla (pared, vía, estación, trozo…).
- **El tablero** se pinta con `div` dentro de un CSS Grid. No se usa `<canvas>`.
- **Mover la ficha:** un evento `keydown` comprueba si la casilla de destino es vía y, si lo es, mueve la ficha.
- **El reloj y la hora punta** funcionan con `setInterval`.
- **El progreso** (el último nivel superado) se guarda en `localStorage` y en la base de datos, así que al volver se sigue donde lo dejaste.

## Esbozo de la interfaz
![Esbozo de la interfaz del Laberinto de metro](img/laberinto-de-metro-esbozo.svg)

## Métricas
Las comunes, `username`, `session_id`, `date_time` y `session_length`, más estas cinco propias:

| Métrica | Qué guarda |
|---|---|
| `level_reached` | Hasta qué nivel ha llegado |
| `level_time` | Segundos que ha tardado en el nivel |
| `moves_count` | Movimientos que ha hecho |
| `help_clicks` | Veces que ha mirado el plano |
| `final_score` | Puntos al acabar |

En la simulación de datos supondremos que quien pide muchas ayudas o hace muchos movimientos de más tiene más probabilidades de no volver a jugar.

## Pendiente
- Comprobar las estaciones con el plano oficial de TMB.
- Dibujar los mapas de los niveles 2 y 3.
- Para la primera entrega (17/11), tener el nivel 1 jugable.
