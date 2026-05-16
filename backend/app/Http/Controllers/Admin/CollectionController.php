<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $collections = ProductCollection::withCount('products')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%$s%"))
            ->orderBy('order')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $collections->items(),
            'meta' => ['current_page' => $collections->currentPage(), 'last_page' => $collections->lastPage(), 'total' => $collections->total()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:product_collections,slug',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:published,draft',
            'is_featured' => 'nullable|boolean',
            'order'       => 'nullable|integer',
        ]);
        $data['slug']   = $data['slug'] ?? Str::slug($data['name']);
        $data['status'] = $data['status'] ?? 'published';

        $col = ProductCollection::create($data);
        return response()->json(['data' => $col->loadCount('products')], 201);
    }

    public function update(Request $request, ProductCollection $collection): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => 'nullable|string|unique:product_collections,slug,' . $collection->id,
            'description' => 'nullable|string',
            'status'      => 'nullable|in:published,draft',
            'is_featured' => 'nullable|boolean',
            'order'       => 'nullable|integer',
        ]);
        $collection->update($data);
        return response()->json(['data' => $collection->loadCount('products')]);
    }

    public function destroy(ProductCollection $collection): JsonResponse
    {
        $collection->delete();
        return response()->json(['message' => 'Collection deleted.']);
    }
}
