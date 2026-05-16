<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductDetailResource;
use App\Services\ProductFilterService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function __construct(private ProductFilterService $filterService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'categories', 'labels', 'store'])
            ->published()
            ->withAvg('approvedReviews', 'star')
            ->withCount(['approvedReviews', 'variations']);

        // Search
        if ($search = $request->get('search')) {
            $query->search($search);
        }

        // Category filter
        if ($categorySlug = $request->get('category')) {
            $category = ProductCategory::where('slug', $categorySlug)->firstOrFail();
            $categoryIds = $this->filterService->getCategoryWithChildren($category->id);
            $query->whereHas('categories', fn($q) => $q->whereIn('product_categories.id', $categoryIds));
        }

        // Brand filter (by ID list or by slug)
        if ($brands = $request->get('brands')) {
            $query->whereIn('brand_id', explode(',', $brands));
        }
        if ($brandSlug = $request->get('brand_slug')) {
            $query->whereHas('brand', fn($q) => $q->where('slug', $brandSlug));
        }

        // Price range
        if ($minPrice = $request->get('min_price')) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->get('max_price')) {
            $query->where('price', '<=', $maxPrice);
        }

        // Rating filter
        if ($rating = $request->get('rating')) {
            $query->having('approved_reviews_avg_star', '>=', $rating);
        }

        // Stock filter
        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        // Featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Store filter
        if ($storeId = $request->get('store_id')) {
            $query->where('store_id', $storeId);
        }

        // Attribute filters
        if ($attributes = $request->get('attributes')) {
            foreach ($attributes as $attributeSetId => $attributeIds) {
                $ids = is_array($attributeIds) ? $attributeIds : explode(',', $attributeIds);
                $query->whereHas('variations.variationItems', function ($q) use ($attributeSetId, $ids) {
                    $q->whereHas('attribute', function ($q2) use ($attributeSetId, $ids) {
                        $q2->where('attribute_set_id', $attributeSetId)
                            ->whereIn('id', $ids);
                    });
                });
            }
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'price_asc'      => $query->orderBy('price'),
            'price_desc'     => $query->orderByDesc('price'),
            'best_selling'   => $query->orderByDesc('views'),
            'rating'         => $query->orderByDesc('approved_reviews_avg_star'),
            'oldest'         => $query->orderBy('created_at'),
            default          => $query->orderByDesc('created_at'),
        };

        $perPage = min($request->get('per_page', 24), 100);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with([
            'brand',
            'categories',
            'tags',
            'labels',
            'store',
            'tax',
            'attributeSets.attributes',
            'variations.product',
            'variations.variationItems.attribute',
            'approvedReviews.customer',
            'approvedReviews.replies',
            'specificationTable.groups.attributes',
            'options.values',
        ])
            ->withAvg('approvedReviews', 'star')
            ->withCount('approvedReviews')
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $product->increment('views');

        return response()->json(new ProductDetailResource($product));
    }

    public function related(string $slug): JsonResponse
    {
        $product = Product::published()->where('slug', $slug)->firstOrFail();

        $related = Product::with(['brand', 'labels'])
            ->published()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                $q->where('brand_id', $product->brand_id)
                  ->orWhereHas('categories', fn($q2) => $q2->whereIn(
                      'product_categories.id',
                      $product->categories->pluck('id')
                  ));
            })
            ->withAvg('approvedReviews', 'star')
            ->withCount(['approvedReviews', 'variations'])
            ->inRandomOrder()
            ->limit(8)
            ->get();

        return response()->json(['data' => ProductResource::collection($related)]);
    }

    public function featured(): JsonResponse
    {
        $products = Cache::remember('products.featured', 300, function () {
            return Product::with(['brand', 'labels'])
                ->published()
                ->featured()
                ->withAvg('approvedReviews', 'star')
                ->withCount(['approvedReviews', 'variations'])
                ->orderByDesc('created_at')
                ->limit(12)
                ->get();
        });

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function newArrivals(): JsonResponse
    {
        $products = Cache::remember('products.new_arrivals', 300, function () {
            return Product::with(['brand', 'labels'])
                ->published()
                ->withAvg('approvedReviews', 'star')
                ->withCount(['approvedReviews', 'variations'])
                ->orderByDesc('created_at')
                ->limit(12)
                ->get();
        });

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    public function bestSellers(): JsonResponse
    {
        $products = Cache::remember('products.best_sellers', 300, function () {
            return Product::with(['brand', 'labels'])
                ->published()
                ->withAvg('approvedReviews', 'star')
                ->withCount(['approvedReviews', 'variations'])
                ->orderByDesc('views')
                ->limit(12)
                ->get();
        });

        return response()->json(['data' => ProductResource::collection($products)]);
    }
}
