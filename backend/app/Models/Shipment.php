<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipment extends Model
{
    use HasFactory;

    protected $table = 'shipments';

    protected $fillable = [
        'order_id', 'tracking_id', 'carrier',
        'shipping_method', 'weight', 'rate',
        'status', 'note', 'estimated_delivery_date',
    ];

    protected $casts = [
        'weight' => 'float',
        'rate' => 'float',
        'estimated_delivery_date' => 'date',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ShipmentHistory::class);
    }
}
