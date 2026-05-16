<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'discounts';

    protected $fillable = [
        'code', 'type', 'value', 'target',
        'min_order_amount', 'max_uses', 'uses',
        'customer_id', 'starts_at', 'expires_at',
        'status', 'description', 'store_id',
        'apply_via', 'product_quantity',
        'can_use_with_other_discounts',
    ];

    protected $casts = [
        'value' => 'float',
        'min_order_amount' => 'float',
        'max_uses' => 'integer',
        'uses' => 'integer',
        'product_quantity' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'can_use_with_other_discounts' => 'boolean',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'discount_products');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(ProductCategory::class, 'discount_categories');
    }

    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'discount_customers');
    }

    public function isValid(): bool
    {
        if ($this->status !== 'published') return false;
        if ($this->expires_at && $this->expires_at < now()) return false;
        if ($this->starts_at && $this->starts_at > now()) return false;
        if ($this->max_uses && $this->uses >= $this->max_uses) return false;
        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        if ($this->type === 'percentage') {
            return min($amount, ($amount * $this->value) / 100);
        }
        return min($amount, $this->value);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            });
    }
}
