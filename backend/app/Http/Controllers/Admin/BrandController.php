<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $brands = Brand::withCount('products')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%$s%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('order')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $brands->items(),
            'meta' => [
                'current_page' => $brands->currentPage(),
                'last_page'    => $brands->lastPage(),
                'total'        => $brands->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|unique:brands,slug',
            'description' => 'nullable|string',
            'website'     => 'nullable|url',
            'order'       => 'nullable|integer',
            'status'      => 'nullable|in:published,draft',
            'is_featured' => 'nullable|boolean',
            'logo'        => 'nullable|image|max:2048',
        ]);

        $data['slug']   = $data['slug'] ?? Str::slug($data['name']);
        $data['status'] = $data['status'] ?? 'published';
        unset($data['logo']); // exclude validation entry; handle file separately

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        }

        $brand = Brand::create($data);

        return response()->json(['data' => $brand->loadCount('products')], 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return response()->json(['data' => $brand->loadCount('products')]);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'slug'        => 'nullable|string|unique:brands,slug,' . $brand->id,
            'description' => 'nullable|string',
            'website'     => 'nullable|url',
            'order'       => 'nullable|integer',
            'status'      => 'nullable|in:published,draft',
            'is_featured' => 'nullable|boolean',
            'logo'        => 'nullable|image|max:2048',
        ]);

        unset($data['logo']);
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        }

        $brand->update($data);

        return response()->json(['data' => $brand->loadCount('products')]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete brand with products.'], 422);
        }

        $brand->delete();

        return response()->json(['message' => 'Brand deleted.']);
    }
}
