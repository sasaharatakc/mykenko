<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'product_id'       => Product::factory(),
            'customer_id'      => Customer::factory(),
            'order_product_id' => null,
            'star'             => fake()->numberBetween(1, 5),
            'comment'          => fake()->paragraph(),
            'images'           => null,
            'status'           => 'approved',
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function approved(): static
    {
        return $this->state(['status' => 'approved']);
    }
}
