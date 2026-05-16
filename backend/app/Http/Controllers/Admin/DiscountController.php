<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $discounts = Discount::query()
            ->when($request->search, fn ($q, $s) => $q->where('code', 'like', "%$s%")
                ->orWhere('description', 'like', "%$s%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $discounts->items(),
            'meta' => [
                'current_page' => $discounts->currentPage(),
                'last_page'    => $discounts->lastPage(),
                'total'        => $discounts->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'             => 'required|string|unique:discounts,code|max:50',
            'description'      => 'nullable|string',
            'type'             => 'required|in:percentage,fixed',
            'value'            => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses'         => 'nullable|integer|min:1',
            'starts_at'        => 'nullable|date',
            'expires_at'       => 'nullable|date|after_or_equal:starts_at',
            'status'           => 'nullable|in:published,draft',
        ]);

        $data['status'] = $data['status'] ?? 'published';
        $data['uses']   = 0;
        $data['code']   = strtoupper($data['code']);

        $discount = Discount::create($data);

        return response()->json(['data' => $discount], 201);
    }

    public function show(Discount $discount): JsonResponse
    {
        return response()->json(['data' => $discount]);
    }

    public function update(Request $request, Discount $discount): JsonResponse
    {
        $data = $request->validate([
            'code'             => 'sometimes|required|string|unique:discounts,code,' . $discount->id . '|max:50',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|required|in:percentage,fixed',
            'value'            => 'sometimes|required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses'         => 'nullable|integer|min:1',
            'starts_at'        => 'nullable|date',
            'expires_at'       => 'nullable|date',
            'status'           => 'nullable|in:published,draft',
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $discount->update($data);

        return response()->json(['data' => $discount]);
    }

    public function destroy(Discount $discount): JsonResponse
    {
        $discount->delete();

        return response()->json(['message' => 'Discount deleted.']);
    }
}
