<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'customer_id', 'product_id', 'store_id',
        'order_product_id', 'star', 'comment',
        'images', 'status', 'is_featured',
    ];

    protected $casts = [
        'star' => 'integer',
        'images' => 'array',
        'is_featured' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ReviewReply::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
