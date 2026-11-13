<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetricDefinition extends Model
{
    public $timestamps = false;

    protected $fillable = ['game_id', 'metric_key', 'description', 'value_type'];
}
