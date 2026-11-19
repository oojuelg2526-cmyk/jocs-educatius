<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games');
            $table->unsignedTinyInteger('level_no'); // 1 a 3
            $table->string('name_key');
            $table->unique(['game_id', 'level_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('levels');
    }
};
