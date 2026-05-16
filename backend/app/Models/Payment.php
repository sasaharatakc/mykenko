<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';

    protected $fillable = [
        'order_id', 'charge_id', 'payment_channel',
        'amount', 'currency', 'status',
        'metadata', 'description', 'refunded_amount',
        'customer_id',
    ];

    protected $casts = [
        'amount' => 'float',
        'refunded_amount' => 'float',
        'metadata' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
