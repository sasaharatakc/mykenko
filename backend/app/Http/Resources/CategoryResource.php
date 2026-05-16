<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'icon' => $this->icon,
            'parent_id' => $this->parent_id,
            'order' => $this->order,
            'is_featured' => $this->is_featured,
            'children' => $this->when(
                $this->relationLoaded('children') || $this->relationLoaded('allChildren'),
                fn() => CategoryResource::collection(
                    $this->relationLoaded('allChildren') ? $this->allChildren : $this->children
                )
            ),
            'parent' => $this->whenLoaded('parent', fn() => $this->parent ? [
                'id' => $this->parent->id,
                'name' => $this->parent->name,
                'slug' => $this->parent->slug,
            ] : null),
        ];
    }
}
