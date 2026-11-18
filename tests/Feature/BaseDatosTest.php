<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameSession;
use App\Models\User;
use Database\Seeders\GameSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BaseDatosTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_seeder_crea_4_juegos_con_3_niveles(): void
    {
        $this->seed(GameSeeder::class);

        $this->assertSame(4, Game::count());
        $this->assertSame(['memory', 'eixample', 'timeline', 'metro'], Game::orderBy('order_no')->pluck('slug')->all());
        foreach (Game::all() as $juego) {
            $this->assertCount(3, $juego->levels);
        }
    }

    public function test_una_sesion_guarda_intentos_y_metricas(): void
    {
        $this->seed(GameSeeder::class);
        $usuario = User::factory()->create();
        $memory = Game::where('slug', 'memory')->first();

        $sesion = GameSession::create([
            'session_id' => (string) Str::uuid(),
            'user_id' => $usuario->id,
            'game_id' => $memory->id,
            'date_time' => now(),
        ]);
        $sesion->attempts()->create([
            'level_id' => $memory->levels->first()->id,
            'level_time' => 40,
            'errors_made' => 2,
            'score' => 80,
            'stars' => 3,
            'completed' => true,
        ]);
        $sesion->metrics()->attach($memory->metricDefinitions->first()->id, ['value' => 12]);

        $this->assertCount(1, $sesion->fresh()->attempts);
        $this->assertEquals(12, $sesion->metrics()->first()->pivot->value);
    }

    public function test_el_progreso_enlaza_usuario_y_juego(): void
    {
        $this->seed(GameSeeder::class);
        $usuario = User::factory()->create();
        $memory = Game::where('slug', 'memory')->first();

        $usuario->games()->attach($memory->id, ['status' => 'unlocked']);

        $this->assertSame('unlocked', $usuario->games()->first()->pivot->status);
        $this->assertFalse($usuario->isAdmin());
    }
}
