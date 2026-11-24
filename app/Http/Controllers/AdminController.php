<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Contracts\View\View;

class AdminController extends Controller
{
    public function index(): View
    {
        return view('admin.index', [
            'usuarios' => User::count(),
            'partidas' => GameSession::count(),
            'juegos' => Game::orderBy('id')->get(),
        ]);
    }
}
