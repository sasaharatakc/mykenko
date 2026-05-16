<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'sub_total' => $this->sub_total,
            'tax_amount' => $this->tax_amount,
            'shipping_amount' => $this->shipping_amount,
            'discount_amount' => $this->discount_amount,
            'total_amount' => $this->total_amount,
            'coupon_code' => $this->coupon_code,
            'item_count' => $this->whenLoaded('products', fn() => $this->products->sum('qty')),
            'shipping_address' => $this->whenLoaded('shippingAddress'),
            'store' => $this->whenLoaded('store', fn() => $this->store ? [
                'id' => $this->store->id,
                'name' => $this->store->name,
                'slug' => $this->store->slug,
            ] : null),
            'products' => $this->whenLoaded('products', fn() =>
                $this->products->map(fn($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_image' => $item->product_image,
                    'qty' => $item->qty,
                    'price' => $item->price,
                    'sub_total' => $item->sub_total,
                    'variation_name' => $item->options
                        ? collect($item->options)->map(fn($v, $k) => "{$k}: {$v}")->implode(' / ')
                        : null,
                ])
            ),
            'created_at' => $this->created_at,
            'completed_at' => $this->completed_at,
        ];
    }
}
