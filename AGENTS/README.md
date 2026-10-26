# AGENTS · contexto compartido del equipo

Esta carpeta es el contexto de **todas** las IA y personas del equipo. Si dos miembros usan agentes distintos, los dos deben obtener las mismas reglas desde aquí.

## Índice
| Archivo | Para qué sirve |
|---|---|
| [`01-producto.md`](01-producto.md) | Qué hay que construir (juegos, landing, administración), despliegue y métricas |
| [`02-flujo.md`](02-flujo.md) | Git, ramas, commits, PR, sesiones de trabajo, cómo usar la IA |
| [`03-convenciones.md`](03-convenciones.md) | Nombres, código, tests y diseño común (CSS compartido) |
| [`04-decisiones-y-equipo.md`](04-decisiones-y-equipo.md) | Miembros, decisiones tomadas y dudas `[PENDENT]` |
| [`../propostes/`](../propostes/README.md) | Propuestas de temática/juegos/tecnología y cómo se elige una |

## Reglas de oro
1. **Pull antes de empezar, PR para terminar.** Sesiones cortas; sube tu rama al acabar cada bloque.
2. **Lee antes de escribir:** este índice, `04` (qué está decidido) y el archivo de tu tema.
3. **Reutiliza lo común** (CSS y JS comunes, ver `03`); si falta algo reutilizable, añádelo y documéntalo.
4. **Sin `<canvas>`** en los juegos (prohibido por el enunciado).
5. **Texto de la interfaz multiidioma** (ca/es/en) desde el principio.
6. **No inventes.** Marca `[PENDENT]` y pregunta al equipo.
7. **Documenta en el mismo commit.** El equipo se entera de los cambios leyendo `AGENTS/`.
8. **Verifica antes de dar por hecho:** probar en local y revisar escritorio y móvil.

## Checklist antes de abrir una PR
- [ ] Rama propia, actualizada con `main`.
- [ ] Probado en local; tests pasan.
- [ ] Sin secretos ni archivos generados.
- [ ] Usa el CSS/JS común; sin `<canvas>`; textos en los tres idiomas.
- [ ] `AGENTS/` actualizado si cambia algo que otros deban saber.
- [ ] Descripción de la PR con qué cambia y cómo probarlo.

## Plantilla para pedir una tarea a tu IA
```text
Lee AGENTS.md y AGENTS/README.md, 02-flujo.md y el archivo de mi tema.
Tarea: «<tarea de la herramienta de gestión>». Trabaja en la rama feature/<mi-nombre>-<tema>.
Reutiliza el CSS y JS comunes. Si falta algo, marca [PENDENT]. Actualiza AGENTS/ si cambia
algo compartido, haz commits pequeños (Conventional Commits) y no toques el trabajo de otros.
```

## Mantener esta carpeta
Quien cambia una convención, una decisión o una pieza común actualiza el archivo correspondiente **en el mismo commit**. Los conflictos en `AGENTS/` se resuelven hablando en equipo, nunca borrando lo del otro.
