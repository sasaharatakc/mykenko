<?php

namespace Database\Factories;

use App\Models\Discount;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DiscountFactory extends Factory
{
    protected $model = Discount::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['percentage', 'amount']);

        return [
            'code'             => strtoupper(Str::random(8)),
            'type'             => $type,
            'value'            => $type === 'percentage'
                ? fake()->numberBetween(5, 50)
                : fake()->randomFloat(2, 5, 100),
            'min_order_amount' => null,
            'max_uses'         => null,
            'uses'             => 0,
            'starts_at'        => now()->subDay(),
            'expires_at'       => now()->addDays(30),
            'status'           => 'published',
        ];
    }

    public function expired(): static
    {
        return $this->state([
            'starts_at'  => now()->subDays(60),
            'expires_at' => now()->subDay(),
        ]);
    }

    public function notStarted(): static
    {
        return $this->state([
            'starts_at' => now()->addDays(5),
        ]);
    }

    public function percentage(int $percent = 10): static
    {
        return $this->state(['type' => 'percentage', 'value' => $percent]);
    }

    public function fixedAmount(float $amount = 10): static
    {
        return $this->state(['type' => 'amount', 'value' => $amount]);
    }
}
