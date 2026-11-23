<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Recibe el resultado de un nivel de cualquier juego y lo guarda en la base de datos.
class MetricasController extends Controller
{
    public function guardar(Request $request): JsonResponse
    {
        // El juego 3 envía "nivel_jugado" y "hints_used"; aquí se aceptan con los nombres comunes.
        $request->mergeIfMissing([
            'level' => $request->input('nivel_jugado'),
            'help_clicks' => $request->input('hints_used'),
        ]);

        $datos = $request->validate([
            'username' => ['required', 'alpha_dash', 'max:40'],
            'session_id' => ['required', 'uuid'],
            'game' => ['required', 'exists:games,slug'],
            'level' => ['required', 'integer', 'between:1,3'],
            'date_time' => ['required', 'date'],
            'session_length' => ['required', 'integer', 'min:0'],
            'level_time' => ['required', 'integer', 'min:0'],
            'final_score' => ['required', 'integer', 'min:0'],
            'errors_made' => ['nullable', 'integer', 'min:0'],
            'moves_count' => ['nullable', 'integer', 'min:0'],
            'help_clicks' => ['nullable', 'integer', 'min:0'],
            'stars' => ['nullable', 'integer', 'between:0,3'],
            'completed' => ['nullable', 'boolean'],
        ]);
        $completado = $request->boolean('completed', true);

        $juego = Game::where('slug', $datos['game'])->first();
        $nivel = $juego->levels()->where('level_no', $datos['level'])->first();

        // El jugador se crea la primera vez que envía datos. Los administradores no se pueden usar.
        $usuario = User::firstOrCreate(
            ['username' => $datos['username']],
            ['email' => $datos['username'].'@jugador.local', 'password' => Str::random(40), 'role' => 'player']
        );
        if ($usuario->role !== 'player') {
            return response()->json(['message' => 'Usuario no permitido.'], 403);
        }

        // Una sesión es de un solo usuario y de un solo juego.
        $sesion = GameSession::firstOrCreate(
            ['session_id' => $datos['session_id']],
            ['user_id' => $usuario->id, 'game_id' => $juego->id, 'date_time' => $datos['date_time']]
        );
        if ($sesion->user_id !== $usuario->id || $sesion->game_id !== $juego->id) {
            return response()->json(['message' => 'Sesión de otro usuario.'], 403);
        }

        DB::transaction(function () use ($sesion, $nivel, $datos, $completado, $usuario, $juego, $request) {
            $sesion->attempts()->create([
                'level_id' => $nivel->id,
                'level_time' => $datos['level_time'],
                'errors_made' => $datos['errors_made'] ?? null,
                'moves_count' => $datos['moves_count'] ?? null,
                'help_clicks' => $datos['help_clicks'] ?? null,
                'score' => $datos['final_score'],
                'stars' => $datos['stars'] ?? 0,
                'completed' => $completado,
            ]);

            // Los datos de la sesión se ponen al día con todos sus intentos.
            $superados = $sesion->attempts()->where('completed', true);
            $sesion->update([
                'session_length' => $datos['session_length'],
                'ended_at' => now(),
                'level_reached' => max($sesion->level_reached, $datos['level']),
                'final_score' => $superados->sum('score'),
            ]);

            if ($completado) {
                $this->actualizarProgreso($usuario, $juego, $datos['level'], $sesion->final_score);
            }
        });

        return response()->json(['ok' => true], 201);
    }

    // Progreso del jugador en el juego: último nivel superado y mejor puntuación.
    private function actualizarProgreso(User $usuario, Game $juego, int $nivel, int $puntos): void
    {
        $actual = DB::table('user_game_progress')
            ->where('user_id', $usuario->id)->where('game_id', $juego->id)->first();

        $ultimo = max($actual->last_level_completed ?? 0, $nivel);
        DB::table('user_game_progress')->updateOrInsert(
            ['user_id' => $usuario->id, 'game_id' => $juego->id],
            [
                'status' => $ultimo >= 3 ? 'completed' : 'unlocked',
                'last_level_completed' => $ultimo,
                'best_score' => max($actual->best_score ?? 0, $puntos),
                'completed_at' => $ultimo >= 3 ? now() : null,
            ]
        );
    }
}
