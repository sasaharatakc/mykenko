<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Http\Resources\CartItemResource;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->cartService->getCart($request);
        return response()->json([
            'items' => CartItemResource::collection($items),
            'summary' => $this->cartService->getSummary($items),
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1|max:100',
            'variation_id' => 'nullable|exists:product_variations,id',
            'options' => 'nullable|array',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->status !== 'published') {
            return response()->json(['message' => 'Product is not available.'], 422);
        }

        if ($product->stock_status === 'out_of_stock' && ! $product->allow_checkout_when_out_of_stock) {
            return response()->json(['message' => 'This product is out of stock.'], 422);
        }

        if ($product->with_storehouse_management
            && $product->quantity < $validated['qty']
            && ! $product->allow_checkout_when_out_of_stock) {
            return response()->json(['message' => 'Insufficient stock.'], 422);
        }

        if ($product->minimum_order_quantity && $validated['qty'] < $product->minimum_order_quantity) {
            return response()->json(['message' => "Minimum order quantity is {$product->minimum_order_quantity}."], 422);
        }

        if ($product->maximum_order_quantity && $validated['qty'] > $product->maximum_order_quantity) {
            return response()->json(['message' => "Maximum order quantity is {$product->maximum_order_quantity}."], 422);
        }

        $price = $product->current_price;

        if ($validated['variation_id'] ?? null) {
            $variation = ProductVariation::with('product')->find($validated['variation_id']);
            if ($variation && $variation->product) {
                $price = $variation->product->current_price;
            }
        }

        $item = $this->cartService->addItem($request, [
            'product_id' => $product->id,
            'variation_id' => $validated['variation_id'] ?? null,
            'qty' => $validated['qty'],
            'price' => $price,
            'store_id' => $product->store_id,
            'options' => $validated['options'] ?? [],
        ]);

        $items = $this->cartService->getCart($request);

        return response()->json([
            'message' => 'Item added to cart.',
            'items' => CartItemResource::collection($items),
            'summary' => $this->cartService->getSummary($items),
        ]);
    }

    public function update(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate([
            'qty' => 'required|integer|min:1|max:100',
        ]);

        $item = $this->cartService->findItem($request, $itemId);

        if (! $item) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $item->update(['qty' => $validated['qty']]);

        $items = $this->cartService->getCart($request);
        return response()->json([
            'message' => 'Cart updated.',
            'items' => CartItemResource::collection($items),
            'summary' => $this->cartService->getSummary($items),
        ]);
    }

    public function remove(Request $request, int $itemId): JsonResponse
    {
        $item = $this->cartService->findItem($request, $itemId);

        if (! $item) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $item->delete();

        $items = $this->cartService->getCart($request);
        return response()->json([
            'message' => 'Item removed from cart.',
            'items' => CartItemResource::collection($items),
            'summary' => $this->cartService->getSummary($items),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->cartService->clearCart($request);
        return response()->json(['message' => 'Cart cleared.', 'items' => [], 'summary' => $this->cartService->getEmptySummary()]);
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $items = $this->cartService->getCart($request);
        $summary = $this->cartService->getSummary($items);
        $result = $this->cartService->applyCoupon($request->code, $summary['sub_total']);

        if (! $result['valid']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => 'Coupon applied.',
            'discount' => $result['discount'],
            'coupon' => $result['coupon'],
        ]);
    }
}
