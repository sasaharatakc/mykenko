<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function index(): JsonResponse
    {
        $taxes = Tax::orderBy('priority')->get();
        return response()->json(['data' => $taxes]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'percentage' => 'required|numeric|min:0|max:100',
            'priority'   => 'nullable|integer|min:0',
            'status'     => 'nullable|in:published,draft',
        ]);
        $data['status']   = $data['status'] ?? 'published';
        $data['priority'] = $data['priority'] ?? 0;

        $tax = Tax::create($data);
        return response()->json(['data' => $tax], 201);
    }

    public function update(Request $request, Tax $tax): JsonResponse
    {
        $data = $request->validate([
            'title'      => 'sometimes|required|string|max:255',
            'percentage' => 'sometimes|required|numeric|min:0|max:100',
            'priority'   => 'nullable|integer|min:0',
            'status'     => 'nullable|in:published,draft',
        ]);
        $tax->update($data);
        return response()->json(['data' => $tax]);
    }

    public function destroy(Tax $tax): JsonResponse
    {
        $tax->delete();
        return response()->json(['message' => 'Tax deleted.']);
    }
}
