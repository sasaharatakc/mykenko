<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\StoreRevenue;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        $totalRevenue = Order::where(function ($q) {
            $q->where('status', 'completed')
              ->orWhere('payment_status', 'completed');
        })->sum('total_amount');

        $monthRevenue = Order::where('created_at', '>=', $thisMonth)
            ->where('payment_status', 'completed')
            ->sum('total_amount');

        $lastMonthRevenue = Order::whereBetween('created_at', [$lastMonth, $thisMonth])
            ->where('payment_status', 'completed')
            ->sum('total_amount');

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 100;

        return response()->json([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'month_revenue' => $monthRevenue,
                'revenue_growth' => $revenueGrowth,
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'total_customers' => Customer::count(),
                'new_customers_month' => Customer::where('created_at', '>=', $thisMonth)->count(),
                'total_products' => Product::count(),
                'out_of_stock' => Product::where('quantity', 0)->count(),
                'total_stores' => Store::count(),
                'pending_stores' => Store::where('is_verified', false)->count(),
            ],
        ]);
    }

    public function recentOrders()
    {
        $orders = Order::with(['customer:id,name,email', 'store:id,name'])
            ->latest()
            ->limit(10)
            ->get(['id', 'code', 'status', 'payment_status', 'total_amount', 'customer_id', 'store_id', 'created_at']);

        return response()->json(['data' => $orders]);
    }

    public function salesChart()
    {
        $data = Order::where('created_at', '>=', now()->subDays(30))
            ->where('payment_status', 'completed')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as revenue'), DB::raw('COUNT(*) as orders'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['data' => $data]);
    }
}
