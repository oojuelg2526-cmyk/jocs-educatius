# Ildefons Cerdà perdió el plano

Propuesta elegida por el equipo. Cada juego tiene su propio documento en esta carpeta.

## Temática y público
Historia y geografía de **Barcelona**, para **gente de la ciudad** (jóvenes y adultos que viven aquí y creen conocerla). Tono ameno, con curiosidades («¿sabías que…?») en lugar de preguntas tipo test.

## Hilo conductor
Ildefons Cerdà ha perdido los planos del Eixample y la ciudad se ha desordenado. Cada juego recupera una pieza: primero los monumentos, luego las manzanas, después la línea del tiempo y por último el camino de vuelta por el metro. Al terminar los cuatro, el plano queda restaurado.

## Los 4 juegos (uno por persona, se desbloquean en orden)
| Nivel | Juego | Responsable | Mecánica | Qué se aprende | Métricas propias |
|---|---|---|---|---|---|
| 1 | Memory de Barcelona | Óscar Ojuel | Parejas de cartas (monumento ↔ barrio o dato) con intentos limitados y reloj | Monumentos y barrios | `attempts`, `errors_made`, `level_reached`, `level_time` |
| 2 | Reconstruye el Eixample | Roger Durán | Puzle: colocar manzanas en una rejilla CSS siguiendo reglas de Cerdà | Estructura del Eixample | `moves_count`, `help_clicks`, `puzzles_solved`, `level_time` |
| 3 | Línea del tiempo | Raúl Hernández | Ordenar hitos de la ciudad (romanos, Exposición de 1888, 1992…) contra reloj | Historia de la ciudad | `errors_made`, `level_time`, `hints_used`, `final_score` |
| 4 | Laberinto de metro | Alex Campano | Mover una ficha con las flechas hasta la parada, evitando obstáculos | Líneas y estaciones | `moves_count`, `steps`, `items_collected`, `final_score` |

Cada responsable define los niveles de dificultad internos y el esbozo de su juego `[PENDENT]`. Todos usan HTML, CSS y JavaScript con DOM y eventos, **sin `<canvas>`**.

## Tecnología propuesta
Laravel + SQL Server, JavaScript sin librerías pesadas en los juegos, Python con Pyodide para la vista «Mètriques».

## Riesgos
- Imágenes de monumentos: fotos propias, de dominio público o generadas, con el origen anotado.
- Datos históricos: verificarlos con fuentes oficiales.
- El juego 2 (reglas del Eixample) es el más trabajoso.
