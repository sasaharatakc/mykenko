<?php

namespace App\Services;

use App\Models\Discount;

class DiscountService
{
    /**
     * Validate a coupon code and calculate the discount.
     *
     * @return array{valid: bool, discount_amount?: float, discount_type?: string, discount_value?: float, message?: string}
     */
    public function apply(string $code, float $subTotal): array
    {
        $discount = Discount::where('code', strtoupper($code))->first();

        if (! $discount) {
            return ['valid' => false, 'message' => 'Coupon code not found.'];
        }

        if (! $discount->isValid()) {
            return ['valid' => false, 'message' => 'This coupon has expired or is no longer active.'];
        }

        $minOrder = $discount->min_order_amount ?? 0;
        if ($minOrder > 0 && $subTotal < $minOrder) {
            return [
                'valid'   => false,
                'message' => "Minimum order amount of \${$minOrder} required.",
            ];
        }

        $discountAmount = $discount->calculateDiscount($subTotal);

        return [
            'valid'           => true,
            'discount_amount' => round($discountAmount, 2),
            'discount_type'   => $discount->type,
            'discount_value'  => (float) $discount->value,
            'code'            => $discount->code,
        ];
    }
}
