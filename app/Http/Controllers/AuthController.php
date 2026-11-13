<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

// Registro, entrada y salida de jugadores (sesión de Laravel).
class AuthController extends Controller
{
    public function showLogin(): View
    {
        return view('auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // is_active: una cuenta desactivada no puede entrar
        if (Auth::attempt([...$data, 'is_active' => true], $request->boolean('remember'))) {
            $request->session()->regenerate(); // evita la fijación de sesión
            $request->user()->update(['last_login_at' => now()]);
            return redirect()->intended('/juegos/metro');
        }

        return back()->withErrors(['username' => __('auth.failed')])->onlyInput('username');
    }

    public function showRegister(): View
    {
        return view('auth.register');
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'username' => 'required|string|min:3|max:50|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'language' => 'required|in:ca,es,en',
        ]);

        // El rol nunca viene del formulario: quien se registra es siempre jugador.
        $user = User::create([...$data, 'role' => 'player']);

        // Juego 1 abierto y los demás bloqueados.
        DB::transaction(function () use ($user) {
            foreach (Game::orderBy('order_no')->get() as $game) {
                DB::table('user_game_progress')->insert([
                    'user_id' => $user->id,
                    'game_id' => $game->id,
                    'status' => $game->order_no === 1 ? 'unlocked' : 'locked',
                ]);
            }
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/juegos/metro');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
