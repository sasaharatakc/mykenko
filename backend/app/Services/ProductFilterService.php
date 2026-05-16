<?php

namespace App\Services;

use App\Models\ProductCategory;
use Illuminate\Support\Collection;

class ProductFilterService
{
    public function getCategoryWithChildren(int $categoryId): array
    {
        $ids = [$categoryId];
        $children = ProductCategory::where('parent_id', $categoryId)->pluck('id')->toArray();

        foreach ($children as $childId) {
            $ids = array_merge($ids, $this->getCategoryWithChildren($childId));
        }

        return array_unique($ids);
    }

    public function getFilterOptions(int $categoryId): array
    {
        $categoryIds = $this->getCategoryWithChildren($categoryId);

        return [
            'price_range' => $this->getPriceRange($categoryIds),
            'brands' => $this->getBrands($categoryIds),
            'attributes' => $this->getAttributes($categoryIds),
        ];
    }

    private function getPriceRange(array $categoryIds): array
    {
        $result = \App\Models\Product::published()
            ->whereHas('categories', fn($q) => $q->whereIn('product_categories.id', $categoryIds))
            ->selectRaw('MIN(price) as min, MAX(price) as max')
            ->first();

        return ['min' => (float) $result->min, 'max' => (float) $result->max];
    }

    private function getBrands(array $categoryIds): Collection
    {
        return \App\Models\Brand::published()
            ->whereHas('products', fn($q) => $q->published()
                ->whereHas('categories', fn($q2) => $q2->whereIn('product_categories.id', $categoryIds)))
            ->withCount(['products' => fn($q) => $q->published()])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo']);
    }

    private function getAttributes(array $categoryIds): Collection
    {
        return \App\Models\ProductAttributeSet::published()
            ->where('is_searchable', true)
            ->with(['attributes' => fn($q) => $q->where('status', 'published')->orderBy('order')])
            ->get(['id', 'title', 'slug', 'display_layout']);
    }
}
