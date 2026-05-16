<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->product;
        $variation = $this->variation?->product;

        return [
            'id' => $this->id,
            'qty' => $this->qty,
            'price' => $this->price,
            'subtotal' => round($this->qty * $this->price, 2),
            'options' => $this->options ?? [],
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $variation?->image ?? $product->image,
                'sku' => $variation?->sku ?? $product->sku,
                'in_stock' => $product->in_stock,
                'quantity' => $product->quantity,
            ] : null,
            'variation' => $this->whenLoaded('variation', fn() => $this->variation ? [
                'id' => $this->variation->id,
                'attributes' => $this->variation->variationItems->map(fn($item) => [
                    'set' => $item->attribute?->attributeSet?->title,
                    'value' => $item->attribute?->title,
                    'color' => $item->attribute?->color,
                ]),
            ] : null),
            'store_id' => $this->store_id,
        ];
    }
}
