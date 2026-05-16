<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subscribers = Newsletter::query()
            ->when($request->search, fn ($q, $s) => $q->where('email', 'like', "%$s%"))
            ->when($request->status === 'active',       fn ($q) => $q->whereNull('unsubscribed_at'))
            ->when($request->status === 'unsubscribed', fn ($q) => $q->whereNotNull('unsubscribed_at'))
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $subscribers->items(),
            'meta' => [
                'current_page' => $subscribers->currentPage(),
                'last_page'    => $subscribers->lastPage(),
                'total'        => $subscribers->total(),
            ],
        ]);
    }

    public function destroy(Newsletter $newsletter): JsonResponse
    {
        $newsletter->delete();
        return response()->json(['message' => 'Subscriber deleted.']);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total'        => Newsletter::count(),
                'active'       => Newsletter::whereNull('unsubscribed_at')->count(),
                'unsubscribed' => Newsletter::whereNotNull('unsubscribed_at')->count(),
            ],
        ]);
    }
}
