<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['categories:id,name', 'brand:id,name', 'store:id,name'])
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->category, fn($q) => $q->whereHas('categories', fn($q) => $q->where('slug', $request->category)))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->store_id, fn($q) => $q->where('store_id', $request->store_id))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['categories', 'brand', 'store', 'variations.variationItems.attribute', 'attributeSets.attributes']);
        return response()->json(['data' => $product]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'content'       => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'sale_price'    => 'nullable|numeric|min:0',
            'sku'           => 'nullable|string|unique:products,sku',
            'quantity'      => 'required|integer|min:0',
            'status'        => 'required|in:published,draft,pending',
            'store_id'      => 'nullable|exists:stores,id',
            'brand_id'      => 'nullable|exists:brands,id',
            'tax_id'        => 'nullable|exists:taxes,id',
            'category_ids'       => 'nullable|array',
            'category_ids.*'     => 'exists:product_categories,id',
            'attribute_set_ids'      => 'nullable|array',
            'attribute_set_ids.*'    => 'exists:product_attribute_sets,id',
            'specification_table_id' => 'nullable|exists:specification_tables,id',
            'is_featured'   => 'boolean',
            'weight'        => 'nullable|numeric|min:0',
            'length'        => 'nullable|numeric|min:0',
            'width'         => 'nullable|numeric|min:0',
            'height'        => 'nullable|numeric|min:0',
            'image'         => 'nullable|image|max:4096',
            'image_url'     => 'nullable|url',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        } elseif ($request->image_url) {
            $validated['image'] = $request->image_url;
        }
        unset($validated['image_url']);

        $product = Product::create($validated);

        if ($request->category_ids) {
            $product->categories()->sync($request->category_ids);
        }

        if ($request->attribute_set_ids) {
            $product->attributeSets()->sync($request->attribute_set_ids);
        }

        Cache::forget('products.featured');
        Cache::forget('products.new_arrivals');
        Cache::forget('products.best_sellers');

        return response()->json(['data' => $product->load('categories', 'attributeSets')], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'content'     => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'sale_price'  => 'nullable|numeric|min:0',
            'sku'         => 'nullable|string|unique:products,sku,' . $product->id,
            'quantity'    => 'sometimes|integer|min:0',
            'status'      => 'sometimes|in:published,draft,pending',
            'store_id'    => 'nullable|exists:stores,id',
            'brand_id'    => 'nullable|exists:brands,id',
            'category_ids'           => 'nullable|array',
            'attribute_set_ids'      => 'nullable|array',
            'attribute_set_ids.*'    => 'exists:product_attribute_sets,id',
            'specification_table_id' => 'nullable|exists:specification_tables,id',
            'is_featured'            => 'boolean',
            'weight'                 => 'nullable|numeric|min:0',
            'image'                  => 'nullable|image|max:4096',
            'image_url'          => 'nullable|url',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        } elseif (array_key_exists('image_url', $validated) && $validated['image_url']) {
            $validated['image'] = $validated['image_url'];
        }
        unset($validated['image_url']);

        $product->update($validated);

        if (array_key_exists('category_ids', $validated)) {
            $product->categories()->sync($validated['category_ids'] ?? []);
        }

        if ($request->has('attribute_set_ids')) {
            $product->attributeSets()->sync($request->attribute_set_ids ?? []);
        }

        Cache::forget('products.featured');
        Cache::forget('products.new_arrivals');
        Cache::forget('products.best_sellers');

        return response()->json(['data' => $product->load('categories', 'brand', 'attributeSets')]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        Cache::forget('products.featured');
        Cache::forget('products.new_arrivals');
        Cache::forget('products.best_sellers');

        return response()->json(['message' => 'Product deleted.']);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array',
            'action' => 'required|in:publish,draft,delete',
        ]);

        $products = Product::whereIn('id', $request->ids);

        match ($request->action) {
            'publish' => $products->update(['status' => 'published']),
            'draft'   => $products->update(['status' => 'draft']),
            'delete'  => $products->delete(),
        };

        Cache::forget('products.featured');
        Cache::forget('products.new_arrivals');
        Cache::forget('products.best_sellers');

        return response()->json(['message' => 'Action applied.']);
    }
}
