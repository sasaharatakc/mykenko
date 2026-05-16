<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function makeCustomer(): Customer
    {
        return Customer::factory()->create();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Customer orders
    // ─────────────────────────────────────────────────────────────────────────

    public function test_customer_can_list_own_orders(): void
    {
        $customer = $this->makeCustomer();
        Order::factory()->count(3)->create(['customer_id' => $customer->id]);
        Order::factory()->create(); // another customer's order

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/v1/orders')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_customer_can_view_own_order(): void
    {
        $customer = $this->makeCustomer();
        $order    = Order::factory()->create(['customer_id' => $customer->id]);

        $this->actingAs($customer, 'sanctum')
            ->getJson("/api/v1/orders/{$order->code}")
            ->assertOk()
            ->assertJsonPath('data.code', $order->code);
    }

    public function test_customer_cannot_view_others_order(): void
    {
        $customerA = $this->makeCustomer();
        $customerB = $this->makeCustomer();
        $order     = Order::factory()->create(['customer_id' => $customerA->id]);

        $this->actingAs($customerB, 'sanctum')
            ->getJson("/api/v1/orders/{$order->code}")
            ->assertNotFound();
    }

    public function test_customer_can_cancel_pending_order(): void
    {
        $customer = $this->makeCustomer();
        $order    = Order::factory()->pending()->create(['customer_id' => $customer->id]);

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/v1/orders/{$order->code}/cancel")
            ->assertOk();

        $this->assertDatabaseHas('orders', [
            'id'     => $order->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_customer_cannot_cancel_completed_order(): void
    {
        $customer = $this->makeCustomer();
        $order    = Order::factory()->completed()->create(['customer_id' => $customer->id]);

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/v1/orders/{$order->code}/cancel")
            ->assertStatus(422);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vendor orders
    // ─────────────────────────────────────────────────────────────────────────

    public function test_vendor_can_list_own_store_orders(): void
    {
        $user  = User::factory()->create();
        $store = Store::factory()->create(['owner_id' => $user->id]);
        $user->assignRole('vendor');

        Order::factory()->count(2)->create(['store_id' => $store->id]);
        Order::factory()->create(); // different store

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/vendor/orders')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_vendor_can_mark_order_as_processing(): void
    {
        $user  = User::factory()->create();
        $store = Store::factory()->create(['owner_id' => $user->id]);
        $order = Order::factory()->pending()->create(['store_id' => $store->id]);
        $user->assignRole('vendor');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/vendor/orders/{$order->id}/process")
            ->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin orders
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_all_orders(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Order::factory()->count(5)->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/orders')
            ->assertOk();
    }

    public function test_admin_can_update_any_order_status(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $order = Order::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'completed'])
            ->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'completed']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Order tracking (guest)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_guest_can_track_order_by_code_and_email(): void
    {
        $customer = $this->makeCustomer();
        $order    = Order::factory()->create(['customer_id' => $customer->id]);

        $this->postJson('/api/v1/orders/track', [
            'code'  => $order->code,
            'email' => $customer->email,
        ])->assertOk()
            ->assertJsonPath('data.code', $order->code);
    }

    public function test_tracking_with_wrong_email_returns_404(): void
    {
        $customer = $this->makeCustomer();
        $order    = Order::factory()->create(['customer_id' => $customer->id]);

        $this->postJson('/api/v1/orders/track', [
            'code'  => $order->code,
            'email' => 'wrong@example.com',
        ])->assertNotFound();
    }
}
