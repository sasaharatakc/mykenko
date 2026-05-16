<?php

namespace Database\Factories;

use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductCategoryFactory extends Factory
{
    protected $model = ProductCategory::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name'        => ucwords($name),
            'slug'        => Str::slug($name) . '-' . Str::random(4),
            'description' => fake()->optional()->sentence(),
            'image'       => null,
            'parent_id'   => null,
            'order'       => fake()->numberBetween(1, 100),
            'status'      => 'published',
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }

    public function child(ProductCategory $parent): static
    {
        return $this->state(['parent_id' => $parent->id]);
    }
}
