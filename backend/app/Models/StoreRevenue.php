<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreRevenue extends Model
{
    use HasFactory;

    protected $table = 'store_revenues';

    protected $fillable = [
        'store_id', 'order_id', 'sub_amount',
        'tax_amount', 'commission_fee', 'current_balance',
        'fee', 'currency', 'status',
        'type', 'description',
    ];

    protected $casts = [
        'sub_amount' => 'float',
        'tax_amount' => 'float',
        'commission_fee' => 'float',
        'current_balance' => 'float',
        'fee' => 'float',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
