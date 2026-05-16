<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderDetailResource;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['products', 'shippingAddress', 'payment', 'store'])
            ->where('customer_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, string $code): JsonResponse
    {
        $order = Order::with([
            'products.product',
            'products.review',
            'shippingAddress',
            'billingAddress',
            'payment',
            'shipment.histories',
            'histories',
            'invoice',
            'returns.items',
            'store',
        ])
            ->where('customer_id', $request->user()->id)
            ->where('code', $code)
            ->firstOrFail();

        return response()->json(new OrderDetailResource($order));
    }

    public function track(string $code, string $token): JsonResponse
    {
        $order = Order::with(['products.product', 'shippingAddress', 'shipment.histories', 'histories'])
            ->where('code', $code)
            ->where('token', $token)
            ->firstOrFail();

        return response()->json(new OrderDetailResource($order));
    }

    public function trackByEmail(Request $request): JsonResponse
    {
        $request->validate([
            'code'  => 'required|string',
            'email' => 'required|email',
        ]);

        $order = Order::with(['products.product', 'shippingAddress', 'shipment', 'histories'])
            ->where('code', $request->code)
            ->whereHas('customer', fn ($q) => $q->where('email', $request->email))
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(new OrderDetailResource($order));
    }

    public function cancel(Request $request, string $code): JsonResponse
    {
        $order = Order::where('customer_id', $request->user()->id)
            ->where('code', $code)
            ->firstOrFail();

        if (! $order->canCancel()) {
            return response()->json(['message' => 'This order cannot be cancelled.'], 422);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->reason ?: 'Cancelled by customer',
        ]);

        // Restock products
        foreach ($order->products as $item) {
            if ($item->restock_quantity_when_cancelled && $item->product) {
                $item->product->increment('quantity', $item->qty);
            }
        }

        return response()->json(['message' => 'Order cancelled successfully.', 'order' => new OrderResource($order)]);
    }

    public function requestReturn(Request $request, string $code): JsonResponse
    {
        $order = Order::where('customer_id', $request->user()->id)
            ->where('code', $code)
            ->firstOrFail();

        if (! $order->canReturn()) {
            return response()->json(['message' => 'This order is not eligible for return.'], 422);
        }

        $validated = $request->validate([
            'return_reason' => 'required|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.order_product_id' => 'required|exists:order_products,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        $return = $order->returns()->create([
            'customer_id' => $request->user()->id,
            'store_id' => $order->store_id,
            'return_reason' => $validated['return_reason'],
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            $orderProduct = $order->products()->find($item['order_product_id']);
            if ($orderProduct) {
                $return->items()->create([
                    'order_product_id' => $item['order_product_id'],
                    'product_id' => $orderProduct->product_id,
                    'qty' => $item['qty'],
                ]);
            }
        }

        return response()->json(['message' => 'Return request submitted.'], 201);
    }

    public function review(Request $request, string $code): JsonResponse
    {
        $order = Order::where('customer_id', $request->user()->id)
            ->where('code', $code)
            ->where('status', 'completed')
            ->firstOrFail();

        $validated = $request->validate([
            'order_product_id' => 'required|exists:order_products,id',
            'star' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:2048',
        ]);

        $orderProduct = $order->products()->with('product')->find($validated['order_product_id']);

        if (! $orderProduct) {
            return response()->json(['message' => 'Order product not found.'], 404);
        }

        $existing = \App\Models\Review::where('customer_id', $request->user()->id)
            ->where('order_product_id', $validated['order_product_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this item.'], 422);
        }

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $images[] = $file->store('reviews', 'public');
            }
        }

        $review = \App\Models\Review::create([
            'customer_id' => $request->user()->id,
            'product_id' => $orderProduct->product_id,
            'store_id' => $order->store_id,
            'order_product_id' => $validated['order_product_id'],
            'star' => $validated['star'],
            'comment' => $validated['comment'] ?? null,
            'images' => $images,
            'status' => 'approved',
        ]);

        return response()->json(['message' => 'Review submitted.', 'data' => $review], 201);
    }

    public function downloadInvoice(Request $request, string $code)
    {
        $order = Order::with(['customer', 'products', 'shippingAddress'])
            ->where('code', $code)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.invoice', ['order' => $order])
            ->setPaper('a4', 'portrait');

        $filename = 'invoice-' . str_pad($order->id, 6, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($filename);
    }
}
