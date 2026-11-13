<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\Level;
use App\Models\LevelAttempt;
use App\Models\UserGameProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

// PUT /api/sessions/{session}: guarda una partida con sus intentos (docs/api-contrato.md).
class SessionController extends Controller
{
    public function update(Request $request, string $session): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'game' => 'required|integer|exists:games,id',
            'date_time' => 'required|date',
            'session_length' => 'required|integer|min:0|max:86400',
            'level_reached' => 'required|integer|between:1,3',
            'final_score' => 'required|integer|min:0|max:1000000',
            'attempts' => 'present|array|max:100',
            'attempts.*.level' => 'required|integer|between:1,3',
            'attempts.*.level_time' => 'required|integer|min:0|max:86400',
            'attempts.*.moves_count' => 'required|integer|min:0|max:100000',
            'attempts.*.help_clicks' => 'required|integer|min:0|max:100000',
            'attempts.*.score' => 'required|integer|min:0|max:1000000',
            'attempts.*.stars' => 'required|integer|between:0,3',
            'attempts.*.completed' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            $fields = collect($validator->errors()->keys())->mapWithKeys(fn ($k) => [$k => 'invalid']);
            return response()->json(['error' => 'validation', 'fields' => $fields], 422);
        }
        $data = $validator->validated();
        $gameId = $data['game'];

        // En modo integrado, un juego solo se puede jugar si está desbloqueado (el 1 siempre).
        $progress = UserGameProgress::where('user_id', $user->id)->where('game_id', $gameId)->first();
        if (config('games.enforce_order') && $gameId != 1 && (!$progress || $progress->status === 'locked')) {
            return response()->json(['error' => 'game_locked'], 403);
        }

        // Si el session_id ya existe, tiene que ser de este usuario.
        $existing = GameSession::find($session);
        if ($existing && $existing->user_id !== $user->id) {
            return response()->json(['error' => 'forbidden'], 403);
        }

        DB::transaction(function () use ($user, $session, $data, $gameId) {
            GameSession::updateOrCreate(['session_id' => $session], [
                'user_id' => $user->id,
                'game_id' => $gameId,
                'date_time' => $data['date_time'],
                'ended_at' => now(),
                'session_length' => $data['session_length'],
                'level_reached' => $data['level_reached'],
                'final_score' => $data['final_score'],
            ]);

            // Se sustituyen todos los intentos de la sesión por los que llegan.
            LevelAttempt::where('session_id', $session)->delete();
            foreach ($data['attempts'] as $a) {
                $level = Level::where('game_id', $gameId)->where('level_no', $a['level'])->first();
                LevelAttempt::create([
                    'session_id' => $session,
                    'level_id' => $level->id,
                    'level_time' => $a['level_time'],
                    'moves_count' => $a['moves_count'],
                    'help_clicks' => $a['help_clicks'],
                    'score' => $a['score'],
                    'stars' => $a['stars'],
                    'completed' => $a['completed'],
                ]);
            }

            $this->recalculateProgress($user->id, $gameId);
        });

        $progress = UserGameProgress::where('user_id', $user->id)->where('game_id', $gameId)->first();

        return response()->json([
            'progress' => [
                'status' => $progress->status,
                'last_level_completed' => $progress->last_level_completed,
                'best_score' => $progress->best_score,
            ],
        ], $existing ? 200 : 201);
    }

    // El progreso se calcula aquí a partir de los intentos; no se fía de lo que diga el navegador.
    private function recalculateProgress(int $userId, int $gameId): void
    {
        $best = LevelAttempt::query()
            ->join('game_sessions', 'game_sessions.session_id', '=', 'level_attempts.session_id')
            ->join('levels', 'levels.id', '=', 'level_attempts.level_id')
            ->where('game_sessions.user_id', $userId)
            ->where('game_sessions.game_id', $gameId)
            ->where('level_attempts.completed', true)
            ->groupBy('levels.level_no')
            ->selectRaw('levels.level_no as level_no, MAX(level_attempts.score) as best')
            ->get();

        $last = (int) $best->max('level_no');
        $isCompleted = $last >= 3;

        $progress = UserGameProgress::firstOrNew(['user_id' => $userId, 'game_id' => $gameId]);
        $wasCompleted = $progress->status === 'completed';
        // updateOrInsert (y no updateOrCreate) porque la tabla tiene clave doble.
        UserGameProgress::updateOrInsert(['user_id' => $userId, 'game_id' => $gameId], [
            'status' => ($isCompleted || $wasCompleted) ? 'completed' : 'unlocked',
            'last_level_completed' => max($last, (int) $progress->last_level_completed),
            'best_score' => max((int) $best->sum('best'), (int) $progress->best_score),
            'completed_at' => $isCompleted && !$wasCompleted ? now() : $progress->completed_at,
        ]);

        // Al superar un juego se abre el siguiente.
        if ($isCompleted) {
            $next = UserGameProgress::where('user_id', $userId)->where('game_id', $gameId + 1)->first();
            if ($next && $next->status === 'locked') {
                UserGameProgress::where('user_id', $userId)->where('game_id', $gameId + 1)->update(['status' => 'unlocked']);
            }
        }
    }
}
