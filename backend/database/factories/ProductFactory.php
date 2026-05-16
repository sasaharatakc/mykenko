<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name      = fake()->words(fake()->numberBetween(2, 5), true);
        $price     = fake()->randomFloat(2, 5, 500);
        $onSale    = fake()->boolean(40);
        $salePrice = $onSale ? round($price * fake()->randomFloat(2, 0.5, 0.9), 2) : null;

        return [
            'name'                      => ucfirst($name),
            'slug'                      => Str::slug($name) . '-' . Str::random(6),
            'description'               => fake()->sentence(),
            'content'                   => fake()->paragraphs(3, true),
            'image'                     => null,
            'images'                    => null,
            'sku'                       => strtoupper(Str::random(8)),
            'barcode'                   => fake()->optional()->ean13(),
            'price'                     => $price,
            'sale_price'                => $salePrice,
            'cost_per_item'             => round($price * 0.6, 2),
            'store_id'                  => Store::factory(),
            'category_id'               => null,
            'brand_id'                  => null,
            'quantity'                  => fake()->numberBetween(0, 200),
            'allow_checkout_when_out_of_stock' => false,
            'with_storehouse_management'       => true,
            'stock_status'                     => 'in_stock',
            'weight'                           => fake()->optional()->randomFloat(2, 0.1, 20),
            'length'                           => fake()->optional()->randomFloat(2, 1, 100),
            'width'                            => fake()->optional()->randomFloat(2, 1, 100),
            'height'                           => fake()->optional()->randomFloat(2, 1, 100),
            'is_variation'              => false,
            'views'                     => fake()->numberBetween(0, 10000),
            'status'                    => 'published',
            'order'                     => fake()->numberBetween(0, 100),
            'created_by'                => null,
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }

    public function onSale(): static
    {
        return $this->state(function (array $attrs) {
            return ['sale_price' => round($attrs['price'] * 0.8, 2)];
        });
    }

    public function outOfStock(): static
    {
        return $this->state(['quantity' => 0, 'stock_status' => 'out_of_stock']);
    }

    public function forStore(Store $store): static
    {
        return $this->state(['store_id' => $store->id]);
    }
}
