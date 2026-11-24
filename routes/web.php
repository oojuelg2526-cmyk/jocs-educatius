<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegistroController;
use App\Http\Controllers\PaginaController;
use App\Http\Controllers\SuperadminController;
use Illuminate\Support\Facades\Route;

// Páginas públicas
Route::get('/', [PaginaController::class, 'inicio'])->name('inicio');
// La lista de juegos va en /jocs porque /juegos ya es la carpeta public/juegos/ (el servidor la serviría como carpeta)
Route::get('/jocs', [PaginaController::class, 'juegos'])->name('juegos');
Route::get('/records', [PaginaController::class, 'records'])->name('records');
Route::get('/equipo', [PaginaController::class, 'equipo'])->name('equipo');

// Entrar y crear cuenta (solo sin sesión)
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'formulario'])->name('login');
    // 5 intentos por minuto y por IP contra la fuerza bruta
    Route::post('/login', [LoginController::class, 'entrar'])->middleware('throttle:5,1');

    Route::get('/registro', [RegistroController::class, 'formulario'])->name('registro');
    // 5 cuentas por minuto y por IP como máximo, contra los registros automáticos
    Route::post('/registro', [RegistroController::class, 'crear'])->middleware('throttle:5,1');
});

Route::post('/logout', [LoginController::class, 'salir'])->middleware('auth')->name('logout');

// Administración: admin y superadmin gestionan jugadores y puntuaciones
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('admin');
    Route::put('/usuarios/{usuario}', [AdminController::class, 'actualizarUsuario'])->name('admin.usuarios.actualizar');
    Route::patch('/usuarios/{usuario}/estado', [AdminController::class, 'cambiarEstado'])->name('admin.usuarios.estado');
    Route::put('/puntuaciones/{partida}', [AdminController::class, 'actualizarPuntuacion'])->name('admin.puntuaciones.actualizar');
    Route::delete('/puntuaciones/{partida}', [AdminController::class, 'borrarPuntuacion'])->name('admin.puntuaciones.borrar');

    // Solo el superadmin gestiona a los administradores
    Route::middleware('superadmin')->group(function () {
        Route::get('/administradores', [SuperadminController::class, 'index'])->name('admin.administradores');
        Route::post('/administradores', [SuperadminController::class, 'crear'])->name('admin.administradores.crear');
        Route::put('/administradores/{usuario}', [SuperadminController::class, 'actualizar'])->name('admin.administradores.actualizar');
        Route::patch('/administradores/{usuario}/estado', [SuperadminController::class, 'cambiarEstado'])->name('admin.administradores.estado');
    });
});
