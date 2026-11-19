<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_metrics', function (Blueprint $table) {
            $table->uuid('session_id');
            $table->foreign('session_id')->references('session_id')->on('game_sessions');
            $table->foreignId('metric_id')->constrained('metric_definitions');
            $table->decimal('value', 12, 2);
            $table->primary(['session_id', 'metric_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_metrics');
    }
};
