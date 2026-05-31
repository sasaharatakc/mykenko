<?php

namespace App\Observers;

use App\Models\AffiliateClick;
use App\Models\AffiliateConversion;
use App\Models\AffiliateProgram;
use App\Models\Order;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Request;

class OrderObserver
{
    public function created(Order $order): void
    {
        $ref = Request::cookie('mykenko_ref');
        if (!$ref) {
            return;
        }

        $program = AffiliateProgram::where('code', $ref)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$program) {
            return;
        }

        // Avoid duplicate conversion for the same order
        if (AffiliateConversion::where('order_id', $order->id)->exists()) {
            return;
        }

        $latestClick = AffiliateClick::where('ref_code', $ref)
            ->where('affiliate_program_id', $program->id)
            ->latest()
            ->first();

        $orderAmount = (float) ($order->total_amount ?? 0);
        $commission = $program->calculateCommission($orderAmount);

        AffiliateConversion::create([
            'affiliate_program_id' => $program->id,
            'affiliate_click_id'   => $latestClick?->id,
            'order_id'             => $order->id,
            'ref_code'             => $ref,
            'order_amount'         => $orderAmount,
            'commission_amount'    => $commission,
            'status'               => 'pending',
        ]);
    }
}
