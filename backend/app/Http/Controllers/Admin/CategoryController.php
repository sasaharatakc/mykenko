<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = ProductCategory::withCount('products')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->parent_id !== null, fn($q) => $q->where('parent_id', $request->parent_id ?: null))
            ->with('parent:id,name')
            ->orderBy('order')
            ->paginate($request->per_page ?? 20);

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'slug'             => 'nullable|string|unique:product_categories,slug',
            'description'      => 'nullable|string',
            'parent_id'        => 'nullable|exists:product_categories,id',
            'image'            => 'nullable|string',
            'icon'             => 'nullable|string',
            'order'            => 'nullable|integer',
            'status'           => 'nullable|in:published,draft',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        $category = ProductCategory::create($validated);

        return response()->json(['data' => $category], 201);
    }

    public function show(ProductCategory $category)
    {
        $category->load('parent', 'children');
        $category->loadCount('products');
        return response()->json(['data' => $category]);
    }

    public function update(Request $request, ProductCategory $category)
    {
        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'slug'             => 'sometimes|string|unique:product_categories,slug,' . $category->id,
            'description'      => 'nullable|string',
            'parent_id'        => 'nullable|exists:product_categories,id',
            'image'            => 'nullable|string',
            'icon'             => 'nullable|string',
            'order'            => 'nullable|integer',
            'status'           => 'nullable|in:published,draft',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        $category->update($validated);
        Cache::forget('categories.index');
        Cache::forget('categories.tree');

        return response()->json(['data' => $category]);
    }

    public function destroy(ProductCategory $category)
    {
        if ($category->children()->exists()) {
            return response()->json(['message' => 'Cannot delete a category that has subcategories.'], 422);
        }

        if ($category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete a category that has products assigned to it.'], 422);
        }

        $category->delete();
        Cache::forget('categories.index');
        Cache::forget('categories.tree');

        return response()->json(['message' => 'Category deleted.']);
    }
}
