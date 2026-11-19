<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function formulario(): View
    {
        return view('auth.login');
    }

    public function entrar(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // is_active => false deja fuera a un usuario desactivado sin borrarlo
        $credenciales = $datos + ['is_active' => true];

        if (! Auth::attempt($credenciales, $request->boolean('recordar'))) {
            return back()
                ->withInput($request->only('username'))
                ->withErrors(['username' => 'Usuari o contrasenya incorrectes.']);
        }

        $request->session()->regenerate(); // evita la fijación de sesión

        $usuario = Auth::user();
        $usuario->forceFill(['last_login_at' => now()])->save();

        return redirect()->intended($usuario->isAdmin() ? route('admin') : '/');
    }

    public function salir(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
