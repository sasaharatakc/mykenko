<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()
            ->wishlists()
            ->with(['brand', 'labels'])
            ->withAvg('approvedReviews', 'star')
            ->withCount(['approvedReviews', 'variations'])
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => ProductResource::collection($items->items()),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $customerId = $request->user()->id;
        $productId = $request->product_id;

        $existing = Wishlist::where('customer_id', $customerId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['message' => 'Removed from wishlist.', 'wishlisted' => false]);
        }

        Wishlist::create(['customer_id' => $customerId, 'product_id' => $productId]);
        return response()->json(['message' => 'Added to wishlist.', 'wishlisted' => true]);
    }

    public function check(Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $wishlisted = Wishlist::where('customer_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->exists();

        return response()->json(['wishlisted' => $wishlisted]);
    }
}
