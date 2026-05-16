<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasSlug;

    protected $table = 'products';

    protected $fillable = [
        'name', 'slug', 'description', 'content', 'image', 'images',
        'sku', 'barcode', 'price', 'sale_price', 'cost_per_item',
        'sale_type', 'sale_starts_at', 'sale_ends_at',
        'quantity', 'allow_checkout_when_out_of_stock',
        'with_storehouse_management', 'stock_status',
        'weight', 'length', 'width', 'height',
        'brand_id', 'category_id', 'tax_id', 'store_id',
        'is_featured', 'is_variation', 'is_digital',
        'generate_license_code', 'product_type',
        'minimum_order_quantity', 'maximum_order_quantity',
        'views', 'status', 'order', 'created_by',
        'specification_table_id',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'float',
        'sale_price' => 'float',
        'cost_per_item' => 'float',
        'weight' => 'float',
        'length' => 'float',
        'width' => 'float',
        'height' => 'float',
        'quantity' => 'integer',
        'views' => 'integer',
        'order' => 'integer',
        'minimum_order_quantity' => 'integer',
        'maximum_order_quantity' => 'integer',
        'is_featured' => 'boolean',
        'is_variation' => 'boolean',
        'is_digital' => 'boolean',
        'generate_license_code' => 'boolean',
        'allow_checkout_when_out_of_stock' => 'boolean',
        'with_storehouse_management' => 'boolean',
        'sale_starts_at' => 'datetime',
        'sale_ends_at' => 'datetime',
    ];

    protected $appends = ['current_price', 'is_on_sale', 'in_stock'];

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

    public function getCurrentPriceAttribute(): float
    {
        if ($this->isOnSale()) {
            return (float) $this->sale_price;
        }
        return (float) $this->price;
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->isOnSale();
    }

    public function getInStockAttribute(): bool
    {
        if ($this->allow_checkout_when_out_of_stock) {
            return true;
        }
        if ($this->stock_status === 'out_of_stock') {
            return false;
        }
        if (! $this->with_storehouse_management) {
            return true;
        }
        return $this->quantity > 0;
    }

    public function isOnSale(): bool
    {
        if (! $this->sale_price || $this->sale_price <= 0) {
            return false;
        }
        if ($this->sale_type === 'date') {
            $now = now();
            if ($this->sale_starts_at && $now < $this->sale_starts_at) return false;
            if ($this->sale_ends_at && $now > $this->sale_ends_at) return false;
        }
        return true;
    }

    public function getDiscountPercentAttribute(): int
    {
        if (! $this->isOnSale() || $this->price <= 0) return 0;
        return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(ProductCategory::class, 'product_category', 'product_id', 'category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(ProductTag::class, 'product_tag');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ProductVariation::class, 'configurable_product_id');
    }

    public function variationItems(): HasMany
    {
        return $this->hasMany(ProductVariationItem::class);
    }

    public function attributeSets(): BelongsToMany
    {
        return $this->belongsToMany(ProductAttributeSet::class, 'product_with_attribute_set');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(ProductCollection::class, 'product_collection_products');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(ProductLabel::class, 'product_label_products');
    }

    public function flashSales(): BelongsToMany
    {
        return $this->belongsToMany(FlashSale::class, 'flash_sale_products')
            ->withPivot('price', 'quantity', 'sold');
    }

    public function activeFlashSale()
    {
        return $this->flashSales()
            ->where('status', 'published')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }

    public function orderProducts(): HasMany
    {
        return $this->hasMany(OrderProduct::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function specificationTable(): BelongsTo
    {
        return $this->belongsTo(SpecificationTable::class);
    }

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(GlobalOption::class, 'product_options');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->where('is_variation', false);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('with_storehouse_management', false)
              ->orWhere(function ($q2) {
                  $q2->where('with_storehouse_management', true)
                     ->where(function ($q3) {
                         $q3->where('quantity', '>', 0)
                            ->orWhere('allow_checkout_when_out_of_stock', true);
                     });
              });
        });
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('sku', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
}
