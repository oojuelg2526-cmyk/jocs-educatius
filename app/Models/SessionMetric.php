<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionMetric extends Model
{
    public $timestamps = false;
    protected $primaryKey = null; // clave doble (session_id + metric_id)
    public $incrementing = false;

    protected $fillable = ['session_id', 'metric_id', 'value'];
}
