# 01 · Producto, requisitos, despliegue y métricas

Fuente: enunciado del proyecto «PROJ_01 · Jocs per aprendre» y de sus retos (Politècnics, Integrat 01, 10/2026). Si algo no está aquí ni en el enunciado, es `[PENDENT]`.

## Producto
Aplicación web de **juegos educativos** sobre **una temática común** `[PENDENT: se decide con `propostes/`]`, con hilo conductor (storytelling).

## Requisitos obligatorios
**Juegos (JS)**
- 1 juego por miembro (4), misma temática y objetivo común.
- Se desbloquean en orden; el usuario ve el total (los bloqueados aparecen bloqueados).
- Al volver, retoma el escenario donde se quedó; puede rejugar los superados.
- Estadísticas de uso útiles (récords diarios/semanales/por categoría son bienvenidos).
- **Prohibido `<canvas>`.**

**Landing**
- Presenta proyecto y equipo (con roles); da acceso a juegos y administración; CTA claro.
- **Multiidioma: català, castellano, English.**
- Estilo y CSS **comunes** con los juegos (personajes, botones, colores, tipografías, controles).
- Multimedia con producciones propias (se puede usar IA).
- Wireframes de juegos y landing en la fase de diseño.

**Administración**
- BD con usuarios que juegan y sus puntuaciones/estadísticas.
- Solo **administradores** ven y modifican los datos; un **superadministrador** gestiona los administradores.

**Despliegue (0614)**
- Entorno local, dominio + DNS, SFTP/SCP, hosting de producción, SSL + CDN, documentación técnica.
- **Dos versiones desplegadas:** 1.ª antes del **17/11/2026**; final antes del **08/12/2026** `[PENDENT confirmar año del Site]`. Entrega con dominio y enlace al repo.

**Métricas / IA (OPT)**
- Cada juego registra por sesión: `username`, `session_id`, `date_time`, `session_length` + **≥4 métricas propias del juego**.
- Simulación en Python (200-500 sesiones) con correlaciones; pipeline Pandas → Matplotlib → modelo de clasificación (retorno del jugador).
- **PDF del informe: 21/11/2026.** Después, vista «Mètriques» en la web con Pyodide, sin textos de conclusiones.

## Fechas
Ver `README.md` de la raíz y `04-decisiones-y-equipo.md`. 29/10 Acta (hecha) · 17/11 1.ª versión · 21/11 PDF métricas · 08/12 versión final · 13/12 cierre del bloque.

## Fuera de alcance / opcional
`[PENDENT]` (lo decide el equipo).

## Despliegue (detalle del reto 0614)
- Entorno local (XAMPP u otro `[PENDENT]`, BD local alineada con producción), hosting de producción, dominio y DNS `[PENDENT]` (ningún miembro asumido), SFTP/SCP, SSL + CDN.
- Entregas con dominio, enlace al repo y **documentación técnica** en `docs/` (se crea cuando haga falta): capturas/vídeos, paso a paso, medidas de seguridad y por qué, registro de cambios, instrucciones para desplegar y problemas de Git encontrados.

## Métricas / IA (detalle del reto OPT)
- Cada juego registra: `username`, `session_id`, `date_time`, `session_length` + ≥4 métricas propias (definirlas en `docs/metricas.md`).
- Código de simulación y pipeline en `metrics/` (se crea cuando haga falta): 200-500 sesiones con correlaciones (p. ej. muchos errores → +75 % de abandono), métricas derivadas (`player_count`, `returning_player`, `retention_rate`, `churn_rate`, `average_session_length`), gráficos y modelo.
- Informe PDF 21/11/2026; después vista «Mètriques» con Pyodide, sin textos de interpretación.
