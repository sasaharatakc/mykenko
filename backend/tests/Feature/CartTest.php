<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(array $attrs = []): Product
    {
        return Product::factory()->create(array_merge([
            'status'       => 'published',
            'is_variation' => false,
            'price'        => 19.99,
            'quantity'     => 100,
            'stock_status' => 'in_stock',
        ], $attrs));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Guest cart (session_id)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_guest_can_add_item_to_cart(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/v1/cart', [
            'session_id' => 'guest-session-abc',
            'product_id' => $product->id,
            'qty'        => 2,
        ])->assertOk()
            ->assertJsonStructure(['items', 'summary']);

        $this->assertDatabaseHas('cart_items', [
            'session_id' => 'guest-session-abc',
            'product_id' => $product->id,
            'qty'        => 2,
        ]);
    }

    public function test_guest_can_view_cart(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/v1/cart', [
            'session_id' => 'sess-view',
            'product_id' => $product->id,
            'qty'        => 1,
        ]);

        $this->getJson('/api/v1/cart?session_id=sess-view')
            ->assertOk()
            ->assertJsonStructure(['items', 'summary']);
    }

    public function test_adding_same_product_increments_quantity(): void
    {
        $product = $this->makeProduct();

        $payload = [
            'session_id' => 'sess-inc',
            'product_id' => $product->id,
            'qty'        => 1,
        ];

        $this->postJson('/api/v1/cart', $payload);
        $this->postJson('/api/v1/cart', $payload);

        $this->assertDatabaseHas('cart_items', [
            'session_id' => 'sess-inc',
            'product_id' => $product->id,
            'qty'        => 2,
        ]);
    }

    public function test_cannot_add_out_of_stock_product(): void
    {
        $product = $this->makeProduct(['quantity' => 0, 'stock_status' => 'out_of_stock']);

        $this->postJson('/api/v1/cart', [
            'session_id' => 'sess-oos',
            'product_id' => $product->id,
            'qty'        => 1,
        ])->assertStatus(422);
    }

    public function test_guest_can_remove_item_from_cart(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/v1/cart', [
            'session_id' => 'sess-rm',
            'product_id' => $product->id,
            'qty'        => 1,
        ]);

        $item = \App\Models\CartItem::where('session_id', 'sess-rm')->first();

        $this->deleteJson("/api/v1/cart/{$item->id}", [
            'session_id' => 'sess-rm',
        ])->assertOk();

        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authenticated cart (customer_id)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_cart_uses_customer_id(): void
    {
        $customer = Customer::factory()->create();
        $product  = $this->makeProduct();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/cart', [
                'product_id' => $product->id,
                'qty'        => 3,
            ])->assertOk();

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'qty'        => 3,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Coupon
    // ─────────────────────────────────────────────────────────────────────────

    public function test_valid_coupon_returns_discount(): void
    {
        \App\Models\Discount::factory()->percentage(10)->create(['code' => 'SAVE10']);

        $this->postJson('/api/v1/cart/coupon', [
            'session_id' => 'sess-coupon',
            'code'       => 'SAVE10',
        ])->assertOk()
            ->assertJsonStructure(['discount', 'coupon']);
    }

    public function test_invalid_coupon_returns_error(): void
    {
        $this->postJson('/api/v1/cart/coupon', [
            'session_id' => 'sess-coupon',
            'code'       => 'INVALID',
        ])->assertStatus(422);
    }
}
