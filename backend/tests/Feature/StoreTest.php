<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Public routes
    // ─────────────────────────────────────────────────────────────────────────

    public function test_guests_can_list_approved_stores(): void
    {
        Store::factory()->count(3)->approved()->create();
        Store::factory()->pending()->create();

        $this->getJson('/api/v1/stores')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_guests_can_view_store_by_slug(): void
    {
        $store = Store::factory()->approved()->create();

        $this->getJson("/api/v1/stores/{$store->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $store->id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vendor store management
    // ─────────────────────────────────────────────────────────────────────────

    public function test_vendor_can_view_own_store(): void
    {
        $user  = User::factory()->create();
        $store = Store::factory()->create(['owner_id' => $user->id]);
        $user->assignRole('vendor');

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/vendor/store')
            ->assertOk()
            ->assertJsonPath('data.id', $store->id);
    }

    public function test_vendor_can_update_own_store(): void
    {
        $user  = User::factory()->create();
        $store = Store::factory()->create(['owner_id' => $user->id]);
        $user->assignRole('vendor');

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/vendor/store', [
                'name'        => 'Updated Store Name',
                'description' => 'New description',
                'phone'       => '555-1234',
                'email'       => 'store@example.com',
            ])->assertOk()
                ->assertJsonPath('data.name', 'Updated Store Name');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin store management (verify/unverify)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_verify_store(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->approved()->create(['is_verified' => false]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/stores/{$store->id}/verify")
            ->assertOk();

        $this->assertDatabaseHas('stores', ['id' => $store->id, 'is_verified' => true]);
    }

    public function test_admin_can_unverify_store(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->approved()->create(['is_verified' => true]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/stores/{$store->id}/unverify")
            ->assertOk();

        $this->assertDatabaseHas('stores', ['id' => $store->id, 'is_verified' => false]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vendor registration
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_register_as_vendor(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/stores/register', [
                'name'    => 'My Shop',
                'phone'   => '555-0000',
                'email'   => 'shop@example.com',
                'address' => '123 Main St',
            ])->assertCreated()
                ->assertJsonStructure(['store' => ['id', 'name', 'status']]);

        $this->assertDatabaseHas('stores', [
            'owner_id' => $user->id,
            'status'   => 'pending',
        ]);
    }

    public function test_user_cannot_register_two_stores(): void
    {
        $user  = User::factory()->create();
        Store::factory()->create(['owner_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/stores/register', [
                'name'    => 'Second Shop',
                'phone'   => '555-0001',
                'email'   => 'second@example.com',
                'address' => '456 Other St',
                'city'    => 'Anytown',
                'country' => 'US',
            ])->assertStatus(422);
    }
}
