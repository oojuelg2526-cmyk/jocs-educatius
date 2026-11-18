<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('level_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->foreign('session_id')->references('session_id')->on('game_sessions');
            $table->foreignId('level_id')->constrained('levels');
            $table->unsignedInteger('level_time'); // segundos
            $table->unsignedInteger('errors_made')->nullable();
            $table->unsignedInteger('moves_count')->nullable();
            $table->unsignedInteger('help_clicks')->nullable();
            $table->unsignedInteger('score')->default(0);
            $table->unsignedTinyInteger('stars')->default(0); // 0 a 3
            $table->boolean('completed')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('level_attempts');
    }
};
