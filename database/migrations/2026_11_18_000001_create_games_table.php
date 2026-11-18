<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // memory, eixample, timeline, metro
            $table->unsignedTinyInteger('order_no')->unique(); // 1 a 4: orden de desbloqueo
            $table->string('name_key'); // clave del archivo de idioma
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
