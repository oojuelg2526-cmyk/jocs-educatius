<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Récords públicos: las 10 mejores puntuaciones de un juego hoy o esta semana.
class RecordsController extends Controller
{
    private const MAXIMO = 10;

    public function index(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'juego' => ['required', 'string', 'exists:games,slug'],
            'periodo' => ['nullable', 'in:hoy,semana'],
        ]);

        $periodo = $datos['periodo'] ?? 'hoy';
        $desde = now()->startOfDay();
        if ($periodo === 'semana') {
            $desde = now()->startOfWeek(); // desde el lunes
        }

        $juego = Game::where('slug', $datos['juego'])->first();

        // Partidas de jugadores activos con puntos, de más a menos puntos.
        $partidas = GameSession::with('user')
            ->where('game_id', $juego->id)
            ->where('date_time', '>=', $desde)
            ->where('final_score', '>', 0)
            ->whereHas('user', function ($consulta) {
                $consulta->where('role', 'player')->where('is_active', true);
            })
            ->orderByDesc('final_score')
            ->orderBy('date_time') // a igualdad de puntos, gana quien llegó antes
            ->orderBy('session_id')
            ->lazy(100); // se leen de 100 en 100 hasta tener 10 jugadores distintos

        // Cada jugador sale una sola vez, con su mejor partida.
        $records = [];
        $jugadoresVistos = [];
        foreach ($partidas as $partida) {
            $idJugador = (int) $partida->user_id;
            if (in_array($idJugador, $jugadoresVistos, true)) {
                continue;
            }
            $jugadoresVistos[] = $idJugador;

            $records[] = [
                'posicion' => count($records) + 1,
                'jugador' => $partida->user->username,
                'nivel' => $partida->level_reached,
                'puntos' => $partida->final_score,
            ];

            if (count($records) === self::MAXIMO) {
                break;
            }
        }

        return response()->json([
            'juego' => $juego->slug,
            'periodo' => $periodo,
            'records' => $records,
        ]);
    }
}
