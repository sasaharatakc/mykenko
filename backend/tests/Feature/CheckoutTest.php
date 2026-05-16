<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function setupCustomerWithCart(): array
    {
        $customer = Customer::factory()->create();
        $store    = Store::factory()->create();
        $product  = Product::factory()->create([
            'store_id'     => $store->id,
            'status'       => 'published',
            'is_variation' => false,
            'price'        => 25.00,
            'quantity'     => 50,
            'stock_status' => 'in_stock',
        ]);

        CartItem::create([
            'customer_id' => $customer->id,
            'product_id'  => $product->id,
            'qty'         => 2,
            'price'       => 25.00,
        ]);

        return compact('customer', 'store', 'product');
    }

    private function shippingAddressPayload(): array
    {
        return [
            'shipping_address' => [
                'name'    => 'Test User',
                'email'   => 'test@example.com',
                'phone'   => '555-0000',
                'address' => '123 Main St',
                'city'    => 'Anytown',
                'country' => 'US',
            ],
            'shipping_method' => 'standard',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COD checkout
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authenticated_customer_can_checkout_with_cod(): void
    {
        Queue::fake();

        ['customer' => $customer] = $this->setupCustomerWithCart();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/checkout/', array_merge($this->shippingAddressPayload(), [
                'payment_method' => 'cod',
            ]))->assertCreated()
                ->assertJsonStructure(['order' => ['code', 'status']]);

        $this->assertDatabaseHas('orders', [
            'customer_id'    => $customer->id,
            'payment_method' => 'cod',
        ]);
    }

    public function test_checkout_fails_when_cart_is_empty(): void
    {
        $customer = Customer::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/checkout/', array_merge($this->shippingAddressPayload(), [
                'payment_method' => 'cod',
            ]))->assertStatus(422);
    }

    public function test_unauthenticated_user_cannot_checkout(): void
    {
        $this->postJson('/api/v1/checkout/', [
            'payment_method' => 'cod',
        ])->assertUnauthorized();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Queue dispatch on COD
    // ─────────────────────────────────────────────────────────────────────────

    public function test_cod_checkout_dispatches_confirmation_email_job(): void
    {
        Queue::fake();

        ['customer' => $customer] = $this->setupCustomerWithCart();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/checkout/', array_merge($this->shippingAddressPayload(), [
                'payment_method' => 'cod',
            ]));

        Queue::assertPushed(\App\Jobs\SendOrderConfirmation::class);
    }
}
