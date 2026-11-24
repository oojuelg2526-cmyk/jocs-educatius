<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Deja pasar solo a usuarios con rol admin o superadmin. */
class SoloAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'No tens permís per accedir a aquesta pàgina.');
        }

        return $next($request);
    }
}
