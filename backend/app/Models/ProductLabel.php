<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductLabel extends Model
{
    use HasFactory;

    protected $table = 'product_labels';

    protected $fillable = ['name', 'color', 'status'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_label_products');
    }
}
