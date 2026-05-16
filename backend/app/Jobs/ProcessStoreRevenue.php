<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\StoreRevenue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessStoreRevenue implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function handle(): void
    {
        $order = $this->order->load('store');

        if (! $order->store) return;

        $commissionRate = $order->store->commission_rate ?? config('shofy.default_commission', 10);
        $commissionFee = ($order->sub_total * $commissionRate) / 100;
        $balance = $order->sub_total - $commissionFee;

        StoreRevenue::updateOrCreate(
            ['order_id' => $order->id, 'store_id' => $order->store_id],
            [
                'sub_amount'      => $order->sub_total,
                'commission_fee'  => $commissionFee,
                'current_balance' => $balance,
                'status'          => 'pending',
            ]
        );
    }
}
