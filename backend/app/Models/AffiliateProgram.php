<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AffiliateProgram extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code', 'name', 'commission_rate', 'commission_type',
        'fixed_amount', 'affiliate_url', 'is_active', 'expires_at',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:4',
        'fixed_amount'    => 'decimal:2',
        'is_active'       => 'boolean',
        'expires_at'      => 'datetime',
    ];

    public function clicks(): HasMany
    {
        return $this->hasMany(AffiliateClick::class);
    }

    public function conversions(): HasMany
    {
        return $this->hasMany(AffiliateConversion::class);
    }

    public function calculateCommission(float $orderAmount): float
    {
        if ($this->commission_type === 'fixed') {
            return (float) ($this->fixed_amount ?? 0);
        }
        return round($orderAmount * (float) $this->commission_rate, 2);
    }
}
