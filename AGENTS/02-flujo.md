# 02 · Flujo de trabajo (igual para todos)

## Ramas
- `main`: siempre desplegable. **Nadie hace push directo** (activar protección de rama). *Ver `08`: el enunciado habla de «branca master» en genérico; el equipo usa `main` salvo que el profesorado diga otra cosa.*
- `feature/<nombre>-<tema>` (ej. `feature/oscar-joc-1`), `fix/<tema>`, `docs/<tema>`.
- Versiones desplegadas: etiquetas `v1.0` (≤17/11) y `v2.0` (≤08/12).

## Una sesión de trabajo
1. `git switch main && git pull`
2. `git switch -c feature/<nombre>-<tema>` (o `git switch` a tu rama y `git merge main`).
3. Trabaja en cambios pequeños; prueba en local.
4. Commit (abajo). Al acabar un bloque: `git push -u origin <tu-rama>` y abre una PR.
5. Otra persona la revisa y la **acepta** (el enunciado exige aceptar cada PR). Si hay conflicto, se documenta qué pasó y cómo se resolvió en `docs/registro-versiones.md` (se crea cuando haga falta).

## Commits (Conventional Commits; en catalán o castellano)
`feat:` · `fix:` · `docs:` · `style:` · `refactor:` · `test:` · `chore:`. Ej.: `feat(joc-2): desbloqueo del nivel 3`. Commits pequeños. El mensaje se escribe en un archivo y se usa `git commit -F` si lleva comillas o caracteres raros.

## Pull requests
Título claro, plantilla de `.github/PULL_REQUEST_TEMPLATE.md`, capturas si hay interfaz. Una PR = una tarea. Revisor: otra persona (rotamos). No se fusiona una PR propia.

## Cómo trabajamos con IA
- Cada persona usa su IA, pero todas leen `AGENTS.md` + `AGENTS/` al empezar.
- La IA propone y tú revisas: tú respondes de lo que subes. No subas código que no entiendas (hay presentación técnica).
- La IA no toca el trabajo de otros ni reformatea archivos ajenos.
- Si la IA descubre algo compartido (un patrón, una convención), lo anota en `AGENTS/` en la misma PR.

## Tiempo y comunicación
- El Acta (26/10/2026) decía que nadie podía trabajar fuera de clase; **acuerdo posterior: quien quiera puede adelantar trabajo desde casa**, es voluntario. Se aprovecha igualmente el tiempo de clase, así que: sesiones cortas, PR pequeñas y documentación al día para que nadie dependa de que otro esté conectado.
- **Dudas y comunicación:** conversación de **chat de Gmail** del equipo. (El Acta mencionaba WhatsApp solo para urgencias.) Lo que se decida allí y afecte al proyecto se anota en `04-decisiones-y-equipo.md`.
- **Reparto de tareas:** se va repartiendo a medida que avanza el proyecto, por **fases semanales** (ver «Fases» en `04-decisiones-y-equipo.md`): cada semana un objetivo y cada persona avanza con sus tareas.

## Gestión de tareas
`[PENDENT]` Airtable (se organizará allí). Cada tarea: responsable, rama, estado, fecha.
