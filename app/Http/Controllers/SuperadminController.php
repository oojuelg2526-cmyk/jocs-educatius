<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// Gestión de administradores. Solo entra el superadmin (middleware "superadmin").
class SuperadminController extends Controller
{
    public function index(): View
    {
        return view('admin.administradores', [
            'administradores' => User::where('role', 'admin')->orderBy('username')->get(),
        ]);
    }

    public function crear(Request $request): RedirectResponse
    {
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        // Contraseña de 12 caracteres como mínimo, igual que la del superadmin
        $datos = $request->validateWithBag('crear', [
            'username' => ['required', 'string', 'alpha_dash', 'max:40', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'max:255'],
        ]);

        $admin = User::create($datos + ['role' => 'admin', 'is_active' => true]);

        AuditLog::apuntar($request->user(), 'create_admin', $admin, ['username' => $admin->username, 'email' => $admin->email]);

        return back()->with('estado', __('web.admin_creado', ['usuario' => $admin->username]));
    }

    public function actualizar(Request $request, User $usuario): RedirectResponse
    {
        $this->comprobarQueEsAdmin($usuario);

        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        $datos = $request->validateWithBag('admin_'.$usuario->id, [
            'username' => ['required', 'string', 'alpha_dash', 'max:40', Rule::unique('users', 'username')->ignore($usuario->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario->id)],
            'password' => ['nullable', 'string', 'min:12', 'max:255'],
        ]);

        $antes = $usuario->only(['username', 'email']);
        $cambios = ['username' => $datos['username'], 'email' => $datos['email']];
        // La contraseña solo cambia si se ha escrito una nueva (y nunca se apunta en el registro)
        $contrasenaCambiada = ! empty($datos['password']);
        if ($contrasenaCambiada) {
            $cambios['password'] = $datos['password'];
        }
        $usuario->update($cambios);

        AuditLog::apuntar($request->user(), 'update_admin', $usuario, [
            'antes' => $antes,
            'despues' => ['username' => $datos['username'], 'email' => $datos['email']],
            'contrasenya_canviada' => $contrasenaCambiada,
        ]);

        return back()->with('estado', __('web.usuario_actualizado', ['usuario' => $usuario->username]));
    }

    public function cambiarEstado(Request $request, User $usuario): RedirectResponse
    {
        if ($usuario->is($request->user())) {
            return back()->withErrors(['general' => __('web.no_a_ti_mismo')]);
        }
        $this->comprobarQueEsAdmin($usuario);

        $usuario->update(['is_active' => ! $usuario->is_active]);

        if ($usuario->is_active) {
            AuditLog::apuntar($request->user(), 'activate_admin', $usuario);
            $mensaje = __('web.usuario_activado', ['usuario' => $usuario->username]);
        } else {
            AuditLog::apuntar($request->user(), 'deactivate_admin', $usuario);
            $mensaje = __('web.usuario_desactivado', ['usuario' => $usuario->username]);
        }

        return back()->with('estado', $mensaje);
    }

    // Desde aquí solo se gestionan administradores (ni jugadores ni el propio superadmin).
    private function comprobarQueEsAdmin(User $usuario): void
    {
        if ($usuario->role !== 'admin') {
            abort(403, 'Des d’aquí només es poden gestionar administradors.');
        }
    }
}
