<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Http\Resources\BlogResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with(['author', 'categories', 'tags'])
            ->published();

        if ($search = $request->get('search')) {
            $query->where(fn($q) => $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        if ($categorySlug = $request->get('category')) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $categorySlug));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'popular' => $query->orderByDesc('views'),
            'oldest' => $query->orderBy('created_at'),
            default  => $query->orderByDesc('published_at'),
        };

        $posts = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => BlogResource::collection($posts->items()),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = Blog::with(['author', 'categories', 'tags'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $post->increment('views');

        $related = Blog::with(['author'])
            ->published()
            ->where('id', '!=', $post->id)
            ->whereHas('categories', fn($q) => $q->whereIn(
                'blog_categories.id',
                $post->categories->pluck('id')
            ))
            ->limit(4)
            ->get();

        return response()->json([
            'post' => new BlogResource($post),
            'related' => BlogResource::collection($related),
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = BlogCategory::withCount(['posts' => fn($q) => $q->published()])
            ->where('status', 'published')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }
}
