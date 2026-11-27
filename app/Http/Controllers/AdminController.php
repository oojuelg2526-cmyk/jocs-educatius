<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\GameSession;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

// Administración de jugadores y puntuaciones (admin y superadmin).
// Desde aquí solo se tocan cuentas de jugador: los administradores se gestionan en SuperadminController.
class AdminController extends Controller
{
    private const POR_PAGINA = 15;

    public function index(Request $request): View
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $usuarios = User::where('role', 'player')
            ->when($buscar !== '', function ($consulta) use ($buscar) {
                $consulta->where(function ($donde) use ($buscar) {
                    $donde->where('username', 'like', "%{$buscar}%")
                        ->orWhere('email', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('username')
            ->paginate(self::POR_PAGINA, ['*'], 'pagina_usuarios')
            ->withQueryString();

        $partidas = GameSession::with(['user', 'game'])
            ->whereHas('user', function ($consulta) use ($buscar) {
                $consulta->where('role', 'player');
                if ($buscar !== '') {
                    $consulta->where('username', 'like', "%{$buscar}%");
                }
            })
            ->orderByDesc('final_score')
            ->orderByDesc('date_time')
            ->paginate(self::POR_PAGINA, ['*'], 'pagina_puntos')
            ->withQueryString();

        return view('admin.index', [
            'buscar' => $buscar,
            'usuarios' => $usuarios,
            'partidas' => $partidas,
            'nombresJuegos' => collect(config('juegos'))->pluck('nombre', 'slug'),
        ]);
    }

    public function actualizarUsuario(Request $request, User $usuario): RedirectResponse
    {
        $this->comprobarQueEsJugador($usuario);

        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
        $datos = $request->validateWithBag('usuario_'.$usuario->id, [
            'username' => ['required', 'string', 'alpha_dash', 'max:40', Rule::unique('users', 'username')->ignore($usuario->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario->id)],
        ]);

        $antes = $usuario->only(['username', 'email']);
        $usuario->update($datos);

        AuditLog::apuntar($request->user(), 'update_user', $usuario, ['antes' => $antes, 'despues' => $datos]);

        return back()->with('estado', __('web.usuario_actualizado', ['usuario' => $usuario->username]));
    }

    public function cambiarEstado(Request $request, User $usuario): RedirectResponse
    {
        if ($usuario->is($request->user())) {
            return back()->withErrors(['general' => __('web.no_a_ti_mismo')]);
        }
        $this->comprobarQueEsJugador($usuario);

        $usuario->update(['is_active' => ! $usuario->is_active]);

        if ($usuario->is_active) {
            AuditLog::apuntar($request->user(), 'activate_user', $usuario);
            $mensaje = __('web.usuario_activado', ['usuario' => $usuario->username]);
        } else {
            AuditLog::apuntar($request->user(), 'deactivate_user', $usuario);
            $mensaje = __('web.usuario_desactivado', ['usuario' => $usuario->username]);
        }

        return back()->with('estado', $mensaje);
    }

    public function actualizarPuntuacion(Request $request, GameSession $partida): RedirectResponse
    {
        $this->comprobarQueEsJugador($partida->user);

        $datos = $request->validateWithBag('partida_'.$partida->session_id, [
            'final_score' => ['required', 'integer', 'min:0', 'max:1000000'],
        ]);

        $antes = $partida->final_score;
        $partida->update(['final_score' => $datos['final_score']]);
        $this->recalcularMejorPuntuacion($partida->user_id, $partida->game_id);

        AuditLog::apuntar($request->user(), 'update_score', $partida->user, [
            'partida' => $partida->session_id,
            'joc' => $partida->game->slug,
            'antes' => $antes,
            'despues' => (int) $datos['final_score'],
        ]);

        return back()->with('estado', __('web.puntuacion_actualizada', ['usuario' => $partida->user->username]));
    }

    public function borrarPuntuacion(Request $request, GameSession $partida): RedirectResponse
    {
        $jugador = $partida->user;
        $this->comprobarQueEsJugador($jugador);

        $detalles = [
            'partida' => $partida->session_id,
            'joc' => $partida->game->slug,
            'punts' => $partida->final_score,
        ];

        // La partida se borra con sus intentos y sus métricas: o todo o nada
        DB::transaction(function () use ($partida) {
            DB::table('session_metrics')->where('session_id', $partida->session_id)->delete();
            $partida->attempts()->delete();
            $partida->delete();
            $this->recalcularMejorPuntuacion($partida->user_id, $partida->game_id);
        });

        AuditLog::apuntar($request->user(), 'delete_score', $jugador, $detalles);

        return back()->with('estado', __('web.puntuacion_borrada', ['usuario' => $jugador->username]));
    }

    // Un admin no puede tocar a otros admins ni al superadmin desde aquí.
    private function comprobarQueEsJugador(User $usuario): void
    {
        if ($usuario->role !== 'player') {
            abort(403, 'Des d’aquí només es poden gestionar jugadors.');
        }
    }

    // La mejor puntuación guardada en el progreso tiene que seguir cuadrando con las partidas.
    private function recalcularMejorPuntuacion(int $idUsuario, int $idJuego): void
    {
        $mejor = GameSession::where('user_id', $idUsuario)->where('game_id', $idJuego)->max('final_score') ?? 0;

        DB::table('user_game_progress')
            ->where('user_id', $idUsuario)
            ->where('game_id', $idJuego)
            ->update(['best_score' => $mejor]);
    }
}
