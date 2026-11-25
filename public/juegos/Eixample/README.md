# Reconstruïm l’Eixample

Soy el ayudante de Cerdà. Con el calco que recuperé en Memory, tengo que colocar viviendas, zonas verdes y equipamientos para reconstruir el plano. Cada nivel añade una regla. Al superar el tercero recupero la pieza del plano y desbloqueo la Línea del tiempo.

## Qué cambió y cuántas líneas se quitaron

Recuento de líneas físicas con `wc -l`, incluidas las líneas en blanco. La comparación incluye el código del juego. Esta guía se cuenta aparte.

| Archivo | Antes | Después | Qué se simplificó |
|---|---:|---:|---|
| `index.html` | 104 | 98 | Los contadores usan una lista de términos y valores (`dl`, `dt`, `dd)), con menos contenedores y los mismos identificadores. |
| `css/estilo.css` | 483 | 475 | La lista de contadores usa una sola cuadrícula. Se agruparon estilos que compartían botones y párrafos. |
| `js/principal.js` | 476 | 352 | Un solo listener de idioma, listeners de tablero e inventario que se reutilizan en todos los niveles y un procedimiento común para guardar y repintar cada movimiento. Las marcas pasan al módulo de progreso. |
| `js/interfaz.js` | 122 | 99 | Las piezas y las casillas comparten la creación del botón y su dibujo. Se eliminan las listas duplicadas de nodos y el envoltorio de los avisos. |
| `js/juego.js` | 196 | 193 | Aquí se juntan los datos de los niveles con sus reglas. Un solo `lado` basta para calcular la fila, la columna y el centro de una cuadrícula cuadrada. |
| `js/niveles.js` | 24 | 0 | El archivo se eliminó tras mover su única exportación a `juego.js`. |
| `js/progreso.js` | 54 | 79 | Centraliza los valores por defecto de una partida guardada y la actualización de las mejores marcas. |
| `js/traducciones.js` | 251 | 251 | Conserva el diccionario y los textos completos de los tres idiomas. |
| **Total** | **1710** | **1547** | **163 líneas menos**. JavaScript pasa de 1123 a 974 líneas y de seis módulos a cinco. |

Los tres PNG de `img/` se cargan en el inventario y en el tablero. La correspondencia entre tipo y fichero está en `imagenesPiezas`, dentro de `interfaz.js`.

## Guion para explicar el código archivo por archivo

### `index.html` y `css/estilo.css` · RA1 y RA6

El HTML contiene las secciones que ya tienen una posición fija, como la introducción, la lista de niveles, las instrucciones y los contadores. También deja vacíos los dos contenedores que rellena JavaScript, `#tablero` y `#piezas`. Las secciones aparecen o se ocultan con `hidden`. Al final del `body` se carga `principal.js` como módulo.

CSS Grid organiza el tablero. JavaScript escribe el tamaño en `data-columnes` y CSS selecciona la cuadrícula de 5, 7 o 9 columnas. Las clases `eje-central`, `destino-valido` y `destino-invalido` cambian el aspecto de un botón según lo que ocurre en la partida. La casilla conserva su foco visible al jugar con teclado.

### `js/principal.js` · RA1, RA4, RA5 y RA6

- **Arranque.** `DOMContentLoaded` espera al HTML. `getElementById()` guarda las referencias a los elementos fijos. Si Memory está superado y hay un tablero guardado, `abrirNivel()` lo recupera. Si es la primera visita, se muestra la introducción.
- **Clic y teclado.** Selecciono una pieza y después una casilla. Como son botones HTML, Enter y Espacio generan el mismo clic. Los listeners están en los contenedores. `event.target.closest()` encuentra el botón aunque el clic empiece en la imagen. `dataset.peca` da el tipo y `Number(casilla.dataset.posicio)` convierte la posición de texto a número.
- **Arrastre.** `dragstart` añade la clase `arrastrando` y guarda el tipo en `dataTransfer`. Durante `dragover`, `preventDefault()` permite soltar y `errorDeColocacion()` decide qué resaltado aplicar con `classList.toggle()`. `dragleave` quita el resaltado al salir de la casilla y `dragend` limpia al cancelar. `drop` lee el tipo y llama a `intentarColocar()`, la misma función que usa el clic.
- **Actualización.** Cuando coloco o retiro una pieza, `guardarMovimiento()` guarda la partida y repinta esa casilla y los contadores. Al cambiar de nivel o idioma, se actualiza todo el tablero. El aviso se recuerda por su clave para que también se traduzca en el momento.

### `js/juego.js` · RA2, RA3 y RA4

`niveles` es un array de tres objetos ordenados por número de nivel. Cada objeto dice cuánto mide el tablero, cuántos parques van en cada cuadrante y qué piezas hay. `crearPartida()` crea un array de casillas con `null` para las vacías y copia el inventario inicial. Así, colocar una pieza cambia las cantidades de esa partida.

| Nivel | Inventario | Regla de distribución |
|---|---|---|
| 1 · 5 × 5 | 21 viviendas y 4 parques | Un parque en cada cuadrante y fuera de los ejes. |
| 2 · 7 × 7 | 41 viviendas, 4 parques y 4 equipamientos | Un parque por cuadrante y un equipamiento por brazo de la cruz. La vivienda ocupa el centro. |
| 3 · 9 × 9 | 69 viviendas, 8 parques y 4 equipamientos | Dos parques por cuadrante sin compartir lado. Cada brazo tiene un equipamiento que toca un parque por un lado. |

La posición empieza en cero. En un tablero de 5 columnas, el índice 7 da fila 1 y columna 2 dentro del array. La división entera da la fila y el resto da la columna. Al jugador se le muestra como fila 2 y columna 3.

`errorDeColocacion()` comprueba que haya una pieza disponible, que la casilla esté vacía y que el tipo pueda ir ahí. Devuelve una clave de aviso o `null` si es válido. `colocarPieza()` aplica ese resultado y, si es válido, descuenta una unidad y suma un movimiento. Retirar también suma un movimiento y devuelve la pieza al inventario.

`comprobarPlano()` primero comprueba que esté lleno y luego cuenta parques por cuadrante y equipamientos por brazo. En el nivel 3 revisa los vecinos de arriba, abajo, izquierda y derecha, respetando el borde del tablero. La puntuación empieza en 1000, resta 10 por movimiento y 50 por pista, con un mínimo de cero.

### `js/interfaz.js` · RA6

`createElement()` crea cada botón, su dibujo y, en el inventario, la etiqueta. `appendChild()` los inserta. El nivel deja en cada casilla su posición, fila y columna con `dataset`. `actualizarCasilla()` consulta el array, refleja si está ocupada y escribe una etiqueta accesible con la fila, la columna y el tipo de pieza. `actualizarPiezas()` cambia el contador y marca la pieza seleccionada con `classList` y `aria-pressed`. Los botones con existencias pueden arrastrarse. Si falta una imagen, el CSS muestra el dibujo de reserva.

### `js/progreso.js` · RA3 y RA4

`localStorage` guarda texto en el navegador. `JSON.parse()` recupera el objeto compartido `cerda_progress` y `JSON.stringify()` lo vuelve a convertir en texto. Antes de escribir, se lee el objeto compartido y se actualiza su entrada `games[2]`. Dentro están el nivel actual, los tableros, las mejores marcas y el estado general.

Para entrar, se acepta `juego1Superado` con valor `"true"`. También se reconocen las partidas antiguas con `games[1] === "completed"` o `games[1].status === "completed"`. Al superar el tercer nivel se guarda `juego2Superado` con valor `"true"`. Volver a jugar permite mejorar una marca y conserva el desbloqueo conseguido.

### `js/traducciones.js` · RA3 y RA6

Hay un objeto por idioma (`ca`, `es`, `en`) con las mismas claves. Una etiqueta como `data-traduccio="movimientos"` indica qué texto buscar. `principal.js` recorre esas etiquetas y escribe con `textContent`. También cambia `lang` en el documento y guarda `cerda_lang`. Los mensajes de nivel, los nombres de piezas y las etiquetas accesibles salen del mismo diccionario.

## Demostración para la presentación

1. Selecciona un parque con el teclado y prueba una casilla del eje. Luego arrastra ese parque a un cuadrante. Explica que ambos intentos pasan por la misma función y que únicamente la colocación válida cambia el inventario.
2. Cambia de idioma con una pieza colocada, consulta una pista y recarga. Enseña que el tablero, el contador y el idioma se recuperan.
3. En el Inspector, señala el `data-posicio` de una casilla. En la pestaña de almacenamiento, localiza `cerda_progress` y explica qué guarda `games[2]`.
4. Para practicar un cambio propio, edita una pista en los tres idiomas de `traducciones.js`. Prueba si aparece en el nivel esperado. Para cambiar una regla, empieza en `juego.js` y revisa también las instrucciones traducidas.

## Comprobaciones realizadas

- En Chromium se completó Memory y se superaron los tres niveles del Eixample. En cada nivel se comprobó el cambio entre catalán, castellano e inglés, incluidos el aviso de victoria y las etiquetas accesibles de las casillas.
- Se probaron clic, teclado, arrastre válido e inválido, cancelación del arrastre, retirada, pistas, reanudación tras recargar y lectura de un guardado con el formato anterior.
- El nivel 3 escribió `juego2Superado` y abrió la URL de la Línea del tiempo. El arranque del juego siguiente se verificó con una corrección temporal en la respuesta de prueba porque su JavaScript tiene una cadena sin cerrar en esta rama. El Eixample terminó el recorrido sin errores de consola.
