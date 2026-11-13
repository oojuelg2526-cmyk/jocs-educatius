<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\GameSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Pruebas de la API del contrato (docs/api-contrato.md) y del registro.
class ApiTest extends TestCase
{
    use RefreshDatabase;

    private const SESSION = '11111111-1111-4111-8111-111111111111';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GameSeeder::class);
    }

    // Registra un jugador por la ruta real, para que tenga su progreso inicial.
    private function player(): User
    {
        $this->post('/register', [
            'username' => 'ana', 'email' => 'ana@example.com', 'language' => 'ca',
            'password' => 'una-clave-larga', 'password_confirmation' => 'una-clave-larga',
        ])->assertRedirect('/juegos/metro');
        $this->post('/logout');

        return User::firstWhere('username', 'ana');
    }

    private function body(array $attempts = [], array $over = []): array
    {
        return array_merge([
            'game' => 4, 'date_time' => '2026-11-13T10:00:00.000Z', 'session_length' => 100,
            'level_reached' => 2, 'final_score' => 900, 'attempts' => $attempts,
        ], $over);
    }

    private function attempt(int $level, bool $won = true, int $score = 900): array
    {
        return ['level' => $level, 'level_time' => 90, 'moves_count' => 16, 'help_clicks' => 0,
            'score' => $score, 'stars' => 3, 'completed' => $won];
    }

    // Deja el juego 4 abierto, como si ya se hubiera superado el 3.
    private function unlockMetro(User $user): void
    {
        $user->progress()->where('game_id', 4)->update(['status' => 'unlocked']);
    }

    public function test_registro_crea_progreso_con_solo_el_juego_1_abierto(): void
    {
        $user = $this->player();
        $this->assertSame('player', $user->role);
        $this->assertSame(
            ['unlocked', 'locked', 'locked', 'locked'],
            $user->progress()->orderBy('game_id')->pluck('status')->all(),
        );
    }

    public function test_el_rol_no_se_puede_elegir_al_registrarse(): void
    {
        $this->post('/register', [
            'username' => 'eve', 'email' => 'eve@example.com', 'language' => 'es', 'role' => 'superadmin',
            'password' => 'una-clave-larga', 'password_confirmation' => 'una-clave-larga',
        ]);
        $this->assertSame('player', User::firstWhere('username', 'eve')->role);
    }

    public function test_sin_login_la_api_da_401_con_codigo(): void
    {
        $this->getJson('/api/progress')->assertStatus(401)->assertExactJson(['error' => 'unauthenticated']);
        $this->putJson('/api/sessions/'.self::SESSION, $this->body())->assertStatus(401);
    }

    public function test_progress_devuelve_el_formato_del_contrato(): void
    {
        $user = $this->player();
        $this->actingAs($user)->getJson('/api/progress')
            ->assertOk()
            ->assertJsonPath('user.username', 'ana')
            ->assertJsonPath('games.1.status', 'unlocked')
            ->assertJsonPath('games.4.status', 'locked');
    }

    public function test_guardar_sesion_y_calcular_progreso(): void
    {
        $user = $this->player();
        $this->unlockMetro($user);

        $r = $this->actingAs($user)->putJson('/api/sessions/'.self::SESSION, $this->body([$this->attempt(1)]));
        $r->assertStatus(201)->assertExactJson(['progress' => ['status' => 'unlocked', 'last_level_completed' => 1, 'best_score' => 900]]);

        // Repetir la misma sesión no duplica: ahora con el nivel 2 y uno perdido
        $attempts = [$this->attempt(1), $this->attempt(2, true, 800), $this->attempt(3, false, 0)];
        $r = $this->actingAs($user)->putJson('/api/sessions/'.self::SESSION, $this->body($attempts));
        $r->assertStatus(200)->assertJsonPath('progress.last_level_completed', 2)->assertJsonPath('progress.best_score', 1700);
        $this->assertDatabaseCount('game_sessions', 1);
        $this->assertDatabaseCount('level_attempts', 3);
    }

    public function test_superar_el_nivel_3_completa_el_juego(): void
    {
        $user = $this->player();
        $this->unlockMetro($user);
        $attempts = [$this->attempt(1), $this->attempt(2), $this->attempt(3)];
        $this->actingAs($user)->putJson('/api/sessions/'.self::SESSION, $this->body($attempts, ['level_reached' => 3]))
            ->assertJsonPath('progress.status', 'completed');
    }

    public function test_modo_independiente_deja_guardar_sin_desbloquear(): void
    {
        $user = $this->player(); // el juego 4 está bloqueado, pero no se exige el orden
        $this->actingAs($user)->putJson('/api/sessions/'.self::SESSION, $this->body([$this->attempt(1)]))
            ->assertStatus(201)->assertJsonPath('progress.status', 'unlocked');
    }

    public function test_modo_integrado_avisa_al_juego_y_bloquea(): void
    {
        config(['games.enforce_order' => true]);
        $this->get('/juegos/metro')->assertSee('integrated', false);
    }

    public function test_juego_bloqueado_da_403(): void
    {
        config(['games.enforce_order' => true]); // modo integrado: se exige el orden
        $user = $this->player();
        $this->actingAs($user)->putJson('/api/sessions/'.self::SESSION, $this->body([$this->attempt(1)]))
            ->assertStatus(403)->assertExactJson(['error' => 'game_locked']);
    }

    public function test_no_se_puede_pisar_la_sesion_de_otro(): void
    {
        $ana = $this->player();
        $this->unlockMetro($ana);
        $this->actingAs($ana)->putJson('/api/sessions/'.self::SESSION, $this->body([$this->attempt(1)]))->assertStatus(201);

        $otro = User::factory()->create();
        $otro->progress()->createMany([['game_id' => 4, 'status' => 'unlocked']]);
        $this->actingAs($otro)->putJson('/api/sessions/'.self::SESSION, $this->body([$this->attempt(1)]))
            ->assertStatus(403)->assertExactJson(['error' => 'forbidden']);
    }

    public function test_datos_no_validos_dan_422(): void
    {
        $user = $this->player();
        $this->unlockMetro($user);
        $bad = $this->attempt(9);
        $this->actingAs($user)->putJson('/api/sessions/'.self::SESSION, $this->body([$bad]))
            ->assertStatus(422)->assertJsonPath('error', 'validation');
    }

    public function test_login_incorrecto_no_entra(): void
    {
        $this->player();
        $this->post('/login', ['username' => 'ana', 'password' => 'mala'])->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_la_pagina_del_juego_lleva_csrf_y_usuario_solo_con_sesion(): void
    {
        $this->get('/juegos/metro')->assertOk()->assertSee('csrf-token', false)->assertDontSee('window.CERDA', false);

        $user = $this->player();
        $this->actingAs($user)->get('/juegos/metro')->assertOk()->assertSee('window.CERDA', false)->assertSee('ana');
        $this->get('/juegos/metro/js/api.js')->assertOk();
        $this->get('/juegos/metro/js/../../.env')->assertNotFound();
    }
}
