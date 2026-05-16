<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderDetailResource;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Notifications\OrderStatusChanged;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['customer:id,name,email', 'store:id,name'])
            ->withSum('products as item_count', 'qty')
            ->when($request->search, function ($q) use ($request) {
                $q->where('code', 'like', "%{$request->search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('email', 'like', "%{$request->search}%"));
            })
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->payment_status, fn($q) => $q->where('payment_status', $request->payment_status))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
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
        $order->load([
            'customer',
            'store',
            'products.product:id,name,slug,image',
            'products.review',
            'shippingAddress',
            'billingAddress',
            'payment',
            'shipment.histories',
            'histories',
            'invoice',
            'returns.items',
        ]);

        return response()->json(['data' => new OrderDetailResource($order)]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,completed,cancelled,refunded',
            'note' => 'nullable|string',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        OrderHistory::create([
            'order_id'    => $order->id,
            'action'      => $request->status,
            'description' => $request->note ?? "Status changed from {$oldStatus} to {$request->status}",
        ]);

        // Notify customer of status change
        if ($order->customer) {
            $order->customer->notify(new OrderStatusChanged($order));
        }

        return response()->json(['data' => $order]);
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,completed,failed,refunded',
        ]);

        $order->update(['payment_status' => $request->payment_status]);

        return response()->json(['data' => $order]);
    }

    public function export(Request $request)
    {
        $orders = Order::with(['customer:id,name,email'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->get();

        $headers = ['ID', '注文コード', '顧客名', 'メール', 'ステータス', '支払状況', '合計金額', '注文日'];
        $rows = $orders->map(fn($o) => [
            $o->id,
            $o->code,
            $o->customer?->name ?? '',
            $o->customer?->email ?? '',
            $o->status,
            $o->payment_status,
            $o->total_amount,
            $o->created_at->format('Y-m-d H:i'),
        ]);

        return $this->csvResponse('orders-export-' . now()->format('Ymd') . '.csv', $headers, $rows);
    }

    private function csvResponse(string $filename, array $headers, $rows)
    {
        $callback = function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM for Excel
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
