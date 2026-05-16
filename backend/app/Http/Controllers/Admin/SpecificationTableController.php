<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpecificationTable;
use App\Models\SpecificationGroup;
use App\Models\SpecificationAttribute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpecificationTableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tables = SpecificationTable::withCount('groups')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('name')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $tables->items(),
            'meta' => [
                'current_page' => $tables->currentPage(),
                'last_page'    => $tables->lastPage(),
                'total'        => $tables->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        $table = SpecificationTable::create($validated);

        return response()->json(['data' => $table->load('groups.attributes')], 201);
    }

    public function show(SpecificationTable $specificationTable): JsonResponse
    {
        $specificationTable->load(['groups' => fn($q) => $q->orderBy('order')->with(['attributes' => fn($q2) => $q2->orderBy('order')])]);

        return response()->json(['data' => $specificationTable]);
    }

    public function update(Request $request, SpecificationTable $specificationTable): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        $specificationTable->update($validated);

        return response()->json(['data' => $specificationTable]);
    }

    public function destroy(SpecificationTable $specificationTable): JsonResponse
    {
        $specificationTable->delete();
        return response()->json(['message' => 'Specification table deleted.']);
    }

    // — Group endpoints —

    public function storeGroup(Request $request, SpecificationTable $specificationTable): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $group = $specificationTable->groups()->create($validated);

        return response()->json(['data' => $group->load('attributes')], 201);
    }

    public function updateGroup(Request $request, SpecificationGroup $group): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $group->update($validated);

        return response()->json(['data' => $group]);
    }

    public function destroyGroup(SpecificationGroup $group): JsonResponse
    {
        $group->delete();
        return response()->json(['message' => 'Group deleted.']);
    }

    // — Attribute (row) endpoints —

    public function storeAttribute(Request $request, SpecificationGroup $group): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'value' => 'required|string|max:1000',
            'order' => 'nullable|integer',
        ]);

        $attribute = $group->attributes()->create($validated);

        return response()->json(['data' => $attribute], 201);
    }

    public function updateAttribute(Request $request, SpecificationAttribute $attribute): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'value' => 'sometimes|string|max:1000',
            'order' => 'nullable|integer',
        ]);

        $attribute->update($validated);

        return response()->json(['data' => $attribute]);
    }

    public function destroyAttribute(SpecificationAttribute $attribute): JsonResponse
    {
        $attribute->delete();
        return response()->json(['message' => 'Attribute deleted.']);
    }
}
