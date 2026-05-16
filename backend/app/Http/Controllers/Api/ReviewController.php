<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $reviews = Review::with(['customer', 'replies.user'])
            ->where('product_id', $request->product_id)
            ->approved()
            ->when($request->get('star'), fn($q, $s) => $q->where('star', $s))
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 10));

        $stats = Review::where('product_id', $request->product_id)
            ->approved()
            ->selectRaw('AVG(star) as avg, COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN star = 5 THEN 1 ELSE 0 END) as five_star')
            ->selectRaw('SUM(CASE WHEN star = 4 THEN 1 ELSE 0 END) as four_star')
            ->selectRaw('SUM(CASE WHEN star = 3 THEN 1 ELSE 0 END) as three_star')
            ->selectRaw('SUM(CASE WHEN star = 2 THEN 1 ELSE 0 END) as two_star')
            ->selectRaw('SUM(CASE WHEN star = 1 THEN 1 ELSE 0 END) as one_star')
            ->first();

        return response()->json([
            'data' => ReviewResource::collection($reviews->items()),
            'stats' => [
                'average' => round($stats->avg ?? 0, 1),
                'total' => $stats->total ?? 0,
                'distribution' => [
                    5 => $stats->five_star ?? 0,
                    4 => $stats->four_star ?? 0,
                    3 => $stats->three_star ?? 0,
                    2 => $stats->two_star ?? 0,
                    1 => $stats->one_star ?? 0,
                ],
            ],
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }
}
