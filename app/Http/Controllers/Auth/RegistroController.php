<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Alta de jugadores desde la web. Las cuentas nuevas siempre son de jugador.
class RegistroController extends Controller
{
    public function formulario(): View
    {
        return view('auth.registro');
    }

    public function crear(Request $request): RedirectResponse
    {
        // El correo se guarda en minúsculas para que no se repita con otras mayúsculas
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);

        // Mismas reglas de usuario que usan los juegos al enviar métricas (alpha_dash, máximo 40)
        $datos = $request->validate([
            'username' => ['required', 'string', 'alpha_dash', 'max:40', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ]);

        $usuario = User::create([
            'username' => $datos['username'],
            'email' => $datos['email'],
            'password' => $datos['password'], // el modelo la guarda con hash
            'role' => 'player',
            'language' => app()->getLocale(),
        ]);

        Auth::login($usuario);
        $request->session()->regenerate(); // evita la fijación de sesión
        $usuario->forceFill(['last_login_at' => now()])->save();

        return redirect()->route('juegos')->with('estado', __('web.registro_ok', ['usuario' => $usuario->username]));
    }
}
