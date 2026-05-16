<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\Withdrawal;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $stores = Store::with('owner:id,name,email')
            ->withCount(['products', 'orders'])
            ->withSum('revenues', 'sub_amount')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when(isset($request->is_verified), fn($q) => $q->where('is_verified', $request->is_verified))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $stores->items(),
            'meta' => [
                'current_page' => $stores->currentPage(),
                'last_page'    => $stores->lastPage(),
                'total'        => $stores->total(),
            ],
        ]);
    }

    public function show(Store $store)
    {
        $store->load(['owner:id,name,email', 'revenues' => fn($q) => $q->latest()->limit(10)])
              ->loadCount(['products', 'orders'])
              ->loadSum('revenues', 'sub_amount');

        return response()->json(['data' => $store]);
    }

    public function verify(Store $store)
    {
        $store->update(['is_verified' => true]);
        return response()->json(['data' => $store]);
    }

    public function unverify(Store $store)
    {
        $store->update(['is_verified' => false]);
        return response()->json(['data' => $store]);
    }

    public function updateCommission(Request $request, Store $store)
    {
        $request->validate(['commission_rate' => 'required|numeric|min:0|max:100']);
        $store->update(['commission_rate' => $request->commission_rate]);
        return response()->json(['data' => $store]);
    }

    public function withdrawals(Request $request)
    {
        $withdrawals = Withdrawal::with('store:id,name')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $withdrawals->items(),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page'    => $withdrawals->lastPage(),
                'total'        => $withdrawals->total(),
            ],
        ]);
    }

    public function processWithdrawal(Request $request, Withdrawal $withdrawal)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,completed',
            'note' => 'nullable|string',
        ]);

        $withdrawal->update([
            'status' => $request->status,
            'note' => $request->note,
            'processed_at' => now(),
        ]);

        return response()->json(['data' => $withdrawal]);
    }
}
