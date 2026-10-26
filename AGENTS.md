# Guía del equipo (leer primero) · Jocs educatius

Este repositorio lo trabajan **4 personas, cada una en su ordenador y con su propia IA** (Claude Code, Codex, Cursor, Gemini…). Para que el resultado sea ordenado, **todos trabajamos igual**, y la forma de hacerlo está escrita en la carpeta [`AGENTS/`](AGENTS/README.md). Esa carpeta es la memoria compartida del proyecto.

## Lo primero que haces (persona o agente)
1. `git pull` de `main` **antes de empezar cualquier sesión**.
2. Lee [`AGENTS/README.md`](AGENTS/README.md) (índice y reglas de oro) y [`AGENTS/04-decisiones-y-equipo.md`](AGENTS/04-decisiones-y-equipo.md) (qué está decidido y qué no).
3. Mira tu tarea en la herramienta de gestión (`[PENDENT]`: Airtable) y trabaja en **tu rama** (`AGENTS/02-flujo.md`).
4. Si todavía no está decidida la temática o la tecnología, **no la inventes**: lee [`propostes/`](propostes/README.md).

## Reglas que no se negocian
- **Una persona, una tarea, una rama.** Nunca se hace push directo a `main`: todo entra por *pull request* y se fusiona a `main` (GitHub ya no exige aprobación; quien fusiona la PR la acepta, y el reto 0614 pide aceptar todas).
- **No inventes datos ni requisitos.** Lo no confirmado se marca `[PENDENT]` en `AGENTS/04-decisiones-y-equipo.md`.
- **Nada de secretos en Git** (`.env`, contraseñas, tokens, claves). Se comparte `.env.example` sin valores.
- **La documentación se actualiza en el mismo commit** que el cambio que la afecta. Si cambias algo y `AGENTS/` queda desfasado, el trabajo no está terminado.
- **Mismo estilo para todos:** CSS, utilidades JS, convenciones y nombres comunes (`AGENTS/03`).
- Cada IA debe leer este archivo y `AGENTS/` al empezar. Si tu herramienta usa otro archivo (`CLAUDE.md`, `.cursorrules`…), debe **apuntar a este**, no duplicarlo.

Última revisión: `26/10/2026 (primera versión)`.
