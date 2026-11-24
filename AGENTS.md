# Instruccions del projecte Jocs per aprendre

Projecte Integrat 1 de DAW2 (2026/2027), mòdul 0612 — Desenvolupament Web en Entorn Client (DWEC), Centre d’Estudis Politècnics de Barcelona.

## Fonts, abast i rols

- Abans de generar o modificar codi, llegeix l’[índex mestre](/Users/fred89/Documents/Notas-Jocs/Instrucciones.md) i les seves especificacions de [regles i estructura](/Users/fred89/Documents/Notas-Jocs/01-Reglas-y-Prohibiciones.md), [producte](/Users/fred89/Documents/Notas-Jocs/02-Requisitos-Producto.md), [JavaScript RA1–RA6](/Users/fred89/Documents/Notas-Jocs/03-Estandares-JS-RA1-RA6.md) i [història i jocs](/Users/fred89/Documents/Notas-Jocs/04-Historia-y-Juegos.md). Si una petició entra en conflicte amb les regles, adverteix-ho abans d’escriure codi.
- El rol de desenvolupament front-end cobreix l’HTML, el CSS, la lògica amb JavaScript natiu i la interacció. El rol d’analista documenta necessitats, arquitectura de dades i diagrames UML de casos d’ús, flux d’estats i estructura de dades i funcions a `docs/analisis-uml.md` amb Markdown i Mermaid.
- Escriu els comentaris de codi en català. La llengua per defecte de tota l’experiència és el català (`ca`), amb versions en castellà (`es`) i anglès (`en`).
- El públic descrit és jovent i persones adultes que viuen a Barcelona. Tots els jocs comparteixen públic, temàtica i to. La portada ha d’indicar explícitament la franja d’edat o etapa educativa acordada. La proposta lliurada situa l’aventura fora d’una etapa reglada concreta i no fixa una edat numèrica.
- Consulta els [requisits del projecte](docs/requisitos.md) i la [guia de treball](docs/guia-de-trabajo.md) per a la integració amb l’equip. Les restriccions de JavaScript natiu s’apliquen als jocs. La plataforma d’equip contempla Laravel, SQL Server, usuaris, administració i mètriques.

## Criteri de codi de DAW i fonts docents

