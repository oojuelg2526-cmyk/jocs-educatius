<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    public $timestamps = false;
    public $incrementing = false; // el id lo ponemos nosotros (1 a 4)

    protected $fillable = ['id', 'slug', 'order_no', 'name_key'];

    public function levels(): HasMany
    {
        return $this->hasMany(Level::class);
    }
}
