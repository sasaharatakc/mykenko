<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;

class FlashSaleController extends Controller
{
    public function active(): JsonResponse
    {
        $flashSale = FlashSale::active()
            ->with(['products' => function ($q) {
                $q->published()
                    ->withAvg('approvedReviews', 'star')
                    ->withCount(['approvedReviews', 'variations'])
                    ->with(['brand', 'labels']);
            }])
            ->first();

        if (! $flashSale) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'id' => $flashSale->id,
                'name' => $flashSale->name,
                'ends_at' => $flashSale->end_date,
                'remaining_seconds' => $flashSale->remaining_time,
                'products' => $flashSale->products->map(function ($product) {
                    $pivot = $product->pivot;
                    $data = new ProductResource($product);
                    return array_merge($data->resolve(), [
                        'flash_sale_price' => $pivot->price,
                        'flash_sale_quantity' => $pivot->quantity,
                        'flash_sale_sold' => $pivot->sold,
                    ]);
                }),
            ],
        ]);
    }
}
