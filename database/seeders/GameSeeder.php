<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Level;
use App\Models\MetricDefinition;
use Illuminate\Database\Seeder;

// Los 4 juegos con sus 3 niveles y las métricas que solo tiene un juego.
class GameSeeder extends Seeder
{
    public function run(): void
    {
        $slugs = [1 => 'memory', 2 => 'eixample', 3 => 'timeline', 4 => 'metro'];

        foreach ($slugs as $number => $slug) {
            // updateOrCreate: se puede repetir el seeder sin duplicar nada
            Game::updateOrCreate(['id' => $number], [
                'slug' => $slug,
                'order_no' => $number,
                'name_key' => "game_$slug",
            ]);

            foreach ([1, 2, 3] as $levelNo) {
                Level::updateOrCreate(
                    ['game_id' => $number, 'level_no' => $levelNo],
                    ['name_key' => "level_$levelNo"],
                );
            }
        }

        // Métricas individuales (las comunes ya tienen columna propia).
        MetricDefinition::updateOrCreate(
            ['game_id' => 1, 'metric_key' => 'attempts'],
            ['description' => 'Intentos de emparejar', 'value_type' => 'int'],
        );
        MetricDefinition::updateOrCreate(
            ['game_id' => 2, 'metric_key' => 'puzzles_solved'],
            ['description' => 'Puzles resueltos', 'value_type' => 'int'],
        );
    }
}
