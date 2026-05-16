<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderProduct extends Model
{
    use HasFactory;

    protected $table = 'order_products';

    protected $fillable = [
        'order_id', 'product_id', 'product_name',
        'product_image', 'qty', 'price',
        'sub_total', 'tax_amount', 'options',
        'product_type', 'product_file_ids',
        'variation_id', 'license_code',
        'restock_quantity_when_cancelled',
    ];

    protected $casts = [
        'qty' => 'integer',
        'price' => 'float',
        'sub_total' => 'float',
        'tax_amount' => 'float',
        'options' => 'array',
        'product_file_ids' => 'array',
        'restock_quantity_when_cancelled' => 'boolean',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class, 'order_product_id');
    }
}
