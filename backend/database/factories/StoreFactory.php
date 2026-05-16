<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StoreFactory extends Factory
{
    protected $model = Store::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'owner_id'       => User::factory(),
            'name'           => $name,
            'slug'           => Str::slug($name) . '-' . Str::random(4),
            'description'    => fake()->paragraph(),
            'phone'          => fake()->phoneNumber(),
            'email'          => fake()->companyEmail(),
            'address'        => fake()->streetAddress(),
            'city'           => fake()->city(),
            'state'          => fake()->state(),
            'country'        => 'US',
            'logo'           => null,
            'status'         => 'approved',
            'is_verified'    => false,
            'commission_rate'=> fake()->randomFloat(2, 5, 20),
            'rating'         => 0,
            'rating_count'   => 0,
            'total_revenue'  => 0,
            'total_sales'    => 0,
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

    public function verified(): static
    {
        return $this->state(['is_verified' => true]);
    }
}
