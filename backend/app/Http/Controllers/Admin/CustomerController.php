<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::withCount(['orders', 'reviews'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->when(isset($request->is_active), fn($q) => $q->where('is_active', $request->is_active))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page'    => $customers->lastPage(),
                'total'        => $customers->total(),
            ],
        ]);
    }

    public function show(Customer $customer)
    {
        $customer->load(['orders' => fn($q) => $q->latest()->limit(10), 'addresses']);
        $customer->loadCount(['orders', 'reviews', 'wishlists']);

        return response()->json(['data' => $customer]);
    }

    public function toggleStatus(Customer $customer)
    {
        $customer->update(['is_active' => !$customer->is_active]);
        return response()->json(['data' => $customer]);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted.']);
    }

    public function export()
    {
        $customers = Customer::withCount('orders')
            ->withSum('orders as total_spent', 'total_amount')
            ->latest()
            ->get();

        $headers = ['ID', '名前', 'メール', '電話', '注文数', '合計購入金額', '登録日', 'アクティブ'];
        $rows = $customers->map(fn($c) => [
            $c->id,
            $c->name,
            $c->email,
            $c->phone ?? '',
            $c->orders_count,
            $c->total_spent ?? 0,
            $c->created_at->format('Y-m-d'),
            $c->is_active ? '有効' : '無効',
        ]);

        $callback = function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        };

        $filename = 'customers-export-' . now()->format('Ymd') . '.csv';
        return response()->stream($callback, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
