# Cómo unimos los 4 juegos: una ruta que acaba en Urquinaona

## Resumen en un párrafo
Cerdà ha perdido el plano del Eixample y cada juego recupera una pieza, siguiendo una ruta por el centro de Barcelona que **termina en la plaza Urquinaona, donde está nuestro centro**. Cada juego acaba en un barrio con un objeto, y el siguiente empieza en ese mismo sitio con ese objeto: el Memory deja un calco de la cuadrícula cerca del Palau de la Música, el Eixample coloca las manzanas, la Línea del tiempo da la llave de la estación de metro y el Laberinto lleva a Urquinaona, donde se junta el plano. En la landing se ve un único plano de Cerdà con cuatro huecos que se rellenan juego a juego.

## Por qué Urquinaona
- Es el sitio donde estudiamos, así que el final tiene gracia y es fácil de explicar.
- Está justo donde el Eixample de Cerdà se encuentra con la ciudad vieja (las murallas se derribaron en 1854 y el Plan Cerdà es de 1859).
- Tiene metro (L1 y L4) y el Palau de la Música Catalana, que ya está en el banco de monumentos del Memory, está a pocos minutos a pie.
- Con la L1 se enlaza todo: Universitat → Catalunya → Urquinaona → Arc de Triomf → … → Glòries.

## Lo que ya encajaba
- Juego 2 → 3: al encajar las manzanas se abre una compuerta con manuscritos de hechos desordenados.
- Juego 3 → 4: al ordenar la línea del tiempo se consigue la llave de la estación de Universitat.

## La ruta
| Juego | Escenario | Termina con | Pieza del plano |
|---|---|---|---|
| 1 · Memory de Barcelona (Óscar) | Monumentos de Barcelona; el último nivel acaba en el entorno del **Palau de la Música**, cerca de Urquinaona | Un **calco de la cuadrícula** con huecos | Pieza 1: la **trama** de calles |
| 2 · Reconstruye el Eixample (Roger) | La mesa de dibujo de Cerdà; el calco del juego anterior | La compuerta se abre y salen los **manuscritos** | Pieza 2: las **manzanas** |
| 3 · Línea del tiempo (Raúl) | El archivo, de la época romana hasta hoy, con el plan de 1859 | La **llave de la estación de Universitat** | Pieza 3: la **leyenda y la fecha** del plano |
| 4 · Laberinto de metro (Alex) | El metro, con la L1 como eje | El plano completo se junta en **Urquinaona** | Pieza 4: el **centro** del plano |

## Qué se cambia en cada juego
- **Juego 1 (Óscar):** el último nivel termina con el mapa iluminando el entorno de Urquinaona y la nota de Cerdà con el calco.
- **Juego 2 (Roger):** en su ficha el juego 1 aparece como «Descubre el Eixample»; es **Memory de Barcelona**. Empezar la partida con el calco encima de la mesa y enseñar la pieza «manzanas» al ganar.
- **Juego 3 (Raúl):** incluir entre los hitos la **aprobación del Plan Cerdà (1859)** y el derribo de las murallas, y entregar la pieza «leyenda» junto a la llave.
- **Juego 4 (Alex):** el nivel 3 acaba en **Urquinaona** en lugar de Glòries (se puede mencionar Glòries como la plaza que Cerdà pensó como centro). Al terminar se enseña el plano completo y la nota final. Sin más cambios.

## Elementos compartidos
1. **El plano de la landing:** un único plano con 4 huecos; cada juego superado rellena el suyo (se guarda con el progreso por usuario). Los bloqueados salen en gris.
2. **Nota de Cerdà** al empezar y acabar cada juego: 2–3 líneas con un «¿sabías que…?» en ca/es/en.
3. **Mapa de barrios del Memory** como componente reutilizable, para marcar dónde estamos en la ruta.
4. **Mismo estilo:** papel sepia, tinta y regla antigua, con variables CSS comunes (colores, tipografías, botones).
5. **Métricas con el mismo nombre cuando significan lo mismo:** `level_time`, `level_reached`, `final_score` y `help_clicks`; cada juego añade las suyas.

## Por comprobar
- Si Urquinaona cae en la Dreta de l'Eixample o en Sant Pere, Santa Caterina i la Ribera (hay que comprobarlo en una fuente oficial; el Palau de la Música sí está en Sant Pere).
- Líneas y estaciones con el plano oficial de TMB.
- Origen de las imágenes del plano de la landing (si es dibujado o generado, anotarlo).
