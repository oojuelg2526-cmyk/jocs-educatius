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
        // El juego 3 envía "nivel_jugado" y "hints_used".
        // Aquí se copian a los nombres comunes: "level" y "help_clicks".
        if (! $request->has('level') && $request->has('nivel_jugado')) {
            $request->merge(['level' => $request->input('nivel_jugado')]);
        }
        if (! $request->has('help_clicks') && $request->has('hints_used')) {
            $request->merge(['help_clicks' => $request->input('hints_used')]);
        }

        // Se comprueba que los datos son correctos. Si no, Laravel responde con el error 422.
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

        // Si el juego no dice si ha superado el nivel, se supone que sí.
        $completado = true;
        if ($request->has('completed')) {
            $completado = $request->boolean('completed');
        }

        $juego = Game::where('slug', $datos['game'])->first();
        $nivel = $juego->levels()->where('level_no', $datos['level'])->first();

        // El jugador se crea la primera vez que envía datos.
        $usuario = User::firstOrCreate(
            ['username' => $datos['username']],
            ['email' => $datos['username'].'@jugador.local', 'password' => Str::random(40), 'role' => 'player']
        );
        // Los administradores no se pueden usar desde aquí.
        if ($usuario->role !== 'player') {
            return response()->json(['message' => 'Usuario no permitido.'], 403);
        }

        // La sesión se crea con el primer nivel y se reutiliza con los siguientes.
        $sesion = GameSession::firstOrCreate(
            ['session_id' => $datos['session_id']],
            ['user_id' => $usuario->id, 'game_id' => $juego->id, 'date_time' => $datos['date_time']]
        );
        // Una sesión es de un solo usuario y de un solo juego.
        if ($sesion->user_id !== $usuario->id || $sesion->game_id !== $juego->id) {
            return response()->json(['message' => 'Sesión de otro usuario.'], 403);
        }

        // Todo se guarda junto: o se guarda todo o no se guarda nada.
        DB::beginTransaction();

        // 1. El intento de este nivel, con sus métricas
        $sesion->attempts()->create([
            'level_id' => $nivel->id,
            'level_time' => $datos['level_time'],
            'errors_made' => $request->input('errors_made'),
            'moves_count' => $request->input('moves_count'),
            'help_clicks' => $request->input('help_clicks'),
            'score' => $datos['final_score'],
            'stars' => $request->input('stars', 0),
            'completed' => $completado,
        ]);

        // 2. La sesión se pone al día: nivel más alto y puntos de todos los niveles superados
        $nivelMasAlto = $sesion->level_reached;
        if ($datos['level'] > $nivelMasAlto) {
            $nivelMasAlto = $datos['level'];
        }
        $puntosTotales = $sesion->attempts()->where('completed', true)->sum('score');
        $sesion->update([
            'session_length' => $datos['session_length'],
            'ended_at' => now(),
            'level_reached' => $nivelMasAlto,
            'final_score' => $puntosTotales,
        ]);

        // 3. El progreso del jugador en este juego (solo si ha superado el nivel)
        if ($completado) {
            $this->actualizarProgreso($usuario, $juego, $datos['level'], $puntosTotales);
        }

        DB::commit();

        return response()->json(['ok' => true], 201);
    }

    // Progreso del jugador en el juego: último nivel superado y mejor puntuación.
    private function actualizarProgreso(User $usuario, Game $juego, int $nivel, int $puntos): void
    {
        $ultimoNivel = $nivel;
        $mejorPuntuacion = $puntos;

        $anterior = DB::table('user_game_progress')
            ->where('user_id', $usuario->id)
            ->where('game_id', $juego->id)
            ->first();
        if ($anterior !== null) {
            if ($anterior->last_level_completed > $ultimoNivel) {
                $ultimoNivel = $anterior->last_level_completed;
            }
            if ($anterior->best_score > $mejorPuntuacion) {
                $mejorPuntuacion = $anterior->best_score;
            }
        }

        $estado = 'unlocked';
        $terminadoEn = null;
        if ($ultimoNivel >= 3) {
            $estado = 'completed';
            $terminadoEn = now();
        }

        DB::table('user_game_progress')->updateOrInsert(
            ['user_id' => $usuario->id, 'game_id' => $juego->id],
            [
                'status' => $estado,
                'last_level_completed' => $ultimoNivel,
                'best_score' => $mejorPuntuacion,
                'completed_at' => $terminadoEn,
            ]
        );
    }
}
