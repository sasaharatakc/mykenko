<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\StoreRevenue;
use App\Models\Withdrawal;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private function store()
    {
        return auth()->user()->store;
    }

    public function stats()
    {
        $store = $this->store();

        if (!$store) {
            return response()->json(['message' => 'No store found.'], 404);
        }

        $thisMonth = now()->startOfMonth();

        return response()->json([
            'stats' => [
                'total_products' => Product::where('store_id', $store->id)->count(),
                'published_products' => Product::where('store_id', $store->id)->where('status', 'published')->count(),
                'total_orders' => Order::where('store_id', $store->id)->count(),
                'pending_orders' => Order::where('store_id', $store->id)->where('status', 'pending')->count(),
                'month_revenue' => StoreRevenue::where('store_id', $store->id)
                    ->where('created_at', '>=', $thisMonth)
                    ->sum('sub_amount'),
                'total_revenue' => StoreRevenue::where('store_id', $store->id)->sum('sub_amount'),
                'pending_balance' => StoreRevenue::where('store_id', $store->id)
                    ->where('status', 'pending')
                    ->sum('sub_amount'),
                'withdrawn_balance' => Withdrawal::where('store_id', $store->id)
                    ->where('status', 'approved')
                    ->sum('amount'),
            ],
            'store' => $store,
        ]);
    }

    public function recentOrders()
    {
        $store = $this->store();
        if (!$store) return response()->json(['message' => 'No store found.'], 404);

        $orders = Order::with(['customer:id,name,email'])
            ->where('store_id', $store->id)
            ->latest()
            ->limit(10)
            ->get(['id', 'code', 'status', 'payment_status', 'total_amount', 'customer_id', 'created_at']);

        return response()->json(['data' => $orders]);
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'method' => 'required|string',
            'details' => 'required|string',
        ]);

        $store = $this->store();
        if (!$store) return response()->json(['message' => 'No store found.'], 404);

        $available = StoreRevenue::where('store_id', $store->id)->where('status', 'pending')->sum('sub_amount');

        if ($request->amount > $available) {
            return response()->json(['message' => 'Insufficient balance.'], 422);
        }

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'amount' => $request->amount,
            'payment_channel' => $request->method,
            'description' => $request->details,
            'status' => 'pending',
        ]);

        return response()->json(['data' => $withdrawal], 201);
    }

    public function withdrawals()
    {
        $store = $this->store();
        if (!$store) return response()->json(['message' => 'No store found.'], 404);

        $withdrawals = Withdrawal::where('store_id', $store->id)->latest()->paginate(10);

        return response()->json([
            'data' => $withdrawals->items(),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page'    => $withdrawals->lastPage(),
                'total'        => $withdrawals->total(),
            ],
        ]);
    }
}
