<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Deja pasar solo al superadministrador (gestiona a los administradores). */
class SoloSuperadmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isSuperadmin()) {
            abort(403, 'No tens permís per accedir a aquesta pàgina.');
        }

        return $next($request);
    }
}
