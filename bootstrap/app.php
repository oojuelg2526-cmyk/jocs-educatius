<?php

use App\Http\Middleware\EstablecerIdioma;
use App\Http\Middleware\SoloAdmin;
use App\Http\Middleware\SoloSuperadmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => SoloAdmin::class,
            'superadmin' => SoloSuperadmin::class,
        ]);
        // La cookie del idioma la escribe JavaScript, así que no va cifrada
        $middleware->encryptCookies(except: ['cerda_lang']);
        $middleware->web(append: [EstablecerIdioma::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
