<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\View\View;

// Sirve el juego 4 (que vive en juegos/metro/) con el usuario y el token CSRF.
class MetroController extends Controller
{
    public function page(Request $request): View
    {
        // Se reutiliza el HTML del juego: solo se coge lo que hay dentro de <body>.
        preg_match('/<body>(.*)<\/body>/s', File::get(base_path('juegos/metro/index.html')), $m);
        $user = $request->user();

        return view('juegos.metro', [
            'page' => $m[1],
            'cerda' => $user ? ['user' => ['username' => $user->username, 'language' => $user->language]] : null,
        ]);
    }

    // Archivos del juego (js y css). La ruta solo admite nombres sencillos.
    public function asset(string $folder, string $file)
    {
        $path = base_path("juegos/metro/$folder/$file");
        abort_unless(is_file($path), 404);

        $type = $folder === 'js' ? 'text/javascript' : 'text/css';
        return response()->file($path, ['Content-Type' => $type]);
    }
}
