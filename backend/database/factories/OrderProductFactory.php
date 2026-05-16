<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderProductFactory extends Factory
{
    protected $model = OrderProduct::class;

    public function definition(): array
    {
        $qty   = fake()->numberBetween(1, 5);
        $price = fake()->randomFloat(2, 5, 200);

        return [
            'order_id'     => Order::factory(),
            'product_id'   => Product::factory(),
            'product_name' => fake()->words(3, true),
            'product_image'=> null,
            'qty'          => $qty,
            'price'        => $price,
            'sub_total'    => round($qty * $price, 2),
            'tax_amount'   => 0,
            'options'      => null,
        ];
    }
}
