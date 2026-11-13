<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

// Elige el idioma: el del jugador si ha entrado; si no, ?lang=; si no, catalán.
class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $lang = $request->user()?->language ?? $request->query('lang', 'ca');
        app()->setLocale(in_array($lang, ['ca', 'es', 'en'], true) ? $lang : 'ca');

        return $next($request);
    }
}
