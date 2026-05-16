<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderReturn;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = OrderReturn::with([
            'order:id,code',
            'customer:id,name,email',
            'items',
        ])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $returns->items(),
            'meta' => [
                'current_page' => $returns->currentPage(),
                'last_page'    => $returns->lastPage(),
                'total'        => $returns->total(),
            ],
        ]);
    }

    public function show(OrderReturn $return)
    {
        $return->load([
            'order.products',
            'customer',
            'items.orderProduct.product:id,name,image',
        ]);

        return response()->json(['data' => $return]);
    }

    public function update(Request $request, OrderReturn $return)
    {
        $data = $request->validate([
            'status'        => 'required|in:pending,processing,approved,rejected,completed',
            'note'          => 'nullable|string',
            'refund_amount' => 'nullable|numeric',
        ]);

        $updates = ['status' => $data['status']];

        if (isset($data['note'])) {
            $updates['note'] = $data['note'];
        }

        if (isset($data['refund_amount'])) {
            $updates['refund_amount'] = $data['refund_amount'];
        }

        if ($data['status'] === 'approved') {
            // status already set above; no extra action needed beyond saving
        }

        if ($data['status'] === 'completed') {
            // Restock: increment product stock for each return item
            $return->load('items.product');
            foreach ($return->items as $item) {
                if ($item->product) {
                    $item->product->increment('quantity', $item->quantity ?? $item->qty ?? 1);
                }
            }
        }

        if ($data['status'] === 'rejected') {
            $updates['cancel_reason'] = $data['note'] ?? null;
        }

        $return->update($updates);

        return response()->json(['data' => $return]);
    }
}
