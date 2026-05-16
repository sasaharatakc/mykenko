<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $brands = Brand::published()
            ->withCount(['products' => fn($q) => $q->published()])
            ->when($request->boolean('featured'), fn($q) => $q->where('is_featured', true))
            ->orderBy('order')
            ->get();

        return response()->json($brands);
    }

    public function show(string $slug): JsonResponse
    {
        $brand = Brand::published()->where('slug', $slug)->firstOrFail();
        return response()->json($brand);
    }
}
