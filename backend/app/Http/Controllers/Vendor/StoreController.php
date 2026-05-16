<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $store = $request->user()->store;

        if (! $store) {
            return response()->json(['message' => 'No store found for this user.'], 404);
        }

        return response()->json(['data' => new StoreResource($store)]);
    }

    public function update(Request $request): JsonResponse
    {
        $store = $request->user()->store;

        if (! $store) {
            return response()->json(['message' => 'No store found for this user.'], 404);
        }

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:191',
            'description' => 'nullable|string',
            'phone'       => 'nullable|string|max:30',
            'email'       => 'nullable|email|max:191',
            'address'     => 'nullable|string|max:500',
            'city'        => 'nullable|string|max:100',
            'state'       => 'nullable|string|max:100',
            'country'     => 'nullable|string|max:100',
        ]);

        $store->update($validated);

        return response()->json(['data' => new StoreResource($store->fresh())]);
    }
}
