# Documentación del equipo

Aquí está todo lo que hay que saber para trabajar en el proyecto. Lo escribimos y lo mantenemos entre los cuatro.

## Índice
| Archivo | Para qué sirve |
|---|---|
| [producto.md](producto.md) | Qué hay que construir (juegos, landing, administración), despliegue y métricas |
| [flujo-de-trabajo.md](flujo-de-trabajo.md) | Git, ramas, commits, pull requests y organización |
| [convenciones.md](convenciones.md) | Nombres, código, tests y diseño común (CSS compartido) |
| [equipo-y-decisiones.md](equipo-y-decisiones.md) | Miembros, fases, decisiones tomadas y dudas `[PENDENT]` |
| [../propostes/](../propostes/README.md) | Propuestas de temática, juegos y tecnología, y cómo se elige una |

## Reglas básicas
1. **Pull antes de empezar, PR para terminar.** Sesiones cortas; sube tu rama al acabar cada bloque.
2. **Una persona, una tarea, una rama.** Nada de push directo a `main`: todo entra por pull request. GitHub no exige aprobación, pero conviene que otra persona la mire; el reto 0614 pide que todas las PR se acepten.
3. **Lee antes de escribir:** este índice y `equipo-y-decisiones.md` (qué está decidido y qué no).
4. **Reutiliza lo común** (CSS y JS comunes, ver `convenciones.md`); si falta algo reutilizable, añádelo y documéntalo.
5. **Sin `<canvas>`** en los juegos (prohibido por el enunciado).
6. **Textos de la interfaz en los tres idiomas** (ca/es/en) desde el principio.
7. **No inventes datos ni requisitos.** Lo no confirmado se marca `[PENDENT]` y se pregunta al equipo.
8. **Nada de secretos en Git** (`.env`, contraseñas, tokens). Se comparte `.env.example` sin valores.
9. **La documentación se actualiza en el mismo commit** que el cambio que la afecta.
10. **Prueba antes de dar algo por hecho:** en local, en escritorio y en móvil.

## Lista antes de abrir una PR
- [ ] Rama propia, actualizada con `main`.
- [ ] Probado en local; los tests pasan.
- [ ] Sin secretos ni archivos generados.
- [ ] Usa el CSS/JS común; sin `<canvas>`; textos en los tres idiomas.
- [ ] Documentación actualizada si cambia algo que otros deban saber.
- [ ] Descripción de la PR con qué cambia y cómo probarlo.

Los conflictos en estos documentos se resuelven hablando en equipo, nunca borrando lo del otro.
