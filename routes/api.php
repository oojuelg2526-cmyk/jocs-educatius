<?php

use App\Http\Controllers\MetricasController;
use Illuminate\Support\Facades\Route;

// Los juegos envían aquí lo que pasa en cada nivel (60 envíos por minuto y por IP como máximo).
Route::post('/guardar-metricas', [MetricasController::class, 'guardar'])->middleware('throttle:60,1');
