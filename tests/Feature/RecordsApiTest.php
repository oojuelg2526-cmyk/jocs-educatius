<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\GameSession;
use App\Models\User;
use Database\Seeders\GameSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class RecordsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GameSeeder::class);
        // Miércoles: así «esta semana» empieza el lunes 23
        Carbon::setTestNow('2026-11-25 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function partida(User $jugador, int $puntos, string $cuando, string $juego = 'memory', int $nivel = 3): void
    {
        GameSession::create([
            'session_id' => (string) Str::uuid(),
            'user_id' => $jugador->id,
            'game_id' => Game::where('slug', $juego)->value('id'),
            'date_time' => Carbon::parse($cuando),
            'level_reached' => $nivel,
            'final_score' => $puntos,
        ]);
    }

    public function test_sin_partidas_devuelve_una_lista_vacia(): void
    {
        $this->getJson('/api/records?juego=memory&periodo=hoy')
            ->assertOk()
            ->assertExactJson(['juego' => 'memory', 'periodo' => 'hoy', 'records' => []]);
    }

    public function test_devuelve_el_top_de_hoy_ordenado_y_sin_repetir_jugador(): void
    {
        $maria = User::factory()->create(['username' => 'MariaB']);
        $jordi = User::factory()->create(['username' => 'JordiP']);

        $this->partida($maria, 2310, '2026-11-25 10:00');
        $this->partida($maria, 1000, '2026-11-25 11:00'); // peor partida de la misma jugadora
        $this->partida($jordi, 2180, '2026-11-25 09:00', nivel: 2);
        $this->partida($jordi, 9999, '2026-11-24 09:00'); // ayer: no cuenta hoy

        $this->getJson('/api/records?juego=memory&periodo=hoy')
            ->assertOk()
            ->assertExactJson([
                'juego' => 'memory',
                'periodo' => 'hoy',
                'records' => [
                    ['posicion' => 1, 'jugador' => 'MariaB', 'nivel' => 3, 'puntos' => 2310],
                    ['posicion' => 2, 'jugador' => 'JordiP', 'nivel' => 2, 'puntos' => 2180],
                ],
            ]);
    }

    public function test_esta_semana_incluye_desde_el_lunes(): void
    {
        $jordi = User::factory()->create(['username' => 'JordiP']);
        $this->partida($jordi, 9999, '2026-11-23 09:00'); // lunes
        $this->partida($jordi, 8000, '2026-11-22 09:00'); // domingo anterior

        $this->getJson('/api/records?juego=memory&periodo=semana')
            ->assertOk()
            ->assertJsonCount(1, 'records')
            ->assertJsonPath('records.0.puntos', 9999);
    }

    public function test_solo_cuenta_el_juego_pedido_y_jugadores_activos(): void
    {
        $activo = User::factory()->create(['username' => 'activo']);
        $baja = User::factory()->create(['username' => 'baja', 'is_active' => false]);

        $this->partida($activo, 500, '2026-11-25 10:00', 'metro');
        $this->partida($baja, 900, '2026-11-25 10:00', 'metro');
        $this->partida($activo, 700, '2026-11-25 10:00', 'memory');

        $this->getJson('/api/records?juego=metro')
            ->assertOk()
            ->assertJsonCount(1, 'records')
            ->assertJsonPath('records.0.jugador', 'activo')
            ->assertJsonPath('records.0.puntos', 500);
    }

    public function test_como_mucho_diez_records(): void
    {
        for ($i = 1; $i <= 12; $i++) {
            $jugador = User::factory()->create();
            $this->partida($jugador, $i * 100, '2026-11-25 10:00');
        }

        $this->getJson('/api/records?juego=memory&periodo=hoy')
            ->assertOk()
            ->assertJsonCount(10, 'records')
            ->assertJsonPath('records.0.puntos', 1200);
    }

    public function test_rechaza_un_juego_o_un_periodo_que_no_existen(): void
    {
        $this->getJson('/api/records?juego=otro')->assertStatus(422);
        $this->getJson('/api/records?juego=memory&periodo=mes')->assertStatus(422);
    }
}
