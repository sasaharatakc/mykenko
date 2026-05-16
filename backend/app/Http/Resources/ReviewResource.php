<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'star' => $this->star,
            'comment' => $this->comment,
            'images' => $this->images ?? [],
            'customer' => $this->whenLoaded('customer', fn() => [
                'name' => $this->customer->name,
                'avatar' => $this->customer->avatar,
            ]),
            'replies' => $this->whenLoaded('replies', fn() =>
                $this->replies->where('status', 'published')->map(fn($r) => [
                    'id' => $r->id,
                    'content' => $r->content,
                    'user' => $r->user ? ['name' => $r->user->name] : null,
                    'created_at' => $r->created_at,
                ])
            ),
            'created_at' => $this->created_at,
        ];
    }
}
