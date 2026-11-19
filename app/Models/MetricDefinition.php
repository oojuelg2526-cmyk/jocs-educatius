<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetricDefinition extends Model
{
    public $timestamps = false;

    protected $fillable = ['game_id', 'metric_key', 'description', 'value_type'];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
