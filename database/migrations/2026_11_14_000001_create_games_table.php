<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Los 4 juegos. id y order_no valen lo mismo (1 a 4).
        Schema::create('games', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('slug', 30)->unique(); // memory, eixample, timeline, metro
            $table->unsignedTinyInteger('order_no')->unique();
            $table->string('name_key', 60); // clave del archivo de idioma
        });

        // Los 3 niveles de cada juego.
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('game_id');
            $table->unsignedTinyInteger('level_no');
            $table->string('name_key', 60);
            $table->unique(['game_id', 'level_no']);
            $table->foreign('game_id')->references('id')->on('games');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('levels');
        Schema::dropIfExists('games');
    }
};
