<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductTagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = ProductTag::withCount('products')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%$s%"))
            ->latest()
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'data' => $tags->items(),
            'meta' => ['current_page' => $tags->currentPage(), 'last_page' => $tags->lastPage(), 'total' => $tags->total()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:255',
            'slug'   => 'nullable|string|unique:product_tags,slug',
            'status' => 'nullable|in:published,draft',
        ]);
        $data['slug']   = $data['slug'] ?? Str::slug($data['name']);
        $data['status'] = $data['status'] ?? 'published';

        $tag = ProductTag::create($data);
        return response()->json(['data' => $tag->loadCount('products')], 201);
    }

    public function update(Request $request, ProductTag $productTag): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'sometimes|required|string|max:255',
            'slug'   => 'nullable|string|unique:product_tags,slug,' . $productTag->id,
            'status' => 'nullable|in:published,draft',
        ]);
        $productTag->update($data);
        return response()->json(['data' => $productTag->loadCount('products')]);
    }

    public function destroy(ProductTag $productTag): JsonResponse
    {
        $productTag->delete();
        return response()->json(['message' => 'Tag deleted.']);
    }
}
