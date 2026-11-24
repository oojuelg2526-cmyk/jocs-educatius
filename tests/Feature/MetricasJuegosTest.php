<?php

namespace Tests\Feature;

use App\Models\GameSession;
use App\Models\LevelAttempt;
use App\Models\User;
use Database\Seeders\GameSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Lo que envía de verdad cada juego al superar un nivel, tal como lo arma su JavaScript.
// MetricasApiTest prueba las reglas de la API; aquí se prueba que los cuatro juegos encajan.
class MetricasJuegosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GameSeeder::class);
    }

    // Busca el intento guardado de una sesión
    private function intentoDe(string $sesion): LevelAttempt
    {
        return LevelAttempt::where('session_id', $sesion)->first();
    }

    // memory/js/pantalla.js → guardarIntento
    public function test_memory(): void
    {
        $sesion = '6f1d2c3b-4a5e-4f60-8172-93a4b5c6d7e8';
        $this->postJson('/api/guardar-metricas', [
            'username' => 'maria',
            'session_id' => $sesion,
            'game' => 'memory',
            'level' => 1,
            'date_time' => '2026-11-24T09:00:00.000Z',
            'session_length' => 95,
            'level_time' => 80,
            'final_score' => 370,
            'errors_made' => 3,
            'moves_count' => 7,
            'help_clicks' => 1,
            'stars' => 2,
            'completed' => true,
        ])->assertCreated();

        $intento = $this->intentoDe($sesion);
        $this->assertSame(80, $intento->level_time);
        $this->assertSame(3, $intento->errors_made);
        $this->assertSame(7, $intento->moves_count);
        $this->assertSame(1, $intento->help_clicks);
        $this->assertSame(370, $intento->score);
        $this->assertSame(2, $intento->stars);
        $this->assertSame('memory', GameSession::find($sesion)->game->slug);
    }

    // Eixample/js/principal.js → enviarMetricas (sin estrellas)
    public function test_eixample(): void
    {
        $sesion = '7a2e3d4c-5b6f-4071-9283-a4b5c6d7e8f9';
        $this->postJson('/api/guardar-metricas', [
            'username' => 'maria',
            'session_id' => $sesion,
            'game' => 'eixample',
            'level' => 2,
            'date_time' => '2026-11-24T09:10:00.000Z',
            'session_length' => 300,
            'level_time' => 140,
            'final_score' => 360,
            'errors_made' => 2,
            'moves_count' => 54,
            'help_clicks' => 2,
            'completed' => true,
        ])->assertCreated();

        $intento = $this->intentoDe($sesion);
        $this->assertSame(2, $intento->level->level_no);
        $this->assertSame(2, $intento->errors_made);
        $this->assertSame(54, $intento->moves_count);
        $this->assertSame(360, $intento->score);
        $this->assertSame(0, $intento->stars);
        $this->assertTrue($intento->completed);
    }

    // lineaDelTiempo/js/game.js → guardarMetricasBD (con sus propios nombres y sin "completed")
    public function test_linea_del_tiempo(): void
    {
        $sesion = '8b3f4e5d-6c70-4182-a394-b5c6d7e8f9a0';
        $this->postJson('/api/guardar-metricas', [
            'game' => 'timeline',
            'username' => 'maria',
            'session_id' => $sesion,
            'date_time' => '2026-11-24T09:20:00.000Z',
            'session_length' => 70,
            'errors_made' => 1,
            'level_time' => 65,
            'hints_used' => 4,
            'final_score' => 900,
            'nivel_jugado' => 3,
        ])->assertCreated();

        $intento = $this->intentoDe($sesion);
        $this->assertSame(3, $intento->level->level_no);
        $this->assertSame(4, $intento->help_clicks);
        $this->assertSame(1, $intento->errors_made);
        $this->assertTrue($intento->completed);
        $this->assertSame(3, GameSession::find($sesion)->level_reached);
    }

    // metro/js/storage.js → buildPayload
    public function test_metro(): void
    {
        $sesion = '9c405f6e-7d81-4293-b4a5-c6d7e8f9a0b1';
        $this->postJson('/api/guardar-metricas', [
            'username' => 'maria',
            'session_id' => $sesion,
            'game' => 'metro',
            'level' => 1,
            'date_time' => '2026-11-24T09:30:00.000Z',
            'session_length' => 50,
            'level_time' => 40,
            'moves_count' => 18,
            'help_clicks' => 0,
            'final_score' => 1210,
            'stars' => 3,
            'completed' => true,
        ])->assertCreated();

        $intento = $this->intentoDe($sesion);
        $this->assertSame(18, $intento->moves_count);
        $this->assertSame(1210, $intento->score);
        $this->assertSame(3, $intento->stars);
        $this->assertNull($intento->errors_made);
    }

    // Los cuatro juegos con el mismo jugador: un solo usuario, una sesión por juego
    public function test_un_jugador_en_los_cuatro_juegos(): void
    {
        $this->test_memory();
        $this->test_eixample();
        $this->test_linea_del_tiempo();
        $this->test_metro();

        $this->assertSame(1, User::where('username', 'maria')->count());
        $this->assertSame(4, GameSession::count());
        $this->assertSame(4, User::where('username', 'maria')->first()->games()->count());
    }

    // sesion.js deja letras con acento y cambia lo demás por _: el servidor lo acepta
    public function test_nombre_limpiado_por_sesion_js_y_invitado(): void
    {
        $datos = [
            'session_id' => 'ad516071-8e92-43a4-85b6-d7e8f9a0b1c2',
            'game' => 'metro',
            'level' => 1,
            'date_time' => '2026-11-24T09:40:00.000Z',
            'session_length' => 10,
            'level_time' => 10,
            'final_score' => 100,
        ];
        $this->postJson('/api/guardar-metricas', ['username' => 'Ana_María'] + $datos)->assertCreated();

        $datos['session_id'] = 'be627182-9fa3-44b5-96c7-e8f9a0b1c2d3';
        $this->postJson('/api/guardar-metricas', ['username' => 'invitado'] + $datos)->assertCreated();

        $this->assertNotNull(User::where('username', 'Ana_María')->first());
        $this->assertNotNull(User::where('username', 'invitado')->first());
    }
}
