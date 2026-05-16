<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'content' => $this->content,
            'image' => $this->image,
            'images' => $this->images ?? [],
            'sku' => $this->sku,
            'barcode' => $this->barcode,
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
            'product_type' => $this->product_type,
            'weight' => $this->weight,
            'length' => $this->length,
            'width' => $this->width,
            'height' => $this->height,
            'minimum_order_quantity' => $this->minimum_order_quantity,
            'maximum_order_quantity' => $this->maximum_order_quantity,
            'sale_ends_at' => $this->sale_ends_at,
            'views' => $this->views,
            'brand' => $this->whenLoaded('brand'),
            'categories' => $this->whenLoaded('categories'),
            'tags' => $this->whenLoaded('tags'),
            'labels' => $this->whenLoaded('labels'),
            'tax' => $this->whenLoaded('tax'),
            'store' => $this->whenLoaded('store', fn() => [
                'id' => $this->store->id,
                'name' => $this->store->name,
                'slug' => $this->store->slug,
                'logo' => $this->store->logo,
                'rating' => $this->store->rating,
                'is_verified' => $this->store->is_verified,
            ]),
            'attribute_sets' => $this->whenLoaded('attributeSets', fn() =>
                $this->attributeSets->map(fn($set) => [
                    'id' => $set->id,
                    'title' => $set->title,
                    'display_layout' => $set->display_layout,
                    'use_image_from_product_variation' => $set->use_image_from_product_variation,
                    'attributes' => $set->attributes->map(fn($attr) => [
                        'id' => $attr->id,
                        'title' => $attr->title,
                        'color' => $attr->color,
                        'image' => $attr->image,
                        'slug' => $attr->slug,
                    ]),
                ])
            ),
            'variations' => $this->whenLoaded('variations', fn() =>
                $this->variations->map(fn($var) => [
                    'id' => $var->id,
                    'is_default' => $var->is_default,
                    'product' => $var->product ? [
                        'id' => $var->product->id,
                        'price' => $var->product->price,
                        'sale_price' => $var->product->sale_price,
                        'current_price' => $var->product->current_price,
                        'in_stock' => $var->product->in_stock,
                        'quantity' => $var->product->quantity,
                        'image' => $var->product->image,
                        'sku' => $var->product->sku,
                    ] : null,
                    'variation_items' => $var->variationItems->map(fn($item) => [
                        'attribute_id' => $item->attribute_id,
                        'attribute' => $item->attribute ? [
                            'id' => $item->attribute->id,
                            'title' => $item->attribute->title,
                            'color' => $item->attribute->color,
                            'attribute_set_id' => $item->attribute->attribute_set_id,
                        ] : null,
                    ]),
                ])
            ),
            'reviews_avg' => round($this->approved_reviews_avg_star ?? 0, 1),
            'reviews_count' => $this->approved_reviews_count ?? 0,
            'specification_table' => $this->whenLoaded('specificationTable', fn() => $this->specificationTable ? [
                'name' => $this->specificationTable->name,
                'groups' => $this->specificationTable->groups->map(fn($g) => [
                    'name' => $g->name,
                    'attributes' => $g->attributes->map(fn($a) => [
                        'name' => $a->name,
                        'value' => $a->value,
                    ]),
                ]),
            ] : null),
            'options' => $this->whenLoaded('options', fn() =>
                $this->options->map(fn($opt) => [
                    'id' => $opt->id,
                    'name' => $opt->name,
                    'type' => $opt->type,
                    'required' => $opt->required,
                    'values' => $opt->values->map(fn($v) => [
                        'id' => $v->id,
                        'name' => $v->name,
                        'price' => $v->price,
                        'price_type' => $v->price_type,
                        'image' => $v->image,
                    ]),
                ])
            ),
            'created_at' => $this->created_at,
        ];
    }
}