- Escriu codi que un estudiant de DAW pugui explicar pas a pas. Fes servir noms descriptius, condicions curtes i funcions amb una finalitat clara. Tria un bucle, una variable intermèdia o un `if/else` de quatre o cinc línies quan facin més entenedora una regla. Evita ternaris niats, cadenes de callbacks i capes d’abstracció afegides només per estalviar línies.
- Aplica el temari a una necessitat real. RA1 tracta l’arquitectura client/servidor i DevTools. RA2 treballa tipus, conversions, àmbit i flux. RA3 i RA4 inclouen col·leccions, objectes, còpies, funcions, callbacks, BOM i temporitzadors. RA5 cobreix esdeveniments i ofereix exemples d’arrossegament natiu. RA6 tracta nodes, selectors, estils i `dataset`. El temari inclou prototips, classes, `?.` i `reduce()`; un inventari senzill es pot representar amb un objecte literal. [Classroom de 0612](https://classroom.google.com/u/1/w/ODcyMDk4ODk5NDA5/t/all?hl=es)
- El repte de Jocs prohibeix explícitament l’element HTML `<canvas>`. Les fitxes també comparen sintaxis i APIs per aprendre com funcionen. Per al producte s’apliquen totes les prohibicions locals de l’apartat següent. La fitxa de RA4 experimenta amb diàlegs i `document.write()` en un entorn de pràctiques. El Sites de RA4 situa l’explicació de `localStorage` després del primer projecte; l’equip l’utilitza per complir la represa. [Repte de Jocs](https://sites.google.com/politecnics.barcelona/proj01-jocs/repte?authuser=1) · [Materials de RA4](https://sites.google.com/politecnics.barcelona/interaccientresistemes/materials?authuser=1)
- Prepara l’evidència del joc amb públic, responsable, mecàniques, nivells, esbós i transicions. L’equip lliura casos d’ús, planificació, diagrames entitat-relació i relacional, prototip, BD i projecte. El projecte integrat hi afegeix informe de mètriques, desplegament, presentacions tècnica i pública i coavaluació. El repte exigeix estadístiques útils i proposa rècords diaris o setmanals com a millora; l’equip els ha adoptat. [Lliuraments de l’integrat](https://sites.google.com/politecnics.barcelona/proj01-jocsperapendre/el-projecte?authuser=1)
- Comparteix el CSS de la portada i els jocs quan s’integrin. La landing presenta l’equip i els rols, incorpora producció multimèdia pròpia i dona accés als jocs i a l’administració autoritzada. La BD guarda usuaris i puntuacions, i el superadministrador gestiona els administradors. [Landing](https://sites.google.com/politecnics.barcelona/proj01-landingpage/repte?authuser=1) · [Administració](https://sites.google.com/politecnics.barcelona/proj01-adm-usuaris/repte?authuser=1)
- Registra automàticament quatre camps comuns i almenys quatre d’específics per sessió. El puzle genera les dades. La vista web «Mètriques» de l’optativa usa SQL Server, Laravel, Python amb Pyodide i gràfics Matplotlib en PNG. El playtest de 5–10 partides orienta la simulació de 200–500 sessions. Documenta el desplegament de dues versions amb domini, repositori, captures i incidències. El Sites de desplegament indica anys incompatibles per als dos terminis; confirma el termini final amb el docent. [Mètriques](https://sites.google.com/politecnics.barcelona/metriquesdelsjocs/repte?authuser=1) · [Desplegament](https://sites.google.com/politecnics.barcelona/repte-projecte-m08/repte?authuser=1)

## Prohibicions absolutes

1. Queden prohibits `<canvas>`, els contextos 2D i WebGL i els motors gràfics basats en canvas. Construeix els jocs amb HTML semàntic, CSS i manipulació del DOM.
2. Queda prohibit `document.write()`. Mostra el contingut mitjançant el DOM.
3. Queda prohibit declarar variables amb `var`.
4. Queden prohibits `==` i `!=`. Usa `===` i `!==`.
5. Queden prohibits els frameworks i les biblioteques de tercers als jocs, inclosos React, Vue, Angular i jQuery. Usa JavaScript natiu i APIs del navegador.
6. Queda prohibit assignar text a propietats amb el nom de l’etiqueta, com `element.h3` o `element.p`. Usa `element.textContent`.
7. Queda prohibit canviar classes amb `element.setAttribute("class", ...)`. Usa `element.classList`.
8. Queda prohibit `for...in` sobre arrays i `NodeList`. Reserva’l per a propietats d’objectes.
9. Queden prohibits els atributs d’esdeveniment en HTML, com `onclick`. Registra els esdeveniments amb `addEventListener()` des del JavaScript.

## JavaScript RA1–RA6

### RA1 i RA2 · Càrrega, variables i operadors

- Enllaça els scripts al final de `<body>` i inicialitza el joc dins `document.addEventListener("DOMContentLoaded", () => { ... })`.
- Usa `const` per defecte, incloses referències al DOM, estructures de dades, funcions i identificadors de temporitzadors. Reserva `let` per als valors que s’hagin de reassignar.
- Usa `??` per als valors per defecte quan l’entrada pugui ser `null` o `undefined`, preservant `0`, `false` i `""`. Usa el ternari per a assignacions condicionals simples.
- Fes conversions explícites amb `Number()`, `parseInt()`, `parseFloat()` o `String()` segons convingui. Valida les entrades numèriques amb `isNaN()` després de convertir-les.

### RA3 · Col·leccions, objectes del sistema i dades

- Recorre arrays i `NodeList` amb `for...of`, `.forEach()` o el `for` clàssic. En objectes, comprova les propietats pròpies amb `Object.prototype.hasOwnProperty.call(objecte, clau)` o `objecte.hasOwnProperty(clau)` quan usis `for...in`.
- Converteix el `NodeList` de `querySelectorAll()` amb `[...nodeList]` o `Array.from(nodeList)` abans d’aplicar `.map()`, `.filter()` o `.reduce()`.
- Neteja l’entrada textual amb `.trim()`, processa cadenes amb `.split()` i `.substring()` quan calgui i compon text amb literals de plantilla. Formata decimals amb `.toFixed()` o `.toPrecision()` i dates i hores de rècords amb `new Date()`, `.toLocaleDateString()` i `.toLocaleTimeString()` segons convingui.
- Separa nivells, preguntes, reptes i ítems en objectes estructurats o fitxers JSON carregats asíncronament amb `fetch()`.

### RA4 · Funcions, callbacks, BOM i temporitzadors

- Divideix la lògica en funcions petites, declaratives i amb una responsabilitat. Usa funcions imbricades quan facilitin encapsular lògica privada i evita afegir globals a `window`. Defineix paràmetres per defecte per als arguments opcionals.
- Usa funcions fletxa per a callbacks curts i quan calgui conservar el context lèxic de `this`.
- Usa `setTimeout(callback, ms)` per als retards i `setInterval(callback, ms)` per a comptes enrere o cicles periòdics. Desa cada identificador d’interval en una constant i crida `clearInterval(timerId)` en acabar, pausar o sortir del joc.
- Evita `alert()`, `confirm()` i `prompt()` a la interfície final. Fes servir modals HTML/CSS controlats amb el DOM i `dataset`.

### RA5 · Esdeveniments

- Registra els esdeveniments de ratolí, teclat i formularis amb `addEventListener()`. Aprofita `event.target`, `event.currentTarget`, `event.key` i `event.preventDefault()` segons el cas.
- Gestiona el context de `this` de manera explícita amb funcions fletxa, `.bind()` o el patró `handleEvent(event)`.

### RA6 · DOM, CSS i `dataset`

- Usa `getElementById()` per a elements únics i `querySelector()` o `querySelectorAll()` per a selectors CSS precisos. Crea nodes amb `createElement()`, insereix-los amb `appendChild()` o `insertBefore()` i elimina els obsolets amb `.remove()`. Obtingues les referències als contenidors pare fora dels bucles.
- Mantén el CSS en fulls separats organitzats en blocs comentats. Canvia els estats visuals amb `classList.add()`, `.remove()`, `.contains()` i `.toggle()`. Evita els estils en línia, amb l’excepció del posicionament dinàmic puntual amb `left`, `top` o `transform`.
- Vincula l’estat i les metadades de caselles, peces, nivells i botons de modal amb `data-*`. Llegeix i escriu aquests valors amb `dataset`, que converteix `kebab-case` a `camelCase` (`data-modal-id` → `dataset.modalId`). Usa selectors d’atribut com `[data-estat="completat"]`. Suprimeix les dades amb `delete element.dataset.propietat` o `element.removeAttribute("data-propietat")`. Queda prohibit assignar `null` o `undefined` per suprimir-les.

### Depuració i traçabilitat

- Durant el desenvolupament, agrupa traces per fase o joc amb `console.group()` o `console.groupCollapsed()` i tanca el grup amb `console.groupEnd()`. Inspecciona col·leccions amb `console.table()`, registra estats inesperats i errors de `fetch()` amb `console.warn()` o `console.error()` i mesura les operacions del DOM amb `console.time()` i `console.timeEnd()`.

## Arquitectura compartida i progrés

L’estructura següent és la convenció de l’entrega de DWEC definida a les especificacions locals. El directori `js/jocs/` allotja els mòduls individuals de l’entrega i `joc1.js` és el primer fitxer de l’arbre de referència.

```text
jocs-educatius/
├── AGENTS.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   └── jocs/
│       └── joc1.js
├── data/
│   └── jocs.json
├── assets/
└── docs/
    └── analisis-uml.md
```

- `index.html` acull la portada, el relat, el mapa i els rànquings. `css/styles.css` defineix l’estil comú. `js/main.js` gestiona progrés, desbloqueig i estadístiques. `data/jocs.json` conté configuració de nivells, preguntes, relat i rècords. `assets/` conté els recursos visuals.
- Mostra els quatre jocs des de la portada amb els estats bloquejat, actiu i superat. Usa un únic plànol amb quatre espais que s’omplen amb les peces recuperades. El joc 1 és l’entrada inicial. Per accedir a qualsevol joc posterior, cal haver superat tots els anteriors. Aplica el bloqueig també si s’hi entra des d’un enllaç directe.
- Desa a `localStorage` l’estat de cada joc, la puntuació, l’historial i el punt de represa. En una nova sessió, permet tornar directament al joc o escenari desat. Permet rejugar els jocs superats, mantenint el desbloqueig assolit i la millor marca.
- Mostra puntuació total, temps emprat, intents i percentatge d’encert. Inclou classificacions o rècords diaris, setmanals i per categoria, simulats o persistents, amb les dates gestionades amb `Date`.
- Reutilitza el contracte de progrés de l’equip en integrar el joc 2. La documentació de Memory i els jocs existents fan servir `cerda_progress` i `cerda_sessions`. El contracte de pas entre jocs inclou `juego1Superado` per a l’entrada al joc 2 i `juego2Superado` per obrir el joc 3 després de completar l’Eixample. La línia del temps ja comprova `juego2Superado` amb el valor de cadena `"true"`. Mantén les dades existents de la resta de jocs.

### Suport multilingüe

- Ofereix un selector visible per canviar entre català (`ca`), castellà (`es`) i anglès (`en`) en qualsevol moment. Aplica el canvi al moment sense recarregar la pàgina ni alterar l’estat de la partida.
- Mantén les traduccions en un diccionari local estructurat en JavaScript natiu. Queden prohibits els serveis de traducció externs, les biblioteques i l’API o el giny de Google Translate.
- Tradueix tota la interfície, inclosos el relat, els controls, les peces, les instruccions, les curiositats, els estats, les etiquetes accessibles i els missatges de validació o victòria. Actualitza el DOM amb `textContent`, `dataset` i `classList` segons correspongui i ajusta `lang` a la llengua seleccionada.

## Ildefons Cerdà ha perdut el plànol

Ildefons Cerdà ha perdut el plànol de l’Eixample i Barcelona ha quedat desordenada. El jugador recupera quatre peces del plànol superant reptes sobre el patrimoni, la geografia, la història, l’urbanisme i el transport de la ciutat. Cada objecte recuperat dona peu al repte següent. L’aventura acaba a la plaça d’Urquinaona, prop del centre educatiu, amb el plànol recompost.

| Ordre i responsable | Repte i aprenentatge | Rep i entrega |
|---|---|---|
| 1 · Óscar Ojuel González | **Memory de Barcelona.** Relacionar monuments amb noms, barris o dades històriques. | L’aventura comença als monuments de Barcelona. Al voltant del Palau de la Música es recupera un calc de la quadrícula, la peça de la trama de carrers. |
| 2 · Roger Durán | **Reconstruïm l’Eixample** («Reconstruye el Eixample»). Ordenar les illes de cases, les zones verdes i els equipaments a la taula de Cerdà. | Rep el calc. Recupera la peça de les illes i, en obrir una comporta secreta, uns manuscrits desordenats per al joc 3. |
| 3 · Raúl Hernández | **La línia del temps.** Ordenar els fets dels manuscrits a l’arxiu, des de la Barcelona romana fins avui. El relat inclou l’enderrocament de les muralles, el Pla Cerdà de 1859, l’Exposició Universal de 1888 i els Jocs Olímpics de 1992. | Rep els manuscrits. Entrega la llegenda i la data del plànol i la clau de l’estació de metro d’Universitat. |
| 4 · Alex Campano | **El laberint del metro.** Moure’s per les vies, identificar estacions i fer correspondències per recuperar els darrers fragments. | Rep la clau d’Universitat. Entrega l’última peça a Urquinaona i completa el plànol. |

- Mantén la mecànica pròpia de cada joc i una estètica comuna de paper envellit, tinta, plànols antics i instruments de dibuix del segle XIX. Comparteix paleta, tipografia, components i to amb la portada. Incorpora notes breus de Cerdà i curiositats del tipus «Sabies que…?» a les transicions.
- Propostes dels altres jocs. [Memory](propostes/oscar-memory-de-barcelona.md) té 4, 6 i 8 parelles, fins a tres pistes per nivell, 100 punts per parella, −10 per error, una a tres estrelles i un rellotge ascendent. [La línia del temps](propostes/raul-linea-del-tiempo.md) ordena 4, 6 i 8 cartes per arrossegament amb dificultat i pressió de temps creixents. [El laberint](propostes/alex-laberinto-de-metro.md) usa fletxes o botons i passa d’Universitat → Urquinaona per l’L1 a desviaments, correspondències i un repte amb temps. La proposta assigna 1000 punts inicials, −5 per moviment, −50 per consultar el plànol durant tres segons i +100 per fragment.
- El relat català és l’adaptació de la [proposta narrativa](propostes/propuesta-final-ildefons-cerda-perdio-el-plano.md) i la [proposta d’unió](propostes/propuesta-union-de-los-juegos.md). Cal confirmar l’existència d’un guió català definitiu i la integració completa dels elements narratius, les mètriques i la portada. Cal verificar les dades històriques i els recorreguts amb fonts oficials abans de publicar-los.

## Joc 2 · Reconstruïm l’Eixample

Responsable: Roger Durán. La [proposta individual](propostes/roger-reconstruye-el-eixample.md) i l’[esbós](propostes/img/reconstruye-el-eixample-esbozo.jpg) defineixen un puzle educatiu d’organització urbana. Treballa la geografia de Barcelona, la lògica, la geometria, les vies rectes, els xamfrans i la distribució d’habitatges, verd i serveis. Les regles del joc han de fer visibles els efectes de la llum natural, la ventilació, la mobilitat i la densitat.

- A partir del calc de Memory, el jugador ajuda Cerdà a completar la quadrícula amb peces residencials, zones verdes i equipaments públics des d’un inventari lateral. Pot seleccionar una peça i després la casella, o arrossegar-la amb l’API nativa de Drag & Drop. Usa `dragstart`, `dragover` i `drop` amb `addEventListener()` i aplica la mateixa validació als dos controls. La selecció amb botons permet interacció per teclat i tacte. La implementació definitiva de l’arrossegament tàctil està per confirmar.
- Comprova la posició, l’inventari i les restriccions aplicables. Dona resposta visual i textual quan una col·locació sigui correcta o incorrecta i indica on es pot col·locar la peça. El nivell se supera quan el 100 % de la quadrícula està ocupat amb una distribució que compleix les seves regles.
- Representa el tauler amb elements HTML semàntics i CSS Grid adaptable. Recrea una taula de dibuix amb paper vegetal o pergamí, plànol tècnic en blau o sèpia, anotacions a llapis, línies fines i cotes. Dibuixa els xamfrans amb CSS. Usa verd botànic per als parcs, sèpia o teula per als habitatges i blau tinta per als equipaments. Mostra ressaltat de caselles vàlides, una animació d’encaix i avisos de regla incomplerta.
- En acabar el tercer nivell, mostra la peça de les illes i els manuscrits de la comporta, desa la superació del joc i desbloqueja la línia del temps.

| Nivell intern | Quadrícula | Restriccions previstes |
|---|---|---|
| 1 · Introducció a l’urbanisme | 5 × 5 (25 caselles) | Combinació bàsica d’illes residencials i zones verdes. |
| 2 · Organització de serveis | 7 × 7 (49 caselles) | Ubicació d’equipaments públics i vies de pas, a més d’habitatges i verd. |
| 3 · Reconstrucció avançada | 9 × 9 (81 caselles) | Equilibri entre circulació, densitat residencial, il·luminació i zones verdes. |

- Mètriques pròpies: `moves_count` (moviments o col·locacions), `help_clicks` (consultes d’ajuda), `puzzles_solved` (nivells completats) i `level_time` (temps de resolució del nivell). Camps de sessió: `username`, `session_id`, `date_time` i `session_length`.
- La proposta lliurada inclou cronòmetre, comptador de moviments, ajuda visual inicial i menys ajuda al tercer nivell. Contrasta la versió final amb l’esbós, també en mòbil, i amb les regles implementades a continuació. [Proposta de l’equip](https://docs.google.com/document/d/1VVpt3hdU-nejz9qUoZ_5OPpZGP8Cnx2pw3bDuHq73k4/edit?authuser=1)

### Estat verificat de la branca local

A `feature/roger-eixample`, el joc és a `public/juegos/Eixample/`, al costat dels altres tres jocs. Hi ha sis mòduls: dades de nivells, lògica, interfície, control principal, traduccions i progrés. La portada de Laravel i els accessos directes als jocs comparteixen la comprovació del progrés a `public/js/progresion.js`.

| Nivell | Inventari i validació implementada |
|---|---|
| 1 · 5 × 5 | 21 habitatges i 4 parcs, un per quadrant, fora dels eixos. |
| 2 · 7 × 7 | 41 habitatges, 4 parcs i 4 equipaments. Un parc per quadrant i un equipament per braç dels eixos, amb habitatge al centre. |
| 3 · 9 × 9 | 69 habitatges, 8 parcs i 4 equipaments. Dos parcs per quadrant sense compartir costat. Un equipament per braç i cadascun amb un parc al costat. |

La selecció, col·locació i retirada amb botons, les comprovacions de distribució, els avisos en tres llengües, la represa i la millor puntuació per nivell ja són al codi. Cal superar Memory per entrar a l’Eixample. El nivell 3 desa `juego2Superado` i enllaça a la línia del temps, que al seu torn desbloqueja el metro. Queden pendents l’arrossegament, el cronòmetre i el registre de sessions del puzle.
