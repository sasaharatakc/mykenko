<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariation extends Model
{
    use HasFactory;

    protected $table = 'product_variations';

    protected $fillable = [
        'configurable_product_id', 'product_id',
        'is_default', 'allow_checkout_when_out_of_stock',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'allow_checkout_when_out_of_stock' => 'boolean',
    ];

    public function configurableProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'configurable_product_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variationItems(): HasMany
    {
        return $this->hasMany(ProductVariationItem::class, 'variation_id');
    }
}
