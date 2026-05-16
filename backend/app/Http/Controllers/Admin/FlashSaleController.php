<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashSaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sales = FlashSale::withCount('products')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page'    => $sales->lastPage(),
                'total'        => $sales->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after:start_date',
            'status'      => 'nullable|in:published,draft',
            'is_featured' => 'nullable|boolean',
        ]);

        $data['status'] = $data['status'] ?? 'draft';

        $sale = FlashSale::create($data);

        return response()->json(['data' => $sale->loadCount('products')], 201);
    }

    public function show(FlashSale $flashSale): JsonResponse
    {
        $flashSale->load(['products' => fn ($q) => $q->select('products.id', 'name', 'slug', 'price', 'image')]);

        return response()->json(['data' => $flashSale]);
    }

    public function update(Request $request, FlashSale $flashSale): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'start_date'  => 'sometimes|required|date',
            'end_date'    => 'sometimes|required|date',
            'status'      => 'nullable|in:published,draft',
            'is_featured' => 'nullable|boolean',
        ]);

        $flashSale->update($data);

        return response()->json(['data' => $flashSale->loadCount('products')]);
    }

    public function destroy(FlashSale $flashSale): JsonResponse
    {
        $flashSale->products()->detach();
        $flashSale->delete();

        return response()->json(['message' => 'Flash sale deleted.']);
    }

    public function addProduct(Request $request, FlashSale $flashSale): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'price'      => 'required|numeric|min:0',
            'quantity'   => 'nullable|integer|min:1',
        ]);

        $flashSale->products()->syncWithoutDetaching([
            $data['product_id'] => [
                'price'    => $data['price'],
                'quantity' => $data['quantity'] ?? 50,
                'sold'     => 0,
            ],
        ]);

        return response()->json(['message' => 'Product added to flash sale.']);
    }

    public function removeProduct(Request $request, FlashSale $flashSale): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $flashSale->products()->detach($data['product_id']);

        return response()->json(['message' => 'Product removed from flash sale.']);
    }
}
