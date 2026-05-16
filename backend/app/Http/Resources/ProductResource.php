<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'images' => $this->images ?? [],
            'sku' => $this->sku,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'current_price' => $this->current_price,
            'is_on_sale' => $this->is_on_sale,
            'discount_percent' => $this->discount_percent,
            'in_stock' => $this->in_stock,
            'stock_status' => $this->stock_status,
            'quantity' => $this->quantity,
            'is_featured' => $this->is_featured,
            'is_digital' => $this->is_digital,
            'brand' => $this->whenLoaded('brand', fn() => [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
                'logo' => $this->brand->logo,
            ]),
            'categories' => $this->whenLoaded('categories', fn() =>
                $this->categories->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                ])
            ),
            'labels' => $this->whenLoaded('labels', fn() =>
                $this->labels->map(fn($l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                    'color' => $l->color,
                ])
            ),
            'store' => $this->whenLoaded('store', fn() => [
                'id' => $this->store->id,
                'name' => $this->store->name,
                'slug' => $this->store->slug,
                'logo' => $this->store->logo,
            ]),
            'reviews_avg' => round($this->approved_reviews_avg_star ?? 0, 1),
            'reviews_count' => $this->approved_reviews_count ?? 0,
            'has_variations' => ($this->variations_count ?? 0) > 0,
            'sale_ends_at' => $this->sale_ends_at,
            'created_at' => $this->created_at,
        ];
    }
}
