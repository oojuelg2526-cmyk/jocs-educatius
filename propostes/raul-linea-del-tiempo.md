# Línea del tiempo

**Nivel 3 de «Ildefons Cerdà perdió el plano»**  
**Responsable del juego:** Raúl Hernández

## Qué se aprende
Historia de la ciudad de Barcelona a través de sus hitos más representativos (época romana, Exposición Universal de 1888, Juegos Olímpicos de 1992, etc.). Público: jóvenes y adultos que viven en la ciudad.

## Mecánica del juego
- **Interacción:** El jugador debe ordenar cronológicamente las tarjetas de los hitos históricos arrastrándolas y soltándolas mediante la API de Drag & Drop en JavaScript nativo (HTML/CSS/JS).
- **Condición de victoria:** Completar el orden correcto antes de que finalice el temporizador en JS.
- **Recompensa / Hilo conductor:** Al superar los 3 niveles de la línea del tiempo, el jugador recupera esta pieza del plano y obtiene la pista/clave secreta para acceder a la estación de metro de Universitat, desbloqueando así el Juego 4 (Laberinto de metro).

## Lugar en la historia
Cerdà ha perdido los planos del Eixample y cada juego recupera una pieza. Este es el juego 3 de 4 y se desbloquea únicamente al superar el juego 2 (Reconstruye el Eixample).

## Niveles de dificultad internos
- **Nivel 1:** 4 hitos históricos con amplia diferencia de siglos entre sí. Tiempo holgado.
- **Nivel 2:** 6 hitos con eventos de la Edad Media, Edad Moderna y Contemporánea. Tiempo moderado.
- **Nivel 3:** 8 hitos históricos con fechas más cercanas entre sí. Tiempo reducido y mayor exigencia de precisión.

## Esbozo de la interfaz
<img width="1024" height="559" alt="d72dc09f-be29-4026-831e-ea96a8fc781d" src="https://github.com/user-attachments/assets/f8f4fca1-6ea0-48b1-b9d5-e50a2511694e" />

## Métricas propias (≥4)
- `errors_made`: Intentos o colocaciones incorrectas al validar el orden.
- `level_time`: Tiempo exacto consumido por el usuario para resolver el nivel.
- `hints_used`: Cantidad de pistas consultadas sobre los hitos durante la partida.
- `final_score`: Puntuación final calculada según el tiempo restante, errores cometidos y nivel completado.

Además, se registran las métricas generales de sesión: `username`, `session_id`, `date_time` y `session_length`.

## Riesgos y consideraciones técnicas
- **Datos históricos:** Verificación rigurosa de fechas y hechos con fuentes oficiales de la historia de Barcelona.
- **Usabilidad Drag & Drop:** Garantizar una experiencia de arrastre fluida con eventos nativos de JS (`dragstart`, `dragover`, `drop`) y feedback visual claro en CSS (zonas de destino resaltadas, animaciones al soltar).
