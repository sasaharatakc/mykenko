<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subTotal = fake()->randomFloat(2, 20, 500);
        $shipping = fake()->randomElement([0, 5.99, 14.99, 29.99]);
        $tax      = round($subTotal * 0.08, 2);
        $total    = round($subTotal + $shipping + $tax, 2);

        return [
            'code'                 => 'ORD-' . strtoupper(Str::random(8)),
            'token'                => Str::random(64),
            'customer_id'          => Customer::factory(),
            'store_id'             => Store::factory(),
            'status'               => fake()->randomElement(['pending', 'processing', 'shipped', 'completed']),
            'payment_status'       => fake()->randomElement(['pending', 'completed']),
            'payment_method'       => fake()->randomElement(['stripe', 'paypal', 'cod', 'bank_transfer']),
            'sub_total'            => $subTotal,
            'shipping_amount'      => $shipping,
            'tax_amount'           => $tax,
            'discount_amount'      => 0,
            'total_amount'         => $total,
            'coupon_code'          => null,
            'payment_fee'          => 0,
            'discount_description' => null,
            'note'                 => fake()->optional()->sentence(),
            'cancellation_reason'  => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending', 'payment_status' => 'pending']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed', 'payment_status' => 'completed']);
    }

    public function cancelled(): static
    {
        return $this->state([
            'status'              => 'cancelled',
            'cancellation_reason' => fake()->sentence(),
        ]);
    }

    public function forCustomer(Customer $customer): static
    {
        return $this->state(['customer_id' => $customer->id]);
    }
}
