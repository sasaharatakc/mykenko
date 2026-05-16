<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\OrderAddress;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Tax;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function createOrder(?Customer $customer, Collection $items, array $data): Order
    {
        return DB::transaction(function () use ($customer, $items, $data) {
            $shippingAddress = $data['shipping_address'];
            $billingAddress = $data['billing_address'] ?? $shippingAddress;

            // Calculate amounts
            $subTotal = $items->sum(fn($item) => $item->qty * $item->price);
            $shippingAmount = $this->getShippingCost($data['shipping_method'], $items);
            $taxAmount = $this->calculateTax($items);
            $discountAmount = 0;
            $couponCode = null;

            if ($data['coupon_code'] ?? null) {
                $discount = Discount::where('code', strtoupper($data['coupon_code']))->first();
                if ($discount && $discount->isValid()) {
                    $discountAmount = $discount->calculateDiscount($subTotal);
                    $couponCode = $discount->code;
                    $discount->increment('uses');
                }
            }

            $totalAmount = max(0, $subTotal + $shippingAmount + $taxAmount - $discountAmount);

            // Get store_id from first item
            $storeId = $items->first()?->store_id;

            $order = Order::create([
                'customer_id' => $customer?->id,
                'store_id' => $storeId,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $data['payment_method'],
                'sub_total' => $subTotal,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'coupon_code' => $couponCode,
                'coupon_discount' => $discountAmount,
                'shipping_method' => $data['shipping_method'],
                'note' => $data['note'] ?? null,
            ]);

            // Create shipping address
            OrderAddress::create([
                'order_id' => $order->id,
                'type' => 'shipping',
                ...$shippingAddress,
            ]);

            // Create billing address
            OrderAddress::create([
                'order_id' => $order->id,
                'type' => 'billing',
                ...$billingAddress,
            ]);

            // Create order products and reduce stock
            foreach ($items as $item) {
                OrderProduct::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_image' => $item->product->image,
                    'qty' => $item->qty,
                    'price' => $item->price,
                    'sub_total' => $item->qty * $item->price,
                    'options' => $item->options ?? [],
                    'variation_id' => $item->product_variation_id,
                ]);

                // Reduce stock
                if ($item->product->with_storehouse_management) {
                    $item->product->decrement('quantity', $item->qty);
                }
            }

            // Store commission for marketplace
            if ($storeId) {
                $this->createStoreRevenue($order, $storeId);
            }

            return $order->load(['products', 'shippingAddress']);
        });
    }

    public function getShippingRates(Collection $items, array $address): array
    {
        // Calculate total weight
        $totalWeight = $items->sum(fn($i) => ($i->product->weight ?? 0) * $i->qty);

        return [
            ['method' => 'standard', 'label' => 'Standard Shipping (5-7 days)', 'cost' => 5.99],
            ['method' => 'express', 'label' => 'Express Shipping (2-3 days)', 'cost' => 14.99],
            ['method' => 'overnight', 'label' => 'Overnight Shipping (1 day)', 'cost' => 29.99],
            ['method' => 'free', 'label' => 'Free Shipping (7-10 days)', 'cost' => 0],
        ];
    }

    private function getShippingCost(string $method, Collection $items): float
    {
        return match ($method) {
            'express'   => 14.99,
            'overnight' => 29.99,
            'free'      => 0,
            default     => 5.99,
        };
    }

    private function calculateTax(Collection $items): float
    {
        return $items->sum(function ($item) {
            $taxRate = $item->product?->tax?->percentage ?? 0;
            return ($item->qty * $item->price * $taxRate) / 100;
        });
    }

    private function createStoreRevenue(Order $order, int $storeId): void
    {
        $commissionRate = $order->store?->commission_rate ?? config('shofy.default_commission', 10);
        $commissionFee = ($order->sub_total * $commissionRate) / 100;

        $order->store?->revenues()->create([
            'order_id' => $order->id,
            'sub_amount' => $order->sub_total,
            'commission_fee' => $commissionFee,
            'current_balance' => $order->sub_total - $commissionFee,
            'status' => 'pending',
        ]);
    }
}
