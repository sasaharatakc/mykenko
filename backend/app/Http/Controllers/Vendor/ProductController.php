<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    private function storeId(): int
    {
        return auth()->user()->store?->id ?? abort(404, 'No store found.');
    }

    public function index(Request $request)
    {
        $products = Product::with(['categories:id,name'])
            ->where('store_id', $this->storeId())
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
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
        abort_unless($product->store_id === $this->storeId(), 403);
        $product->load(['categories', 'variations.variationItems.attribute']);
        return response()->json(['data' => $product]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku',
            'quantity' => 'required|integer|min:0',
            'status' => 'required|in:published,draft',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids'       => 'nullable|array',
            'category_ids.*'     => 'exists:product_categories,id',
            'attribute_set_ids'  => 'nullable|array',
            'attribute_set_ids.*'=> 'exists:product_attribute_sets,id',
            'is_featured' => 'boolean',
            'weight'      => 'nullable|numeric|min:0',
            'image'       => 'nullable|image|max:4096',
            'image_url'   => 'nullable|url',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        } elseif (!empty($validated['image_url'])) {
            $validated['image'] = $validated['image_url'];
        }
        unset($validated['image_url']);

        $validated['store_id'] = $this->storeId();

        $product = Product::create($validated);

        if (!empty($validated['category_ids'])) {
            $product->categories()->sync($validated['category_ids']);
        }

        if ($request->has('attribute_set_ids')) {
            $product->attributeSets()->sync($request->attribute_set_ids ?? []);
        }

        Cache::forget('products.featured');
        Cache::forget('products.new_arrivals');
        Cache::forget('products.best_sellers');

        return response()->json(['data' => $product->load('categories', 'attributeSets')], 201);
    }

    public function update(Request $request, Product $product)
    {
        abort_unless($product->store_id === $this->storeId(), 403);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'quantity' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:published,draft',
            'brand_id' => 'nullable|exists:brands,id',
            'category_ids'       => 'nullable|array',
            'attribute_set_ids'  => 'nullable|array',
            'attribute_set_ids.*'=> 'exists:product_attribute_sets,id',
            'is_featured'        => 'boolean',
            'weight'             => 'nullable|numeric|min:0',
            'image'              => 'nullable|image|max:4096',
            'image_url'          => 'nullable|url',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        } elseif (!empty($validated['image_url'])) {
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

        return response()->json(['data' => $product->load('categories', 'attributeSets')]);
    }

    public function destroy(Product $product)
    {
        abort_unless($product->store_id === $this->storeId(), 403);
        $product->delete();

        Cache::forget('products.featured');
        Cache::forget('products.new_arrivals');
        Cache::forget('products.best_sellers');

        return response()->json(['message' => 'Product deleted.']);
    }
}
