<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductAttributeSet;
use App\Models\ProductAttribute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeSetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sets = ProductAttributeSet::withCount('attributes')
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%$s%"))
            ->orderBy('order')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $sets->items(),
            'meta' => [
                'current_page' => $sets->currentPage(),
                'last_page'    => $sets->lastPage(),
                'total'        => $sets->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'slug'           => 'nullable|string|unique:product_attribute_sets,slug',
            'display_layout' => 'nullable|in:dropdown,button,color,image',
            'order'          => 'nullable|integer',
            'status'         => 'nullable|in:published,draft',
            'is_searchable'  => 'nullable|boolean',
        ]);

        $data['slug']           = $data['slug'] ?? Str::slug($data['title']);
        $data['display_layout'] = $data['display_layout'] ?? 'button';
        $data['status']         = $data['status'] ?? 'published';

        $set = ProductAttributeSet::create($data);

        return response()->json(['data' => $set->loadCount('attributes')], 201);
    }

    public function show(ProductAttributeSet $attributeSet): JsonResponse
    {
        return response()->json(['data' => $attributeSet->load('attributes')]);
    }

    public function update(Request $request, ProductAttributeSet $attributeSet): JsonResponse
    {
        $data = $request->validate([
            'title'          => 'sometimes|required|string|max:255',
            'slug'           => 'nullable|string|unique:product_attribute_sets,slug,' . $attributeSet->id,
            'display_layout' => 'nullable|in:dropdown,button,color,image',
            'order'          => 'nullable|integer',
            'status'         => 'nullable|in:published,draft',
            'is_searchable'  => 'nullable|boolean',
        ]);

        $attributeSet->update($data);

        return response()->json(['data' => $attributeSet->loadCount('attributes')]);
    }

    public function destroy(ProductAttributeSet $attributeSet): JsonResponse
    {
        if ($attributeSet->attributes()->count() > 0) {
            return response()->json(['message' => 'このアトリビュートセットには属性値が存在します。先に削除してください。'], 422);
        }

        $attributeSet->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    // ── Attribute values within a set ─────────────────────────────────────

    public function attributes(ProductAttributeSet $attributeSet): JsonResponse
    {
        return response()->json(['data' => $attributeSet->attributes()->orderBy('order')->get()]);
    }

    public function storeAttribute(Request $request, ProductAttributeSet $attributeSet): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'color' => 'nullable|string|max:20',
            'order' => 'nullable|integer',
        ]);

        $data['attribute_set_id'] = $attributeSet->id;
        $data['slug']             = Str::slug($data['title'] . '-' . $attributeSet->id . '-' . time());

        $attr = ProductAttribute::create($data);
        return response()->json(['data' => $attr], 201);
    }

    public function updateAttribute(Request $request, ProductAttributeSet $attributeSet, ProductAttribute $attribute): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'color' => 'nullable|string|max:20',
            'order' => 'nullable|integer',
        ]);

        $attribute->update($data);
        return response()->json(['data' => $attribute]);
    }

    public function destroyAttribute(ProductAttributeSet $attributeSet, ProductAttribute $attribute): JsonResponse
    {
        $attribute->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
