<?php

namespace Tests\Feature;

use App\Models\GameSession;
use App\Models\LevelAttempt;
use App\Models\User;
use Database\Seeders\GameSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MetricasApiTest extends TestCase
{
    use RefreshDatabase;

    private string $sesion = 'b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GameSeeder::class);
    }

    private function datos(array $cambios = []): array
    {
        return $cambios + [
            'username' => 'maria',
            'session_id' => $this->sesion,
            'game' => 'metro',
            'level' => 1,
            'date_time' => '2026-11-23T10:00:00Z',
            'session_length' => 120,
            'level_time' => 90,
            'moves_count' => 20,
            'help_clicks' => 1,
            'final_score' => 900,
            'stars' => 3,
            'completed' => true,
        ];
    }

    public function test_guarda_usuario_sesion_intento_y_progreso(): void
    {
        $this->postJson('/api/guardar-metricas', $this->datos())->assertCreated();

        $usuario = User::where('username', 'maria')->first();
        $this->assertSame('player', $usuario->role);
        $sesion = GameSession::find($this->sesion);
        $this->assertSame(900, $sesion->final_score);
        $this->assertSame(1, LevelAttempt::count());
        $this->assertSame(1, $usuario->games()->first()->pivot->last_level_completed);
    }

    public function test_varios_niveles_suman_en_la_misma_sesion(): void
    {
        $this->postJson('/api/guardar-metricas', $this->datos())->assertCreated();
        $this->postJson('/api/guardar-metricas', $this->datos(['level' => 2, 'final_score' => 800]))->assertCreated();
        // un nivel no superado no suma puntos ni sube el progreso
        $this->postJson('/api/guardar-metricas', $this->datos(['level' => 3, 'final_score' => 0, 'completed' => false]))->assertCreated();

        $sesion = GameSession::find($this->sesion);
        $this->assertSame(1700, $sesion->final_score);
        $this->assertSame(3, $sesion->level_reached);
        $this->assertSame(3, LevelAttempt::count());
        $this->assertSame(2, User::first()->games()->first()->pivot->last_level_completed);
    }

    public function test_acepta_los_nombres_del_juego_3(): void
    {
        $datos = $this->datos(['game' => 'timeline', 'errors_made' => 2, 'hints_used' => 3, 'nivel_jugado' => 2]);
        unset($datos['level'], $datos['help_clicks']);

        $this->postJson('/api/guardar-metricas', $datos)->assertCreated();

        $intento = LevelAttempt::first();
        $this->assertSame(3, $intento->help_clicks);
        $this->assertSame(2, $intento->level->level_no);
    }

    public function test_rechaza_datos_no_validos(): void
    {
        $this->postJson('/api/guardar-metricas', $this->datos(['session_id' => '0000-0000']))->assertStatus(422);
        $this->postJson('/api/guardar-metricas', $this->datos(['game' => 'otro']))->assertStatus(422);
        $this->postJson('/api/guardar-metricas', $this->datos(['level' => 7]))->assertStatus(422);
        $this->postJson('/api/guardar-metricas', $this->datos(['final_score' => -5]))->assertStatus(422);
        $this->assertSame(0, GameSession::count());
    }

    public function test_no_se_puede_usar_un_administrador(): void
    {
        User::factory()->create(['username' => 'jefe', 'role' => 'admin']);

        $this->postJson('/api/guardar-metricas', $this->datos(['username' => 'jefe']))->assertForbidden();
        $this->assertSame(0, GameSession::count());
    }

    public function test_una_sesion_no_se_puede_reutilizar_con_otro_usuario(): void
    {
        $this->postJson('/api/guardar-metricas', $this->datos())->assertCreated();

        $this->postJson('/api/guardar-metricas', $this->datos(['username' => 'pedro']))->assertForbidden();
        $this->assertSame(1, LevelAttempt::count());
    }
}
