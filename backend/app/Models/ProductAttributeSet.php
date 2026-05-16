<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductAttributeSet extends Model
{
    use HasFactory;

    protected $table = 'product_attribute_sets';

    protected $fillable = [
        'title', 'slug', 'display_layout', 'order',
        'status', 'is_searchable', 'is_comparable',
        'use_image_from_product_variation',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_searchable' => 'boolean',
        'is_comparable' => 'boolean',
        'use_image_from_product_variation' => 'boolean',
    ];

    public function attributes(): HasMany
    {
        return $this->hasMany(ProductAttribute::class, 'attribute_set_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_with_attribute_set');
    }
}
