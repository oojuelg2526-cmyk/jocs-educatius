<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Level extends Model
{
    public $timestamps = false;

    protected $fillable = ['game_id', 'level_no', 'name_key'];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
