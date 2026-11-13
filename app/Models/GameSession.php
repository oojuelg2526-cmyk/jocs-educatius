<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSession extends Model
{
    public $timestamps = false;
    protected $primaryKey = 'session_id';
    public $incrementing = false;
    protected $keyType = 'string'; // UUID

    protected $fillable = ['session_id', 'user_id', 'game_id', 'date_time', 'ended_at', 'session_length', 'level_reached', 'final_score'];

    protected function casts(): array
    {
        return ['date_time' => 'datetime', 'ended_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(LevelAttempt::class, 'session_id');
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(SessionMetric::class, 'session_id');
    }
}
