<?php

// Los cuatro juegos de la aventura, en el orden en que se desbloquean.
// "carpeta" es la carpeta exacta dentro de public/juegos/ y "slug" el código de la tabla games.
// Los textos van en catalán; public/js/idioma.js los traduce en el navegador.
return [
    [
        'numero' => 1,
        'slug' => 'memory',
        'carpeta' => 'memory',
        'nombre' => 'Memory de Barcelona',
        'descripcion' => 'Uneix cada monument amb el seu barri i la seva dada històrica.',
        'autor' => 'Óscar Ojuel',
        'icono' => '🏛️',
    ],
    [
        'numero' => 2,
        'slug' => 'eixample',
        'carpeta' => 'Eixample',
        'nombre' => 'Reconstrueix l’Eixample',
        'descripcion' => 'Col·loca les illes seguint les regles de Cerdà.',
        'autor' => 'Roger Durán',
        'icono' => '🧱',
    ],
    [
        'numero' => 3,
        'slug' => 'timeline',
        'carpeta' => 'lineaDelTiempo',
        'nombre' => 'Línia del temps',
        'descripcion' => 'Ordena les fites de la història de la ciutat.',
        'autor' => 'Raúl Hernández',
        'icono' => '⏳',
    ],
    [
        'numero' => 4,
        'slug' => 'metro',
        'carpeta' => 'metro',
        'nombre' => 'Laberint del metro',
        'descripcion' => 'Recorre el metro fins a Urquinaona i ajunta el plànol.',
        'autor' => 'Alex Campano',
        'icono' => '🚇',
    ],
];
