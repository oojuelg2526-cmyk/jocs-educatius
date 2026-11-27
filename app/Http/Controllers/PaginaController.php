<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

// Páginas públicas de la web: inicio, juegos, récords y equipo.
class PaginaController extends Controller
{
    // Cada juego tiene 3 niveles (los mismos que acepta MetricasController).
    private const NIVELES_POR_JUEGO = 3;

    public function inicio(): View
    {
        // La portada no consulta la base de datos: así se ve aunque la BD falle
        $totalJuegos = count(config('juegos'));

        return view('paginas.inicio', [
            'totalJuegos' => $totalJuegos,
            'totalNiveles' => $totalJuegos * self::NIVELES_POR_JUEGO,
        ]);
    }

    public function juegos(): View
    {
        return view('paginas.juegos', ['juegos' => config('juegos')]);
    }

    public function records(): View
    {
        return view('paginas.records', ['juegos' => config('juegos')]);
    }

    public function equipo(): View
    {
        return view('paginas.equipo', ['juegos' => config('juegos')]);
    }
}
