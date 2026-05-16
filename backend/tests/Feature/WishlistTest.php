<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_wishlist(): void
    {
        $customer = Customer::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/v1/wishlist')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_customer_can_toggle_product_into_wishlist(): void
    {
        $customer = Customer::factory()->create();
        $product  = Product::factory()->create(['status' => 'published', 'is_variation' => false]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/wishlist/toggle', ['product_id' => $product->id])
            ->assertOk();

        $this->assertDatabaseHas('wishlists', [
            'customer_id' => $customer->id,
            'product_id'  => $product->id,
        ]);
    }

    public function test_toggling_again_removes_from_wishlist(): void
    {
        $customer = Customer::factory()->create();
        $product  = Product::factory()->create(['status' => 'published', 'is_variation' => false]);

        Wishlist::create(['customer_id' => $customer->id, 'product_id' => $product->id]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/wishlist/toggle', ['product_id' => $product->id])
            ->assertOk();

        $this->assertDatabaseMissing('wishlists', [
            'customer_id' => $customer->id,
            'product_id'  => $product->id,
        ]);
    }

    public function test_customer_can_check_if_product_is_in_wishlist(): void
    {
        $customer = Customer::factory()->create();
        $product  = Product::factory()->create(['status' => 'published', 'is_variation' => false]);
        Wishlist::create(['customer_id' => $customer->id, 'product_id' => $product->id]);

        $this->actingAs($customer, 'sanctum')
            ->getJson("/api/v1/wishlist/check?product_id={$product->id}")
            ->assertOk()
            ->assertJsonPath('wishlisted', true);
    }

    public function test_unauthenticated_user_cannot_access_wishlist(): void
    {
        $this->getJson('/api/v1/wishlist')->assertUnauthorized();
    }
}
