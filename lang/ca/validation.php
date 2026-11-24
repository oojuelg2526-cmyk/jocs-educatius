<?php

// Solo las reglas que usa la web. Lo que falte sale del idioma de reserva.
return [
    'alpha_dash' => 'El camp :attribute només pot tenir lletres, números, guions i guions baixos.',
    'email' => 'El camp :attribute ha de ser un correu electrònic vàlid.',
    'exists' => 'El valor de :attribute no és vàlid.',
    'in' => 'El valor de :attribute no és vàlid.',
    'integer' => 'El camp :attribute ha de ser un número enter.',
    'max' => [
        'numeric' => 'El camp :attribute no pot ser més gran que :max.',
        'string' => 'El camp :attribute no pot tenir més de :max caràcters.',
    ],
    'min' => [
        'numeric' => 'El camp :attribute ha de ser com a mínim :min.',
        'string' => 'El camp :attribute ha de tenir com a mínim :min caràcters.',
    ],
    'required' => 'El camp :attribute és obligatori.',
    'string' => 'El camp :attribute ha de ser text.',
    'unique' => 'Aquest :attribute ja està en ús.',

    'attributes' => [
        'username' => 'usuari',
        'email' => 'correu',
        'password' => 'contrasenya',
        'final_score' => 'punts',
        'juego' => 'joc',
        'periodo' => 'període',
    ],
];
