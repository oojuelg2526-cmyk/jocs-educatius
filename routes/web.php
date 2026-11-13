<?php

use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MetroController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/juegos/metro');

// Entrar, registrarse y salir
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/register', [AuthController::class, 'showRegister']);
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');

// Juego 4: se puede abrir sin cuenta (modo local); con cuenta guarda en el servidor
Route::get('/juegos/metro', [MetroController::class, 'page']);
Route::get('/juegos/metro/{folder}/{file}', [MetroController::class, 'asset'])
    ->where(['folder' => 'js|css', 'file' => '[A-Za-z0-9_-]+\.(js|css)']);

// API del contrato (docs/api-contrato.md). Van en web.php para tener sesión y CSRF.
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/progress', [ProgressController::class, 'show']);
    Route::put('/sessions/{session}', [SessionController::class, 'update'])->whereUuid('session');
});
