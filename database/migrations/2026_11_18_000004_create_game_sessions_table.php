<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->uuid('session_id')->primary();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('game_id')->constrained('games');
            $table->timestamp('date_time'); // inicio de la sesión
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('session_length')->default(0); // segundos
            $table->unsignedTinyInteger('level_reached')->default(1);
            $table->unsignedInteger('final_score')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
