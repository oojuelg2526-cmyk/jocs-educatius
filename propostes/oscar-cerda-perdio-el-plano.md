# Propuesta: «Cerdà perdió el plano»
**Autor:** Óscar Ojuel · **Fecha:** 26/10/2026 · **Idioma:** castellano (la plantilla está en catalán; el equipo decide el idioma final)

## Temática y público objetivo
Historia y geografía de **Barcelona**, para **gente de la ciudad** (jóvenes y adultos que viven aquí y creen conocerla). Tono ameno, con curiosidades («¿sabías que…?») en lugar de preguntas escolares. Se aprende jugando, no respondiendo test.

## Fil conductor (storytelling)
Ildefons Cerdà ha perdido los planos del Eixample y la ciudad se ha desordenado. Cada juego recupera una pieza: primero los monumentos, luego las manzanas, después la línea del tiempo y por último el camino de vuelta por el metro. Al terminar los cuatro, el plano queda restaurado.

## Los 4 juegos (uno por miembro, se desbloquean en orden)
| # | Juego | Mecánica | Qué se aprende | Métricas propias (≥4) |
|---|---|---|---|---|
| 1 | **Memory de Barcelona** | Parejas de cartas (monumento ↔ barrio/dato) con intentos limitados y reloj | Monumentos y barrios | `attempts`, `errors_made`, `level_reached`, `level_time` |
| 2 | **Reconstruye el Eixample** | Puzle: colocar manzanas en una rejilla CSS siguiendo reglas de Cerdà (calles rectas, chaflanes, plazas) | Estructura del Eixample | `moves_count`, `help_clicks`, `puzzles_solved`, `level_time` |
| 3 | **Línea del tiempo** | Ordenar hitos de la ciudad (romanos, Exposición de 1888, 1992…) contra reloj | Historia de la ciudad | `errors_made`, `level_time`, `hints_used`, `final_score` |
| 4 | **Laberinto de metro** | Mover una ficha con las flechas por una rejilla hasta la parada, evitando obstáculos | Líneas y estaciones | `moves_count`, `steps`, `items_collected`, `final_score` |

Todos usan solo HTML/CSS/JS con DOM y eventos (**sin `<canvas>`**). Quien prefiera memory y puzle puede quedarse el 1 o el 2.

## Cómo cumple el enunciado
- **Se desbloquean en orden** y se ve el total (los bloqueados aparecen bloqueados).
- **Progreso guardado:** al volver, empieza en el último juego/nivel alcanzado (BD, por usuario).
- **Rejugar** los ya superados.
- **Estadísticas y récords** (diarios/semanales, por juego) visibles en la landing.
- **Landing** con la historia, el equipo y sus roles, **multiidioma ca/es/en**, CSS común con los juegos.
- **Administración:** administradores ven/modifican usuarios y puntuaciones; superadministrador gestiona administradores.
- **Métricas/IA:** todos los juegos registran `username`, `session_id`, `date_time`, `session_length` + las propias; simulación Python (200-500 sesiones) y modelo para predecir si el jugador vuelve.
- **Despliegue:** v1 antes del 17/11, final antes del 08/12 (ver `AGENTS/01-producto.md`).

## Tecnología propuesta (a decidir en equipo)
Laravel + SQL Server (como en 0613 y como pide el reto de métricas), JavaScript sin librerías pesadas en los juegos, Python con Pyodide para la vista «Mètriques». Todo lo visto en el curso.

## Por qué debería ganar
1. **Cumple todos los requisitos** sin añadir riesgos.
2. **Cada juego es pequeño** (unas 150-250 líneas de JS) y se puede explicar y reconstruir en la mesa sin ayuda.
3. **Se ve mucho:** la rejilla del Eixample es CSS Grid, así que parece trabajado sin necesitar gráficos complejos.
4. **Métricas con variación natural** (errores, tiempo, ayudas) para el modelo de abandono.
5. **Tema propio y cercano:** público de la ciudad, con datos que se pueden comprobar.

## Riesgos y dudas
- Imágenes de monumentos: usar fotos propias, de dominio público o generadas, con origen anotado.
- Datos históricos: verificarlos con fuentes oficiales antes de usarlos.
- Reparto equilibrado: el juego 2 (reglas del Eixample) es el más trabajoso.

## Esfuerzo estimado
Unas 8-10 h por juego (con pruebas), más landing, administración, despliegue y métricas repartidos entre los 4.
