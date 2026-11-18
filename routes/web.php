<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'formulario'])->name('login');
    // 5 intentos por minuto y por IP contra la fuerza bruta
    Route::post('/login', [LoginController::class, 'entrar'])->middleware('throttle:5,1');
});

Route::post('/logout', [LoginController::class, 'salir'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin');
});
