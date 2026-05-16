<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    use HasFactory;

    protected $table = 'withdrawals';

    protected $fillable = [
        'store_id', 'amount', 'fee',
        'transaction_fee', 'status',
        'payment_channel', 'description',
        'payment_id', 'account_holder_name',
        'account_number', 'bank_name',
        'note', 'processed_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'fee' => 'float',
        'transaction_fee' => 'float',
        'processed_at' => 'datetime',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function getNetAmountAttribute(): float
    {
        return $this->amount - $this->fee - $this->transaction_fee;
    }
}
