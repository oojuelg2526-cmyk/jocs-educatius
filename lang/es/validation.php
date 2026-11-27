<?php

// Solo las reglas que usa la web. Lo que falte sale del idioma de reserva.
return [
    'alpha_dash' => 'El campo :attribute solo puede tener letras, números, guiones y guiones bajos.',
    'email' => 'El campo :attribute debe ser un correo electrónico válido.',
    'exists' => 'El valor de :attribute no es válido.',
    'in' => 'El valor de :attribute no es válido.',
    'integer' => 'El campo :attribute debe ser un número entero.',
    'max' => [
        'numeric' => 'El campo :attribute no puede ser mayor que :max.',
        'string' => 'El campo :attribute no puede tener más de :max caracteres.',
    ],
    'min' => [
        'numeric' => 'El campo :attribute debe ser como mínimo :min.',
        'string' => 'El campo :attribute debe tener como mínimo :min caracteres.',
    ],
    'required' => 'El campo :attribute es obligatorio.',
    'string' => 'El campo :attribute debe ser texto.',
    'unique' => 'Este :attribute ya está en uso.',

    'attributes' => [
        'username' => 'usuario',
        'email' => 'correo',
        'password' => 'contraseña',
        'final_score' => 'puntos',
        'juego' => 'juego',
        'periodo' => 'periodo',
    ],
];
