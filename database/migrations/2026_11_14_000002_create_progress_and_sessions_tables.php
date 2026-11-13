<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Por dónde va cada jugador en cada juego.
        Schema::create('user_game_progress', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('game_id');
            $table->string('status', 20)->default('locked'); // locked, unlocked, completed
            $table->unsignedTinyInteger('last_level_completed')->default(0);
            $table->unsignedInteger('best_score')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->primary(['user_id', 'game_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('game_id')->references('id')->on('games');
        });

        // Una fila por partida.
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->uuid('session_id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('game_id');
            $table->timestamp('date_time'); // inicio
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('session_length')->default(0); // segundos
            $table->unsignedTinyInteger('level_reached')->default(1);
            $table->integer('final_score')->default(0);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('game_id')->references('id')->on('games');
        });

        // Métricas comunes de cada intento de nivel.
        Schema::create('level_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->unsignedBigInteger('level_id');
            $table->unsignedInteger('level_time')->default(0); // segundos
            $table->unsignedInteger('errors_made')->nullable();
            $table->unsignedInteger('moves_count')->nullable();
            $table->unsignedInteger('help_clicks')->nullable();
            $table->integer('score')->default(0);
            $table->unsignedTinyInteger('stars')->default(0);
            $table->boolean('completed')->default(false);
            $table->foreign('session_id')->references('session_id')->on('game_sessions')->cascadeOnDelete();
            $table->foreign('level_id')->references('id')->on('levels');
        });

        // Métricas que solo tiene un juego.
        Schema::create('metric_definitions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('game_id');
            $table->string('metric_key', 50);
            $table->string('description')->nullable();
            $table->string('value_type', 10)->default('int'); // int, float
            $table->unique(['game_id', 'metric_key']);
            $table->foreign('game_id')->references('id')->on('games');
        });

        Schema::create('session_metrics', function (Blueprint $table) {
            $table->uuid('session_id');
            $table->unsignedBigInteger('metric_id');
            $table->decimal('value', 12, 2);
            $table->primary(['session_id', 'metric_id']);
            $table->foreign('session_id')->references('session_id')->on('game_sessions')->cascadeOnDelete();
            $table->foreign('metric_id')->references('id')->on('metric_definitions');
        });

        // Quién (administrador) cambió qué y cuándo.
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_id');
            $table->unsignedBigInteger('target_user_id')->nullable();
            $table->string('action', 50);
            $table->text('details')->nullable();
            $table->timestamp('created_at')->nullable();
            // Sin borrado en cascada: en SQL Server dos cascadas al mismo usuario dan error.
            $table->foreign('admin_id')->references('id')->on('users');
            $table->foreign('target_user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
        Schema::dropIfExists('session_metrics');
        Schema::dropIfExists('metric_definitions');
        Schema::dropIfExists('level_attempts');
        Schema::dropIfExists('game_sessions');
        Schema::dropIfExists('user_game_progress');
    }
};
