<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

// Los 4 juegos, sus 3 niveles y las métricas propias que ya están acordadas.
class GameSeeder extends Seeder
{
    public function run(): void
    {
        $juegos = [
            1 => 'memory',
            2 => 'eixample',
            3 => 'timeline',
            4 => 'metro',
        ];

        foreach ($juegos as $orden => $slug) {
            $juego = Game::updateOrCreate(
                ['slug' => $slug],
                ['order_no' => $orden, 'name_key' => "games.$slug"]
            );
            for ($nivel = 1; $nivel <= 3; $nivel++) {
                $juego->levels()->updateOrCreate(
                    ['level_no' => $nivel],
                    ['name_key' => "games.$slug.level_$nivel"]
                );
            }
        }

        Game::where('slug', 'memory')->first()->metricDefinitions()->updateOrCreate(
            ['metric_key' => 'attempts'],
            ['description' => 'Intentos de pareja', 'value_type' => 'int']
        );
        Game::where('slug', 'eixample')->first()->metricDefinitions()->updateOrCreate(
            ['metric_key' => 'puzzles_solved'],
            ['description' => 'Puzles resueltos', 'value_type' => 'int']
        );
    }
}
