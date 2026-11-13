<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserGameProgress extends Model
{
    protected $table = 'user_game_progress';
    public $timestamps = false;

    // La clave es doble (user_id + game_id) y Eloquent solo maneja una:
    // por eso se busca siempre con where() / updateOrCreate(), nunca con find().
    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = ['user_id', 'game_id', 'status', 'last_level_completed', 'best_score', 'completed_at'];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
