<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'content' => $this->when(
                $request->routeIs('*.blog.show'),
                fn() => $this->content
            ),
            'image' => $this->image,
            'author' => $this->whenLoaded('author', fn() => [
                'id' => $this->author->id,
                'name' => $this->author->name,
                'avatar' => $this->author->avatar,
            ]),
            'categories' => $this->whenLoaded('categories'),
            'tags' => $this->whenLoaded('tags'),
            'views' => $this->views,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
        ];
    }
}
