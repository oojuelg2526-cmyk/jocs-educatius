<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Game;
use App\Models\GameSession;
use App\Models\LevelAttempt;
use App\Models\User;
use Database\Seeders\GameSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function usuario(string $rol = 'player', array $datos = []): User
    {
        return User::factory()->create(['role' => $rol] + $datos);
    }

    // Una partida de Memory con un intento y el progreso del jugador
    private function partida(User $jugador, int $puntos): GameSession
    {
        $this->seed(GameSeeder::class);
        $memory = Game::where('slug', 'memory')->first();

        $partida = GameSession::create([
            'session_id' => (string) Str::uuid(),
            'user_id' => $jugador->id,
            'game_id' => $memory->id,
            'date_time' => now(),
            'level_reached' => 1,
            'final_score' => $puntos,
        ]);
        $partida->attempts()->create([
            'level_id' => $memory->levels()->first()->id,
            'level_time' => 30,
            'score' => $puntos,
            'completed' => true,
        ]);
        DB::table('user_game_progress')->insert([
            'user_id' => $jugador->id,
            'game_id' => $memory->id,
            'status' => 'unlocked',
            'last_level_completed' => 1,
            'best_score' => $puntos,
        ]);

        return $partida;
    }

    public function test_sin_sesion_se_va_al_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/admin/administradores')->assertRedirect('/login');
    }

    public function test_un_jugador_no_entra(): void
    {
        $this->actingAs($this->usuario())->get('/admin')->assertForbidden();
    }

    public function test_un_admin_desactivado_no_entra_aunque_tenga_sesion(): void
    {
        $this->actingAs($this->usuario('admin', ['is_active' => false]))->get('/admin')->assertForbidden();
    }

    public function test_el_admin_ve_jugadores_y_puntuaciones_pero_no_admins(): void
    {
        $jugador = $this->usuario('player', ['username' => 'mariab']);
        $this->usuario('admin', ['username' => 'otro_admin']);
        $this->partida($jugador, 2310);

        $this->actingAs($this->usuario('admin'))->get('/admin')
            ->assertOk()
            ->assertSee('mariab')
            ->assertSee('2.310')
            ->assertDontSee('otro_admin');
    }

    public function test_el_buscador_filtra_los_jugadores(): void
    {
        $this->usuario('player', ['username' => 'jordip']);
        $this->usuario('player', ['username' => 'laia_91']);

        $this->actingAs($this->usuario('admin'))->get('/admin?buscar=jor')
            ->assertOk()
            ->assertSee('jordip')
            ->assertDontSee('laia_91');
    }

    public function test_el_admin_modifica_un_usuario_y_queda_en_la_auditoria(): void
    {
        $admin = $this->usuario('admin');
        $jugador = $this->usuario('player', ['username' => 'pau', 'email' => 'pau@correu.cat']);

        $this->actingAs($admin)
            ->put("/admin/usuarios/{$jugador->id}", ['username' => 'pau_nou', 'email' => 'pau.nou@correu.cat'])
            ->assertRedirect()
            ->assertSessionHas('estado');

        $this->assertSame('pau_nou', $jugador->fresh()->username);
        $this->assertDatabaseHas('audit_log', [
            'admin_id' => $admin->id,
            'target_user_id' => $jugador->id,
            'action' => 'update_user',
        ]);
    }

    public function test_un_usuario_no_puede_quedarse_con_un_nombre_repetido(): void
    {
        $this->usuario('player', ['username' => 'ocupado']);
        $jugador = $this->usuario();

        $this->actingAs($this->usuario('admin'))
            ->put("/admin/usuarios/{$jugador->id}", ['username' => 'ocupado', 'email' => $jugador->email])
            ->assertSessionHasErrorsIn('usuario_'.$jugador->id, 'username');

        $this->assertSame(0, AuditLog::count());
    }

    public function test_el_admin_desactiva_y_activa_un_jugador(): void
    {
        $admin = $this->usuario('admin');
        $jugador = $this->usuario();

        $this->actingAs($admin)->patch("/admin/usuarios/{$jugador->id}/estado")->assertRedirect();
        $this->assertFalse($jugador->fresh()->is_active);

        $this->actingAs($admin)->patch("/admin/usuarios/{$jugador->id}/estado")->assertRedirect();
        $this->assertTrue($jugador->fresh()->is_active);

        $this->assertSame(['deactivate_user', 'activate_user'], AuditLog::orderBy('id')->pluck('action')->all());
    }

    public function test_un_admin_no_puede_tocar_a_otro_admin_ni_al_superadmin(): void
    {
        $admin = $this->usuario('admin');
        $otro = $this->usuario('admin');
        $jefe = $this->usuario('superadmin');

        $this->actingAs($admin)->put("/admin/usuarios/{$otro->id}", ['username' => 'x', 'email' => 'x@correu.cat'])->assertForbidden();
        $this->actingAs($admin)->patch("/admin/usuarios/{$jefe->id}/estado")->assertForbidden();

        $this->assertTrue($jefe->fresh()->is_active);
        $this->assertSame(0, AuditLog::count());
    }

    public function test_nadie_se_puede_desactivar_a_si_mismo(): void
    {
        $jefe = $this->usuario('superadmin');

        $this->actingAs($jefe)->patch("/admin/administradores/{$jefe->id}/estado")
            ->assertSessionHasErrors('general');
        $this->actingAs($jefe)->patch("/admin/usuarios/{$jefe->id}/estado")
            ->assertSessionHasErrors('general');

        $this->assertTrue($jefe->fresh()->is_active);
    }

    public function test_el_admin_modifica_una_puntuacion_y_queda_en_la_auditoria(): void
    {
        $admin = $this->usuario('admin');
        $jugador = $this->usuario();
        $partida = $this->partida($jugador, 5000);

        $this->actingAs($admin)
            ->put("/admin/puntuaciones/{$partida->session_id}", ['final_score' => 1200])
            ->assertRedirect();

        $this->assertSame(1200, $partida->fresh()->final_score);
        // La mejor puntuación del progreso también se corrige
        $this->assertSame(1200, (int) DB::table('user_game_progress')->where('user_id', $jugador->id)->value('best_score'));

        $registro = AuditLog::where('action', 'update_score')->first();
        $this->assertSame($admin->id, $registro->admin_id);
        $this->assertSame($jugador->id, $registro->target_user_id);
        $this->assertStringContainsString('5000', $registro->details);
    }

    public function test_una_puntuacion_negativa_no_se_acepta(): void
    {
        $partida = $this->partida($this->usuario(), 300);

        $this->actingAs($this->usuario('admin'))
            ->put("/admin/puntuaciones/{$partida->session_id}", ['final_score' => -1])
            ->assertSessionHasErrorsIn('partida_'.$partida->session_id, 'final_score');

        $this->assertSame(300, $partida->fresh()->final_score);
    }

    public function test_el_admin_borra_una_puntuacion_con_sus_intentos(): void
    {
        $admin = $this->usuario('admin');
        $jugador = $this->usuario();
        $partida = $this->partida($jugador, 900);

        $this->actingAs($admin)->delete("/admin/puntuaciones/{$partida->session_id}")->assertRedirect();

        $this->assertSame(0, GameSession::count());
        $this->assertSame(0, LevelAttempt::count());
        $this->assertDatabaseHas('audit_log', ['action' => 'delete_score', 'target_user_id' => $jugador->id]);
    }

    public function test_un_admin_no_gestiona_administradores(): void
    {
        $admin = $this->usuario('admin');

        $this->actingAs($admin)->get('/admin/administradores')->assertForbidden();
        $this->actingAs($admin)->post('/admin/administradores', [
            'username' => 'nuevo', 'email' => 'nuevo@correu.cat', 'password' => 'una-clave-muy-larga',
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['username' => 'nuevo']);
    }

    public function test_el_superadmin_ve_crea_y_modifica_administradores(): void
    {
        $jefe = $this->usuario('superadmin');
        $this->usuario('admin', ['username' => 'admin_alba']);

        $this->actingAs($jefe)->get('/admin/administradores')->assertOk()->assertSee('admin_alba');

        $this->actingAs($jefe)->post('/admin/administradores', [
            'username' => 'admin_hector', 'email' => 'hector@correu.cat', 'password' => 'una-clave-muy-larga',
        ])->assertRedirect();

        $nuevo = User::where('username', 'admin_hector')->first();
        $this->assertSame('admin', $nuevo->role);
        $this->assertNotSame('una-clave-muy-larga', $nuevo->password);

        $this->actingAs($jefe)->put("/admin/administradores/{$nuevo->id}", [
            'username' => 'admin_hector', 'email' => 'hector.a@correu.cat', 'password' => '',
        ])->assertRedirect();
        $this->assertSame('hector.a@correu.cat', $nuevo->fresh()->email);

        $this->actingAs($jefe)->patch("/admin/administradores/{$nuevo->id}/estado")->assertRedirect();
        $this->assertFalse($nuevo->fresh()->is_active);

        $this->assertSame(
            ['create_admin', 'update_admin', 'deactivate_admin'],
            AuditLog::orderBy('id')->pluck('action')->all()
        );
        // La contraseña nunca se apunta en el registro
        $this->assertStringNotContainsString('una-clave-muy-larga', AuditLog::first()->details);
    }

    public function test_un_administrador_necesita_una_contrasena_de_12_caracteres(): void
    {
        $this->actingAs($this->usuario('superadmin'))->post('/admin/administradores', [
            'username' => 'admin_corto', 'email' => 'corto@correu.cat', 'password' => 'corta123',
        ])->assertSessionHasErrorsIn('crear', 'password');

        $this->assertDatabaseMissing('users', ['username' => 'admin_corto']);
    }

    public function test_desde_administradores_no_se_toca_a_un_jugador(): void
    {
        $jugador = $this->usuario();

        $this->actingAs($this->usuario('superadmin'))
            ->patch("/admin/administradores/{$jugador->id}/estado")
            ->assertForbidden();
    }
}
