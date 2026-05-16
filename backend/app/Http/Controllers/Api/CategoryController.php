<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories.index', 600, fn () =>
            ProductCategory::with('children')
                ->published()
                ->root()
                ->orderBy('order')
                ->get()
        );

        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function tree(): JsonResponse
    {
        $categories = Cache::remember('categories.tree', 600, fn () =>
            ProductCategory::with('allChildren')
                ->published()
                ->root()
                ->orderBy('order')
                ->get()
        );

        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = ProductCategory::with(['children', 'parent'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(new CategoryResource($category));
    }
}
