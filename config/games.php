<?php

return [
    // false: cada juego funciona solo, sin exigir haber superado el anterior.
    // true: modo integrado en la landing, los juegos se abren en orden.
    'enforce_order' => env('GAMES_ENFORCE_ORDER', false),
];
