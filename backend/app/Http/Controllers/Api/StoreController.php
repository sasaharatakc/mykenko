<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Store;
use App\Models\User;
use App\Http\Resources\StoreResource;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $stores = Store::verified()
            ->when($request->get('search'), fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->withCount('products')
            ->orderByDesc('rating')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => StoreResource::collection($stores->items()),
            'meta' => [
                'current_page' => $stores->currentPage(),
                'last_page' => $stores->lastPage(),
                'total' => $stores->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $store = Store::with(['owner'])
            ->withCount('products')
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(new StoreResource($store));
    }

    public function products(Request $request, string $slug): JsonResponse
    {
        $store = Store::where('slug', $slug)->firstOrFail();

        $products = $store->products()
            ->published()
            ->withAvg('approvedReviews', 'star')
            ->withCount(['approvedReviews', 'variations'])
            ->with(['brand', 'labels'])
            ->paginate($request->get('per_page', 24));

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:stores',
            'email'       => 'nullable|email',
            'phone'       => 'nullable|string',
            'address'     => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $authenticatable = $request->user();

        // ── Resolve vendor User ───────────────────────────────────────────
        // The endpoint accepts both customer and user (vendor/admin) tokens.
        // When a Customer calls this, we find or create a User record with
        // the same email and assign the vendor role so the store can be
        // owned by a proper entry in the `users` table.
        if ($authenticatable instanceof Customer) {
            $vendorUser = User::firstOrCreate(
                ['email' => $authenticatable->email],
                [
                    'name'     => $authenticatable->name,
                    'password' => Hash::make(Str::random(32)), // temporary; user can reset
                ]
            );

            if (! $vendorUser->hasRole('vendor')) {
                $vendorUser->assignRole('vendor');
            }
        } else {
            /** @var User $vendorUser */
            $vendorUser = $authenticatable;
        }

        if ($vendorUser->store) {
            return response()->json(['message' => 'You already have a store.'], 422);
        }

        $store = Store::create([
            ...$validated,
            'email'    => $validated['email'] ?? $vendorUser->email,
            'owner_id' => $vendorUser->id,
            'status'   => 'pending',
        ]);

        // Issue a user token so the frontend can immediately access /vendor
        $token = $vendorUser->createToken('vendor-api-token')->plainTextToken;

        return response()->json([
            'message' => 'Store registration submitted. Pending approval.',
            'store'   => new StoreResource($store),
            'token'   => $token,
            'user'    => [
                'id'     => $vendorUser->id,
                'name'   => $vendorUser->name,
                'email'  => $vendorUser->email,
                'avatar' => $vendorUser->avatar ?? null,
                'roles'  => $vendorUser->getRoleNames(),
            ],
        ], 201);
    }
}
