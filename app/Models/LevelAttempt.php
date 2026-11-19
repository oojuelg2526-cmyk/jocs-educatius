<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LevelAttempt extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'session_id', 'level_id', 'level_time', 'errors_made', 'moves_count',
        'help_clicks', 'score', 'stars', 'completed',
    ];

    protected function casts(): array
    {
        return ['completed' => 'boolean'];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'session_id', 'session_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }
}
