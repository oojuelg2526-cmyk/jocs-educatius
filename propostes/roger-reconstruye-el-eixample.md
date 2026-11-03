# Reconstruye el Eixample
Nivel 2 de «Ildefons Cerdà perdió el plano» · Responsable del juego: Roger Duran

### Qué se aprende
Geografía urbana de Barcelona, pensamiento lógico y geometría aplicada. Comprensión de la estructura urbana ideada por Ildefons Cerdà (calles rectas, chaflanes octogonales, orientación solar, equilibrio entre edificabilidad, parques y equipamientos). Público: jóvenes y adultos que viven en la ciudad.

### Idea
Puzle interactivo basado en una rejilla CSS Grid donde el jugador debe encajar e interactuar con distintas manzanas del Eixample (residenciales, zonas verdes, equipamientos públicos) respetando las estrictas reglas de sostenibilidad, luz y ventilación del Plan Cerdà original. Todo desarrollado con HTML, CSS Grid y JavaScript (Drag & Drop nativo).

### Mecánica del juego
- **Interacción:** El jugador selecciona o arrastra las manzanas cuadradas con chaflán desde un panel lateral a la rejilla del plano, respetando las restricciones de ubicación de cada tipo de manzana.
- **Condición de victoria:** Completar la cuadrícula cumpliendo al 100% las reglas de combinación de uso residencial, zonas verdes y equipamientos de cada nivel.
- **Recompensa / Hilo conductor:** El plano recuperado en el juego 1 está incompleto. El jugador viaja mentalmente al siglo XIX como ayudante de Cerdà para recomponer la cuadrícula perfecta. Al encajar todas las piezas del Eixample, la maqueta activa una compuerta secreta que entrega unos manuscritos con hechos históricos desordenados, desbloqueando así el Juego 3 (Línea del tiempo).

### Lugar en la historia
Cerdà ha perdido los planos del Eixample y cada juego recupera una pieza. Este es el juego 2 de 4 y se desbloquea únicamente al superar el juego 1 (Descubre el Eixample / Juego previo).

### Niveles de dificultad internos
- **Nivel 1:** Cuadrícula de $3 \times 3$. Reglas básicas de combinación entre manzanas de uso residencial y zonas verdes.
- **Nivel 2:** Cuadrícula de $4 \times 4$. Incorporación de restricciones adicionales sobre la ubicación obligatoria de equipamientos públicos y vías de paso.
- **Nivel 3:** Cuadrícula de $5 \times 5$. Exigencia de un equilibrio complejo entre vías de circulación principal, densidad de vivienda, iluminación y amplias zonas verdes.

### Estilo visual
- **Estética general:** Mesa de dibujo de arquitectura del siglo XIX, con textura de papel vegetal sobre plano técnico azul o sepia con anotaciones a lápiz de Cerdà.
- **Piezas/Manzanas:** Bloques octogonales con chaflanes característicos, con códigos de color retro (verde botánico para parques, sepia/teja para residenciales, azul tinta para equipamientos).
- **Rejilla:** Guías de cuadrícula del Eixample demarcadas con líneas finas de plano técnico y cotas de medida.
- **Interacción Drag & Drop:** Resaltado neumático o resplandor sepia suave al sobrevolar casillas válidas, animación de encaje magnético al soltar la pieza y alerta sutil si incumple una regla urbanística.

### Esbozo de la interfaz
<img width="1024" height="559" alt="8ae0f621-1026-491c-a0b3-46bfe2cef44e" src="https://github.com/user-attachments/assets/f98a5280-dd4a-46b2-b948-94d85757f0e8" />

### Métricas propias (≥4)
- `moves_count`: Número total de movimientos o colocaciones de piezas realizadas durante el puzle.
- `help_clicks`: Cantidad de veces que se consulta la guía de reglas urbanísticas del Plan Cerdà.
- `puzzles_solved`: Cantidad de niveles o sub-puzles completados con éxito dentro del juego.
- `level_time`: Tiempo exacto consumido por el usuario para resolver la cuadrícula del nivel.

Además, se registran las métricas generales de sesión: `username`, `session_id`, `date_time` y `session_length`.

### Riesgos y consideraciones técnicas
- **Definición de reglas del puzle:** Es el juego más trabajoso del proyecto. Se deben definir e implementar pronto en JavaScript los algoritmos de validación de la rejilla (comprobación de adyacencias, límites de zonas verdes y conectividad de vías).
- **Usabilidad y Responsive Grid:** Asegurar que la rejilla CSS Grid mantenga los chaflanes y la escala en diferentes tamaños de pantalla, garantizando una respuesta fluida a los eventos nativos de Drag & Drop (`dragstart`, `dragover`, `drop`).
