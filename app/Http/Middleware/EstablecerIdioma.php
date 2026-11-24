<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pone el idioma de Laravel (mensajes de validación y avisos) según la cookie "cerda_lang",
 * que guarda public/js/idioma.js. Sin cookie, o con un valor raro, catalán.
 */
class EstablecerIdioma
{
    private const IDIOMAS = ['ca', 'es', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        $idioma = $request->cookie('cerda_lang');
        if (! in_array($idioma, self::IDIOMAS, true)) {
            $idioma = 'ca';
        }
        App::setLocale($idioma);

        return $next($request);
    }
}
