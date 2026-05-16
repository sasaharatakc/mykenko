<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Shipment;
use App\Models\ShipmentHistory;
use App\Notifications\OrderShipped;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $shipments = Shipment::with(['order:id,code,status,customer_id', 'order.customer:id,name'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->carrier, fn($q) => $q->where('carrier', $request->carrier))
            ->when($request->search, function ($q) use ($request) {
                $q->where('tracking_id', 'like', "%{$request->search}%")
                  ->orWhereHas('order', fn($q) => $q->where('code', 'like', "%{$request->search}%"));
            })
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $shipments->items(),
            'meta' => [
                'current_page' => $shipments->currentPage(),
                'last_page'    => $shipments->lastPage(),
                'total'        => $shipments->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id'               => 'required|exists:orders,id',
            'tracking_id'            => 'nullable|string',
            'carrier'                => 'nullable|string',
            'shipping_method'        => 'nullable|string',
            'status'                 => 'sometimes|in:pending,picked_up,in_transit,out_for_delivery,delivered,failed',
            'estimated_delivery_date' => 'nullable|date',
            'note'                   => 'nullable|string',
        ]);

        $data['status'] = $data['status'] ?? 'pending';

        $shipment = Shipment::create($data);

        $order = Order::find($data['order_id']);

        if ($order && $order->status !== 'shipped') {
            $order->update(['status' => 'shipped']);

            OrderHistory::create([
                'order_id'    => $order->id,
                'action'      => 'shipped',
                'description' => 'Order marked as shipped after shipment was created.',
            ]);

            // Notify customer
            $order->load('customer');
            if ($order->customer) {
                $order->customer->notify(new OrderShipped(
                    $order,
                    $data['tracking_id'] ?? null,
                    $data['carrier'] ?? null,
                ));
            }
        }

        return response()->json(['data' => $shipment->load('order')], 201);
    }

    public function show(Shipment $shipment)
    {
        $shipment->load(['order.customer', 'histories']);

        return response()->json(['data' => $shipment]);
    }

    public function update(Request $request, Shipment $shipment)
    {
        $data = $request->validate([
            'tracking_id'            => 'nullable|string',
            'carrier'                => 'nullable|string',
            'shipping_method'        => 'nullable|string',
            'status'                 => 'sometimes|in:pending,picked_up,in_transit,out_for_delivery,delivered,failed',
            'estimated_delivery_date' => 'nullable|date',
            'note'                   => 'nullable|string',
        ]);

        $oldStatus = $shipment->status;
        $shipment->update($data);

        if (isset($data['status']) && $data['status'] === 'delivered' && $oldStatus !== 'delivered') {
            $order = $shipment->order;

            if ($order && $order->status !== 'delivered') {
                $order->update(['status' => 'delivered']);

                OrderHistory::create([
                    'order_id'    => $order->id,
                    'user_id'     => auth()->id(),
                    'action'      => 'delivered',
                    'description' => 'Order marked as delivered after shipment status updated to delivered.',
                ]);
            }
        }

        return response()->json(['data' => $shipment]);
    }

    public function addHistory(Request $request, Shipment $shipment)
    {
        $data = $request->validate([
            'action'      => 'required|string',
            'description' => 'required|string',
        ]);

        $history = ShipmentHistory::create([
            'shipment_id' => $shipment->id,
            'action'      => $data['action'],
            'description' => $data['description'],
            'user_id'     => auth()->id(),
        ]);

        return response()->json(['data' => $history], 201);
    }
}
