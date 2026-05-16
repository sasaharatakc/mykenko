<?php

namespace Tests\Unit;

use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class CartServiceTest extends TestCase
{
    private CartService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CartService::class);
    }

    public function test_get_summary_calculates_correct_totals(): void
    {
        $items = collect([
            (object) ['qty' => 2, 'price' => 10.00],
            (object) ['qty' => 1, 'price' => 25.00],
        ]);

        $summary = $this->service->getSummary($items, discount: 5.00, shipping: 9.99);

        // sub_total = 2*10 + 1*25 = 45
        $this->assertEquals(45.00, $summary['sub_total']);
        $this->assertEquals(5.00, $summary['discount']);
        $this->assertEquals(9.99, $summary['shipping']);
        // total = 45 + tax + shipping - discount
        $this->assertGreaterThan(45, $summary['total']);
    }

    public function test_get_summary_handles_empty_cart(): void
    {
        $summary = $this->service->getSummary(collect(), discount: 0, shipping: 0);

        $this->assertEquals(0, $summary['sub_total']);
        $this->assertEquals(0, $summary['total']);
        $this->assertEquals(0, $summary['item_count']);
    }

    public function test_get_summary_item_count_sums_quantities(): void
    {
        $items = collect([
            (object) ['qty' => 3, 'price' => 10.00],
            (object) ['qty' => 2, 'price' => 15.00],
        ]);

        $summary = $this->service->getSummary($items);
        $this->assertEquals(5, $summary['item_count']);
    }
}
