<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FlashSale extends Model
{
    use HasFactory;

    protected $table = 'flash_sales';

    protected $fillable = [
        'name', 'start_date', 'end_date',
        'status', 'is_featured',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_featured' => 'boolean',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'flash_sale_products')
            ->withPivot('price', 'quantity', 'sold')
            ->withTimestamps();
    }

    public function isActive(): bool
    {
        return $this->status === 'published'
            && $this->start_date <= now()
            && $this->end_date >= now();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'published')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    public function getRemainingTimeAttribute(): int
    {
        if ($this->end_date < now()) return 0;
        return $this->end_date->diffInSeconds(now());
    }
}
