<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metric_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games');
            $table->string('metric_key'); // p. ej. attempts, puzzles_solved
            $table->string('description')->nullable();
            $table->enum('value_type', ['int', 'float'])->default('int');
            $table->unique(['game_id', 'metric_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metric_definitions');
    }
};
