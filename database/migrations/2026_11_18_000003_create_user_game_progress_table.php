<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_game_progress', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('game_id')->constrained('games');
            $table->enum('status', ['locked', 'unlocked', 'completed'])->default('locked');
            $table->unsignedTinyInteger('last_level_completed')->default(0);
            $table->unsignedInteger('best_score')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->primary(['user_id', 'game_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_game_progress');
    }
};
