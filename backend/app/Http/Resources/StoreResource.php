<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'logo' => $this->logo,
            'cover_image' => $this->cover_image,
            'description' => $this->description,
            'website' => $this->website,
            'social_links' => $this->social_links ?? [],
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'status' => $this->status,
            'is_verified' => $this->is_verified,
            'rating' => $this->rating,
            'rating_count' => $this->rating_count,
            'total_sales' => $this->total_sales,
            'products_count' => $this->products_count ?? null,
            'created_at' => $this->created_at,
        ];
    }
}
