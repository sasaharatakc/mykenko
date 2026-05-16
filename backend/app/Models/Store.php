<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Store extends Model
{
    use HasFactory, SoftDeletes, HasSlug;

    protected $table = 'stores';

    protected $fillable = [
        'name', 'slug', 'email', 'phone', 'address',
        'logo', 'cover_image', 'description', 'content',
        'owner_id', 'status', 'is_verified',
        'tax_id_number', 'website', 'social_links',
        'city', 'state', 'country', 'zip_code',
        'latitude', 'longitude',
        'commission_rate', 'total_revenue', 'total_sales',
        'rating', 'rating_count',
    ];

    protected $casts = [
        'social_links' => 'array',
        'is_verified' => 'boolean',
        'commission_rate' => 'float',
        'total_revenue' => 'float',
        'total_sales' => 'integer',
        'rating' => 'float',
        'rating_count' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function revenues(): HasMany
    {
        return $this->hasMany(StoreRevenue::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getTotalPendingWithdrawalAttribute(): float
    {
        return $this->withdrawals()->where('status', 'pending')->sum('amount');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true)->where('status', 'approved');
    }

    public function approvedReviews()
    {
        return $this->reviews()->where('status', 'approved');
    }
}
