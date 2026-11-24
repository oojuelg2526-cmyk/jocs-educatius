<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Deja pasar solo a usuarios activos con rol admin o superadmin. */
class SoloAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        // Un admin desactivado con la sesión abierta también se queda fuera
        if (! $usuario?->isAdmin() || ! $usuario->is_active) {
            abort(403, 'No tens permís per accedir a aquesta pàgina.');
        }

        return $next($request);
    }
}
