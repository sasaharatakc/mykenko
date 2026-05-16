<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Newsletter extends Model
{
    protected $fillable = ['email', 'confirmed_at', 'unsubscribed_at'];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    public function isActive(): bool
    {
        return $this->unsubscribed_at === null;
    }

    public function scopeActive($query)
    {
        return $query->whereNull('unsubscribed_at');
    }
}
