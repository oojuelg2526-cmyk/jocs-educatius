<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Game extends Model
{
    public $timestamps = false;

    protected $fillable = ['slug', 'order_no', 'name_key'];

    public function levels(): HasMany
    {
        return $this->hasMany(Level::class);
    }

    public function metricDefinitions(): HasMany
    {
        return $this->hasMany(MetricDefinition::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_game_progress')
            ->withPivot('status', 'last_level_completed', 'best_score', 'completed_at');
    }
}
