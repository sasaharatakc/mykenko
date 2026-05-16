<?php

namespace Tests\Unit;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_price_returns_sale_price_when_on_sale(): void
    {
        $product = Product::factory()->make(['price' => 100.00, 'sale_price' => 80.00]);
        $this->assertEquals(80.00, $product->current_price);
    }

    public function test_current_price_returns_regular_price_when_not_on_sale(): void
    {
        $product = Product::factory()->make(['price' => 100.00, 'sale_price' => null]);
        $this->assertEquals(100.00, $product->current_price);
    }

    public function test_is_on_sale_returns_true_when_sale_price_set(): void
    {
        $product = Product::factory()->make(['price' => 100.00, 'sale_price' => 75.00]);
        $this->assertTrue($product->is_on_sale);
    }

    public function test_is_on_sale_returns_false_when_no_sale_price(): void
    {
        $product = Product::factory()->make(['price' => 100.00, 'sale_price' => null]);
        $this->assertFalse($product->is_on_sale);
    }

    public function test_in_stock_returns_true_for_in_stock_product(): void
    {
        $product = Product::factory()->make(['stock_status' => 'in_stock', 'quantity' => 10]);
        $this->assertTrue($product->in_stock);
    }

    public function test_in_stock_returns_false_for_out_of_stock_product(): void
    {
        $product = Product::factory()->make(['stock_status' => 'out_of_stock', 'quantity' => 0]);
        $this->assertFalse($product->in_stock);
    }

    public function test_discount_percent_calculates_correctly(): void
    {
        $product = Product::factory()->make(['price' => 100.00, 'sale_price' => 75.00]);
        $this->assertEquals(25, $product->discount_percent);
    }

    public function test_discount_percent_is_zero_when_no_sale(): void
    {
        $product = Product::factory()->make(['price' => 100.00, 'sale_price' => null]);
        $this->assertEquals(0, $product->discount_percent);
    }
}
