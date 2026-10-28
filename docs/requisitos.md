# Requisitos del proyecto

Fuente: enunciado de «PROJ_01 · Jocs per aprendre» y de sus retos (Politècnics, 10/2026). Lo que no esté aquí ni en el enunciado es `[PENDENT]`.

## Juegos (0612)
- Un juego por persona (4), con la misma temática y un objetivo común.
- Se desbloquean en orden; el usuario ve el total (los bloqueados, bloqueados).
- Al volver, retoma donde se quedó; puede rejugar los superados.
- Estadísticas de uso útiles (récords diarios/semanales/por categoría).
- **Prohibido `<canvas>`.**

## Landing
- Presenta el proyecto y el equipo (con roles) y da acceso a juegos y administración, con un CTA claro.
- **Multiidioma: català, castellano, English.**
- Estilo y CSS **comunes** con los juegos.
- Multimedia con producciones propias; wireframes de juegos y landing en el diseño.

## Administración (0613)
- BD con los usuarios que juegan y sus puntuaciones/estadísticas.
- Solo los **administradores** ven y modifican los datos; un **superadministrador** gestiona a los administradores.

## Despliegue (0614)
- Entorno local, dominio y DNS, SFTP/SCP, hosting de producción, SSL + CDN y documentación técnica (paso a paso, capturas, medidas de seguridad, registro de cambios, problemas de Git).
- **Dos versiones desplegadas con dominio:** 1.ª antes del **17/11/2026**; final antes del **08/12/2026** `[PENDENT confirmar año]`. Se entrega con el enlace al repositorio.
- Ramas individuales, pull requests y gestión de conflictos documentada; se deben aceptar todas las PR.

## Métricas (OPT)
- Cada juego registra por sesión: `username`, `session_id`, `date_time`, `session_length` y **≥4 métricas propias**.
- Simulación en Python (200-500 sesiones) con correlaciones; Pandas → Matplotlib → modelo de clasificación (retorno del jugador).
- **Informe PDF: 21/11/2026.** Después, vista «Mètriques» con Pyodide, sin textos de conclusiones.

## Fechas
29/10 Acta · 17/11 1.ª versión · 21/11 PDF de métricas · 08/12 versión final · 13/12 cierre.
