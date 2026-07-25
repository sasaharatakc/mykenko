<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

/**
 * IngredientLinkController
 *
 * 商品に含まれる成分について mykenko.jp (media app) の成分ページ URL を返す。
 * 商品ページから「この成分についてくわしく知る → mykenko.jp」のリンクを生成するために使用。
 *
 * GET /api/v1/products/{slug}/ingredient-links
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "name": "フィナステリド",
 *       "slug": "finasteride",
 *       "url": "https://mykenko.jp/ingredients/finasteride/",
 *       "evidenceLevel": "A"
 *     }
 *   ]
 * }
 */
class IngredientLinkController extends Controller
{
    private const MEDIA_API_BASE = 'https://mykenko.jp';
    private const CACHE_TTL = 3600; // 1時間キャッシュ

    /**
     * 商品の成分リンクを返す
     */
    public function forProduct(string $slug): JsonResponse
    {
        // 商品の成分名リストを取得（Productモデルのrelationに依存）
        $product = \App\Models\Product::where('slug', $slug)
            ->with('ingredients')
            ->first();

        if (! $product) {
            return response()->json(['data' => []]);
        }

        $ingredientNames = $product->ingredients
            ->pluck('name')
            ->toArray();

        if (empty($ingredientNames)) {
            return response()->json(['data' => []]);
        }

        // mykenko.jp の成分ページ URL を生成
        $links = collect($ingredientNames)->map(function (string $name) {
            $cacheKey = 'ingredient_link_' . md5($name);

            return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($name) {
                // media app の Meilisearch API を使って slug を解決
                try {
                    $res = Http::timeout(3)->get(self::MEDIA_API_BASE . '/api/search', [
                        'q' => $name,
                    ]);

                    if ($res->ok()) {
                        $data = $res->json();
                        $ingredient = collect($data['ingredients'] ?? [])->first(
                            fn ($i) => str_contains(mb_strtolower($i['name']), mb_strtolower($name))
                        );

                        if ($ingredient) {
                            return [
                                'name'   => $ingredient['name'],
                                'slug'   => $ingredient['slug'],
                                'url'    => self::MEDIA_API_BASE . '/ingredients/' . $ingredient['slug'] . '/',
                                'evidenceLevel' => null, // media APIから取得する場合は拡張
                            ];
                        }
                    }
                } catch (\Throwable) {
                    // media API が落ちていても商品ページを壊さない
                }

                // フォールバック: 成分名からスラッグを推測
                $slug = \Illuminate\Support\Str::slug($name);
                return [
                    'name'   => $name,
                    'slug'   => $slug,
                    'url'    => self::MEDIA_API_BASE . '/ingredients/' . $slug . '/',
                    'evidenceLevel' => null,
                ];
            });
        })->values()->toArray();

        return response()->json(['data' => $links]);
    }
}
