<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Shipment;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    private function storeId(): int
    {
        return auth()->user()->store?->id ?? abort(404, 'No store found.');
    }

    public function index(Request $request)
    {
        $orders = Order::with(['customer:id,name,email'])
            ->withSum('products as item_count', 'qty')
            ->where('store_id', $this->storeId())
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('code', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order)
    {
        abort_unless($order->store_id === $this->storeId(), 403);

        $order->load([
            'customer',
            'products.product:id,name,slug,image',
            'shippingAddress',
            'payment',
            'shipment.histories',
        ]);

        return response()->json(['data' => $order]);
    }

    public function process(Order $order)
    {
        abort_unless($order->store_id === $this->storeId(), 403);
        abort_unless($order->status === 'pending', 422, 'Order cannot be processed.');

        $order->update(['status' => 'processing']);

        OrderHistory::create([
            'order_id' => $order->id,
            'action' => 'processing',
            'description' => 'Order is being processed.',
        ]);

        return response()->json(['data' => $order]);
    }

    public function ship(Request $request, Order $order)
    {
        abort_unless($order->store_id === $this->storeId(), 403);
        abort_unless(in_array($order->status, ['pending', 'processing']), 422, 'Order cannot be shipped.');

        $request->validate([
            'tracking_number' => 'nullable|string|max:100',
            'carrier' => 'nullable|string|max:100',
        ]);

        $shipment = Shipment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'tracking_id' => $request->tracking_number,
                'carrier' => $request->carrier,
                'status' => 'shipped',
            ]
        );

        $shipment->histories()->create([
            'action' => 'shipped',
            'description' => 'Order has been shipped' . ($request->carrier ? " via {$request->carrier}" : '') . '.',
        ]);

        $order->update(['status' => 'shipped']);

        OrderHistory::create([
            'order_id' => $order->id,
            'action' => 'shipped',
            'description' => 'Order shipped to customer.',
        ]);

        return response()->json(['data' => $order->load('shipment')]);
    }
}
