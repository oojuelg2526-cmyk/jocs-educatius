<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $table = 'audit_log';

    public $timestamps = false;

    protected $fillable = ['admin_id', 'target_user_id', 'action', 'details'];

    /** Apunta en el registro un cambio hecho desde la administración. */
    public static function apuntar(User $admin, string $accion, ?User $afectado, array $detalles = []): self
    {
        return self::create([
            'admin_id' => $admin->id,
            'target_user_id' => $afectado?->id,
            'action' => $accion,
            'details' => json_encode($detalles, JSON_UNESCAPED_UNICODE),
        ]);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
