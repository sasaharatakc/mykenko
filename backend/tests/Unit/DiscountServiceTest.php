<?php

namespace Tests\Unit;

use App\Models\Discount;
use App\Services\DiscountService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscountServiceTest extends TestCase
{
    use RefreshDatabase;

    private DiscountService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(DiscountService::class);
    }

    public function test_percentage_discount_is_calculated_correctly(): void
    {
        Discount::factory()->percentage(20)->create(['code' => 'PCT20']);

        $result = $this->service->apply('PCT20', 100.00);

        $this->assertTrue($result['valid']);
        $this->assertEquals(20.00, $result['discount_amount']);
    }

    public function test_fixed_amount_discount_is_calculated_correctly(): void
    {
        Discount::factory()->fixedAmount(15)->create(['code' => 'FLAT15']);

        $result = $this->service->apply('FLAT15', 100.00);

        $this->assertTrue($result['valid']);
        $this->assertEquals(15.00, $result['discount_amount']);
    }

    public function test_expired_coupon_is_rejected(): void
    {
        Discount::factory()->expired()->create(['code' => 'EXPIRED']);

        $result = $this->service->apply('EXPIRED', 100.00);

        $this->assertFalse($result['valid']);
    }

    public function test_minimum_order_requirement_is_enforced(): void
    {
        Discount::factory()->create([
            'code'             => 'MIN50',
            'type'             => 'percentage',
            'value'            => 10,
            'min_order_amount' => 50.00,
        ]);

        $result = $this->service->apply('MIN50', 30.00);

        $this->assertFalse($result['valid']);
    }

    public function test_minimum_order_passes_when_met(): void
    {
        Discount::factory()->create([
            'code'             => 'MIN50OK',
            'type'             => 'percentage',
            'value'            => 10,
            'min_order_amount' => 50.00,
        ]);

        $result = $this->service->apply('MIN50OK', 60.00);

        $this->assertTrue($result['valid']);
    }

    public function test_nonexistent_code_is_rejected(): void
    {
        $result = $this->service->apply('NOPE', 100.00);

        $this->assertFalse($result['valid']);
    }

    public function test_usage_limit_is_enforced(): void
    {
        Discount::factory()->create([
            'code'     => 'USED100',
            'type'     => 'percentage',
            'value'    => 10,
            'max_uses' => 100,
            'uses'     => 100,
        ]);

        $result = $this->service->apply('USED100', 100.00);

        $this->assertFalse($result['valid']);
    }

    public function test_discount_cannot_exceed_order_total(): void
    {
        // $20 fixed discount on a $10 order
        Discount::factory()->fixedAmount(20)->create(['code' => 'BIG']);

        $result = $this->service->apply('BIG', 10.00);

        $this->assertTrue($result['valid']);
        $this->assertEquals(10.00, $result['discount_amount']); // capped at order total
    }
}
