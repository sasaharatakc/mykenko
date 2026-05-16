<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $blogs = Blog::with(['categories:id,name', 'author:id,name'])
            ->when($request->search, fn($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $blogs->items(),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page'    => $blogs->lastPage(),
                'total'        => $blogs->total(),
            ],
        ]);
    }

    public function show(Blog $blog)
    {
        $blog->load(['categories', 'tags', 'author:id,name']);
        return response()->json(['data' => $blog]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string|max:500',
            'content'        => 'nullable|string',
            'status'         => 'required|in:published,draft',
            'is_featured'    => 'boolean',
            'published_at'   => 'nullable|date',
            'category_ids'   => 'nullable|array',
            'category_ids.*' => 'exists:blog_categories,id',
            'image'          => 'nullable|image|max:4096',
        ]);

        $validated['author_id'] = auth()->id();
        unset($validated['image']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('blog', 'public');
        }

        $blog = Blog::create($validated);

        if (!empty($validated['category_ids'])) {
            $blog->categories()->sync($validated['category_ids']);
        }

        return response()->json(['data' => $blog->load('categories')], 201);
    }

    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string|max:500',
            'content'      => 'nullable|string',
            'status'       => 'sometimes|in:published,draft',
            'is_featured'  => 'boolean',
            'published_at' => 'nullable|date',
            'category_ids' => 'nullable|array',
            'image'        => 'nullable|image|max:4096',
        ]);

        unset($validated['image']);
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('blog', 'public');
        }

        $blog->update($validated);

        if (array_key_exists('category_ids', $validated)) {
            $blog->categories()->sync($validated['category_ids'] ?? []);
        }

        return response()->json(['data' => $blog->load('categories')]);
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();
        return response()->json(['message' => 'Post deleted.']);
    }
}
