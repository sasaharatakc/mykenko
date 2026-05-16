<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Public listing
    // ─────────────────────────────────────────────────────────────────────────

    public function test_guests_can_list_published_products(): void
    {
        Product::factory()->count(3)->create(['status' => 'published', 'is_variation' => false]);
        Product::factory()->create(['status' => 'draft', 'is_variation' => false]);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_products_list_supports_search(): void
    {
        Product::factory()->create(['name' => 'Blue Widget', 'status' => 'published', 'is_variation' => false]);
        Product::factory()->create(['name' => 'Red Gadget', 'status' => 'published', 'is_variation' => false]);

        $this->getJson('/api/v1/products?search=Widget')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Blue Widget');
    }

    public function test_guests_can_view_single_product(): void
    {
        $product = Product::factory()->create(['status' => 'published', 'is_variation' => false]);

        $this->getJson("/api/v1/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_viewing_draft_product_returns_404(): void
    {
        $product = Product::factory()->create(['status' => 'draft', 'is_variation' => false]);

        $this->getJson("/api/v1/products/{$product->slug}")
            ->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vendor CRUD
    // ─────────────────────────────────────────────────────────────────────────

    public function test_vendor_can_create_product(): void
    {
        $user  = User::factory()->create();
        $store = Store::factory()->create(['owner_id' => $user->id]);
        $user->assignRole('vendor');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/vendor/products', [
                'name'        => 'My New Product',
                'price'       => 29.99,
                'description' => 'A great product',
                'status'      => 'published',
                'quantity'    => 50,
            ])->assertCreated()
                ->assertJsonPath('data.name', 'My New Product');
    }

    public function test_vendor_can_update_own_product(): void
    {
        $user    = User::factory()->create();
        $store   = Store::factory()->create(['owner_id' => $user->id]);
        $product = Product::factory()->create(['store_id' => $store->id, 'is_variation' => false]);
        $user->assignRole('vendor');

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/vendor/products/{$product->id}", [
                'name'  => 'Updated Name',
                'price' => 39.99,
            ])->assertOk()
                ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_vendor_cannot_update_others_product(): void
    {
        $userA  = User::factory()->create();
        $storeA = Store::factory()->create(['owner_id' => $userA->id]);

        $userB   = User::factory()->create();
        $product = Product::factory()->create(['store_id' => $storeA->id, 'is_variation' => false]);
        $userB->assignRole('vendor');
        Store::factory()->create(['owner_id' => $userB->id]);

        $this->actingAs($userB, 'sanctum')
            ->putJson("/api/v1/vendor/products/{$product->id}", ['name' => 'Hack'])
            ->assertForbidden();
    }

    public function test_vendor_can_delete_own_product(): void
    {
        $user    = User::factory()->create();
        $store   = Store::factory()->create(['owner_id' => $user->id]);
        $product = Product::factory()->create(['store_id' => $store->id, 'is_variation' => false]);
        $user->assignRole('vendor');

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/vendor/products/{$product->id}")
            ->assertOk();

        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin CRUD
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_all_products(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Product::factory()->count(5)->create(['is_variation' => false]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/products')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }
}
