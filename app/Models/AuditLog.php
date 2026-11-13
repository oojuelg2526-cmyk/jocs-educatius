<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_log';
    const UPDATED_AT = null; // solo tiene created_at

    protected $fillable = ['admin_id', 'target_user_id', 'action', 'details'];
}
