<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateConversion extends Model
{
    protected $fillable = [
        'affiliate_program_id', 'affiliate_click_id', 'order_id',
        'ref_code', 'order_amount', 'commission_amount', 'status', 'paid_at',
    ];

    protected $casts = [
        'order_amount'      => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'paid_at'           => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(AffiliateProgram::class, 'affiliate_program_id');
    }

    public function click(): BelongsTo
    {
        return $this->belongsTo(AffiliateClick::class, 'affiliate_click_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
