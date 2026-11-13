<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// GET /api/progress: por dónde va el jugador en cada juego (formato de docs/api-contrato.md).
class ProgressController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $games = [];
        foreach ($user->progress as $row) {
            $games[$row->game_id] = [
                'status' => $row->status,
                'last_level_completed' => $row->last_level_completed,
                'best_score' => $row->best_score,
            ];
        }

        return response()->json([
            'user' => ['username' => $user->username, 'language' => $user->language],
            'games' => (object) $games, // objeto aunque esté vacío
        ]);
    }
}
