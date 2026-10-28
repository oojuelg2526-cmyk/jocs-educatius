# Guía de trabajo del equipo

## Equipo
| Persona | GitHub | Juego |
|---|---|---|
| Óscar Ojuel González | oojuelg2526-cmyk | Nivel 1 · Memory de Barcelona |
| Roger Durán | rduran597 | Nivel 2 · Reconstruye el Eixample |
| Raúl Hernández | raulhpolitecnics | Nivel 3 · Línea del tiempo |
| Alex Campano | acampanoe2526 | Nivel 4 · Laberinto de metro |

Los juegos se repartieron por sorteo el 28/10/2026. Áreas comunes a repartir `[PENDENT]`: landing y CSS común · administración y BD · despliegue, Git y documentación · métricas y ML. Las tareas están en Airtable, por sprints semanales (lunes a viernes). Dudas por el chat de Gmail del equipo. Trabajar desde casa es voluntario.

## Git
- Rama `main` protegida: nadie hace push directo, todo entra por pull request (GitHub no exige aprobación, pero conviene que otra persona la mire).
- Una rama por persona y tarea: `feature/<nombre>-<tema>`, `fix/<tema>`, `docs/<tema>`.
- Commits pequeños tipo Conventional Commits (`feat:`, `fix:`, `docs:`…), en catalán o castellano.
- Sesión de trabajo: `git switch main && git pull`, crear o actualizar tu rama, probar en local, push y PR.
- Versiones desplegadas: etiquetas `v1.0` y `v2.0`.
- Nada de secretos en Git: `.env` fuera, `.env.example` sin valores.
- Cada uno se responsabiliza de lo que sube y no toca el trabajo de otros sin avisar.

## Convenciones `[PENDENT]` según la tecnología
- Código y nombres en inglés; textos de interfaz solo en archivos de idioma (`ca`, `es`, `en`).
- Carpetas y archivos en minúsculas con guiones.
- JavaScript con `const`/`let`, funciones pequeñas, un módulo por juego, sin `<canvas>`.
- Un solo CSS común (variables para colores y tipografías) más uno pequeño por juego.
- Permisos de administrador comprobados siempre en el servidor.
- Accesibilidad: contraste, foco visible, uso en móvil (375 px) y escritorio.

## Decisiones
| Fecha | Decisión |
|---|---|
| 26/10/2026 | Equipo de 4 (Acta de constitución). Rama principal `main`. |
| 26/10/2026 | Se quita la aprobación obligatoria de las PR; se mantiene la PR. |
| 28/10/2026 | Se sigue con «Ildefons Cerdà perdió el plano», un juego final de 4 niveles. |
| 28/10/2026 | Reparto de los 4 juegos por sorteo. |

## Pendientes
- Nombre definitivo del proyecto y del repositorio.
- Tecnología e identidad visual.
- Reparto de las áreas comunes, dominio y hosting.
