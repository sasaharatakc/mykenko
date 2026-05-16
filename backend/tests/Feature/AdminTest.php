<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Dashboard
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_access_dashboard_stats(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/v1/admin/dashboard/stats')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/admin/dashboard/stats')
            ->assertForbidden();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Categories CRUD
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_create_category(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/v1/admin/categories', [
                'name'   => 'Electronics',
                'status' => 'published',
            ])->assertCreated()
                ->assertJsonPath('data.name', 'Electronics');
    }

    public function test_admin_can_update_category(): void
    {
        $category = ProductCategory::factory()->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/admin/categories/{$category->id}", [
                'name' => 'Updated Category',
            ])->assertOk()
                ->assertJsonPath('data.name', 'Updated Category');
    }

    public function test_admin_can_delete_category(): void
    {
        $category = ProductCategory::factory()->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson("/api/v1/admin/categories/{$category->id}")
            ->assertOk();

        $this->assertSoftDeleted('product_categories', ['id' => $category->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Settings
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_get_settings(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/v1/admin/settings')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_update_settings(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->putJson('/api/v1/admin/settings', [
                'site_name'          => 'My Store',
                'default_commission' => '12',
            ])->assertOk();

        $this->assertDatabaseHas('settings', ['key' => 'site_name', 'value' => 'My Store']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Withdrawals
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_withdrawals(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/v1/admin/withdrawals')
            ->assertOk();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Orders
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_all_orders(): void
    {
        $admin = $this->admin();
        Order::factory()->count(5)->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/orders')
            ->assertOk();
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = $this->admin();
        $order = Order::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'completed'])
            ->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'completed']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Users
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_customers(): void
    {
        Customer::factory()->count(5)->create();

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/v1/admin/customers')
            ->assertOk();
    }
}
