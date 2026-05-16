<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class CartService
{
    public function getCart(Request $request): Collection
    {
        $query = CartItem::with(['product.brand', 'product.labels', 'variation.product', 'variation.variationItems.attribute.attributeSet'])
            ->where($this->getIdentifier($request));

        return $query->get();
    }

    public function addItem(Request $request, array $data): CartItem
    {
        $identifier = $this->getIdentifier($request);

        $existing = CartItem::where($identifier)
            ->where('product_id', $data['product_id'])
            ->where('product_variation_id', $data['variation_id'])
            ->first();

        if ($existing) {
            $existing->increment('qty', $data['qty']);
            $existing->update(['price' => $data['price']]);
            return $existing->fresh();
        }

        return CartItem::create([
            ...$identifier,
            'product_id' => $data['product_id'],
            'product_variation_id' => $data['variation_id'],
            'qty' => $data['qty'],
            'price' => $data['price'],
            'store_id' => $data['store_id'],
            'options' => $data['options'],
        ]);
    }

    public function findItem(Request $request, int $id): ?CartItem
    {
        return CartItem::where($this->getIdentifier($request))->find($id);
    }

    public function clearCart(Request $request): void
    {
        CartItem::where($this->getIdentifier($request))->delete();
    }

    public function getSummary(Collection $items, float $discount = 0, float $shipping = 0): array
    {
        $subTotal = $items->sum(fn($item) => $item->qty * $item->price);
        $tax = $items->sum(function ($item) {
            $taxRate = $item->product?->tax?->percentage ?? 0;
            return ($item->qty * $item->price * $taxRate) / 100;
        });
        $total = max(0, $subTotal + $tax + $shipping - $discount);

        return [
            'sub_total'  => round($subTotal, 2),
            'subtotal'   => round($subTotal, 2),
            'item_count' => $items->sum('qty'),
            'discount'   => round($discount, 2),
            'tax'        => round($tax, 2),
            'shipping'   => round($shipping, 2),
            'total'      => round($total, 2),
        ];
    }

    public function getEmptySummary(): array
    {
        return ['sub_total' => 0, 'subtotal' => 0, 'item_count' => 0, 'discount' => 0, 'tax' => 0, 'shipping' => 0, 'total' => 0];
    }

    public function applyCoupon(string $code, float $subTotal): array
    {
        $discount = Discount::where('code', strtoupper($code))->first();

        if (! $discount || ! $discount->isValid()) {
            return ['valid' => false, 'message' => 'Invalid or expired coupon code.'];
        }

        if ($discount->min_order_amount && $subTotal < $discount->min_order_amount) {
            return [
                'valid' => false,
                'message' => "Minimum order amount is \${$discount->min_order_amount}.",
            ];
        }

        $discountAmount = $discount->calculateDiscount($subTotal);

        return [
            'valid' => true,
            'discount' => round($discountAmount, 2),
            'coupon' => [
                'code' => $discount->code,
                'type' => $discount->type,
                'value' => $discount->value,
            ],
        ];
    }

    public function mergeGuestCart(Request $request, int $customerId): void
    {
        $sessionId = $request->session()->getId();

        CartItem::where('session_id', $sessionId)
            ->each(function ($item) use ($customerId) {
                $existing = CartItem::where('customer_id', $customerId)
                    ->where('product_id', $item->product_id)
                    ->where('product_variation_id', $item->product_variation_id)
                    ->first();

                if ($existing) {
                    $existing->increment('qty', $item->qty);
                    $item->delete();
                } else {
                    $item->update(['customer_id' => $customerId, 'session_id' => null]);
                }
            });
    }

    private function getIdentifier(Request $request): array
    {
        if ($customer = $request->user()) {
            return ['customer_id' => $customer->id];
        }
        // Support client-provided session_id (for SPA / mobile clients).
        // Falls back to the Laravel session ID when not supplied.
        $sessionId = $request->input('session_id')
            ?? $request->query('session_id')
            ?? $request->session()->getId();

        return ['session_id' => $sessionId];
    }
}
