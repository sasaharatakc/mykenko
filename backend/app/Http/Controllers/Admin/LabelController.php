<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(): JsonResponse
    {
        $labels = ProductLabel::withCount('products')->get();
        return response()->json(['data' => $labels]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:100',
            'color'  => 'nullable|string|max:20',
            'status' => 'nullable|in:published,draft',
        ]);
        $data['status'] = $data['status'] ?? 'published';
        $data['color']  = $data['color'] ?? '#0989FF';

        $label = ProductLabel::create($data);
        return response()->json(['data' => $label->loadCount('products')], 201);
    }

    public function update(Request $request, ProductLabel $label): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'sometimes|required|string|max:100',
            'color'  => 'nullable|string|max:20',
            'status' => 'nullable|in:published,draft',
        ]);
        $label->update($data);
        return response()->json(['data' => $label->loadCount('products')]);
    }

    public function destroy(ProductLabel $label): JsonResponse
    {
        $label->products()->detach();
        $label->delete();
        return response()->json(['message' => 'Label deleted.']);
    }
}
