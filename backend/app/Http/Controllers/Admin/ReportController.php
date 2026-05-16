<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $period = (int) $request->get('period', 30);
        $from   = now()->subDays($period);
        $prevFrom = now()->subDays($period * 2);

        $revenue = Order::where('payment_status', 'completed')
            ->where('created_at', '>=', $from)
            ->sum('total_amount');

        $revenuePrev = Order::where('payment_status', 'completed')
            ->whereBetween('created_at', [$prevFrom, $from])
            ->sum('total_amount');

        $orders = Order::where('created_at', '>=', $from)->count();

        $ordersPrev = Order::whereBetween('created_at', [$prevFrom, $from])->count();

        $newCustomers = Customer::where('created_at', '>=', $from)->count();

        $avgOrder = $orders > 0 ? round($revenue / $orders, 2) : 0;

        $revenueGrowth = $revenuePrev > 0
            ? round((($revenue - $revenuePrev) / $revenuePrev) * 100, 1)
            : 0;

        $ordersGrowth = $ordersPrev > 0
            ? round((($orders - $ordersPrev) / $ordersPrev) * 100, 1)
            : 0;

        return response()->json([
            'data' => [
                'revenue'         => round($revenue, 2),
                'revenue_growth'  => $revenueGrowth,
                'orders'          => $orders,
                'orders_growth'   => $ordersGrowth,
                'new_customers'   => $newCustomers,
                'avg_order'       => $avgOrder,
            ],
        ]);
    }

    public function salesChart(Request $request): JsonResponse
    {
        $period = (int) $request->get('period', 30);

        $rows = Order::where('payment_status', 'completed')
            ->where('created_at', '>=', now()->subDays($period))
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $data = [];
        for ($i = $period - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $label = now()->subDays($i)->format('M d');
            $data[] = [
                'date'    => $label,
                'revenue' => isset($rows[$date]) ? round($rows[$date]->revenue, 2) : 0,
                'orders'  => isset($rows[$date]) ? (int) $rows[$date]->orders : 0,
            ];
        }

        return response()->json(['data' => $data]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $period = (int) $request->get('period', 30);

        $products = DB::table('order_products')
            ->join('orders', 'orders.id', '=', 'order_products.order_id')
            ->join('products', 'products.id', '=', 'order_products.product_id')
            ->where('orders.created_at', '>=', now()->subDays($period))
            ->where('orders.payment_status', 'completed')
            ->select(
                'products.id',
                'products.name',
                'products.image as thumbnail',
                DB::raw('SUM(order_products.qty) as total_qty'),
                DB::raw('SUM(order_products.sub_total) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return response()->json(['data' => $products]);
    }

    public function ordersByStatus(Request $request): JsonResponse
    {
        $period = (int) $request->get('period', 30);

        $data = Order::where('created_at', '>=', now()->subDays($period))
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => ['status' => $row->status, 'count' => (int) $row->count]);

        return response()->json(['data' => $data]);
    }
}
