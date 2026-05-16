<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'token' => $this->token,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'sub_total' => $this->sub_total,
            'tax_amount' => $this->tax_amount,
            'shipping_amount' => $this->shipping_amount,
            'discount_amount' => $this->discount_amount,
            'total_amount' => $this->total_amount,
            'coupon_code' => $this->coupon_code,
            'shipping_method' => $this->shipping_method,
            'note' => $this->note,
            'item_count' => $this->whenLoaded('products', fn() => $this->products->sum('qty')),
            'customer' => $this->whenLoaded('customer'),
            'store' => $this->whenLoaded('store'),
            'shipping_address' => $this->whenLoaded('shippingAddress'),
            'billing_address' => $this->whenLoaded('billingAddress'),
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
                    'slug' => $item->product?->slug,
                    'has_review' => $item->review !== null,
                ])
            ),
            'payment' => $this->whenLoaded('payment'),
            'shipment' => $this->whenLoaded('shipment', fn() => $this->shipment ? [
                'id' => $this->shipment->id,
                'tracking_id' => $this->shipment->tracking_id,
                'carrier' => $this->shipment->carrier,
                'shipping_method' => $this->shipment->shipping_method,
                'status' => $this->shipment->status,
                'estimated_delivery_date' => $this->shipment->estimated_delivery_date,
                'histories' => $this->shipment->histories,
            ] : null),
            'histories' => $this->whenLoaded('histories'),
            'invoice' => $this->whenLoaded('invoice'),
            'returns' => $this->whenLoaded('returns', fn() => $this->returns->map(fn($r) => [
                'id' => $r->id,
                'status' => $r->status,
                'return_reason' => $r->return_reason,
                'refund_amount' => $r->refund_amount,
                'note' => $r->note,
                'items' => $r->items->map(fn($i) => [
                    'id' => $i->id,
                    'qty' => $i->qty,
                    'refund_amount' => $i->refund_amount,
                    'product_name' => $i->orderProduct?->product_name ?? $i->product?->name,
                    'product_image' => $i->orderProduct?->product_image ?? $i->product?->image,
                ]),
                'created_at' => $r->created_at,
            ])),
            'can_cancel' => $this->canCancel(),
            'can_return' => $this->canReturn(),
            'created_at' => $this->created_at,
            'completed_at' => $this->completed_at,
        ];
    }
}
