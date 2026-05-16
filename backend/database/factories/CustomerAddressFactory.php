<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerAddressFactory extends Factory
{
    protected $model = CustomerAddress::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'name'        => fake()->name(),
            'email'       => fake()->safeEmail(),
            'phone'       => fake()->phoneNumber(),
            'address'     => fake()->streetAddress(),
            'city'        => fake()->city(),
            'state'       => fake()->state(),
            'country'     => 'US',
            'zip_code'    => fake()->postcode(),
            'is_default'  => true,
        ];
    }
}
