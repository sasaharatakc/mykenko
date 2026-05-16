<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\Withdrawal;
use Illuminate\Database\Eloquent\Factories\Factory;

class WithdrawalFactory extends Factory
{
    protected $model = Withdrawal::class;

    public function definition(): array
    {
        return [
            'store_id'       => Store::factory(),
            'amount'         => fake()->randomFloat(2, 50, 2000),
            'fee'            => fake()->randomFloat(2, 1, 20),
            'status'         => 'pending',
            'bank_info'      => json_encode([
                'bank_name'      => fake()->company(),
                'account_number' => fake()->bankAccountNumber(),
                'account_name'   => fake()->name(),
            ]),
            'note'           => fake()->optional()->sentence(),
            'admin_note'     => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(['status' => 'approved']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }
}
