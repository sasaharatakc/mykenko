<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Public listing
    // ─────────────────────────────────────────────────────────────────────────

    public function test_guests_can_see_approved_reviews(): void
    {
        $product = Product::factory()->create(['status' => 'published', 'is_variation' => false]);
        Review::factory()->count(2)->create(['product_id' => $product->id, 'status' => 'approved']);
        Review::factory()->create(['product_id' => $product->id, 'status' => 'pending']);

        $this->getJson("/api/v1/reviews?product_id={$product->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_review_listing_requires_product_id(): void
    {
        $this->getJson('/api/v1/reviews')->assertUnprocessable();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Submitting reviews (via completed order)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_customer_with_completed_order_can_submit_review(): void
    {
        $customer     = Customer::factory()->create();
        $product      = Product::factory()->create(['status' => 'published', 'is_variation' => false]);
        $order        = Order::factory()->completed()->create(['customer_id' => $customer->id]);
        $orderProduct = OrderProduct::factory()->create([
            'order_id'   => $order->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/v1/orders/{$order->code}/review", [
                'order_product_id' => $orderProduct->id,
                'star'             => 5,
                'comment'          => 'Excellent product!',
            ])->assertCreated()
                ->assertJsonPath('data.star', 5);
    }

    public function test_review_star_must_be_between_1_and_5(): void
    {
        $customer     = Customer::factory()->create();
        $product      = Product::factory()->create(['status' => 'published', 'is_variation' => false]);
        $order        = Order::factory()->completed()->create(['customer_id' => $customer->id]);
        $orderProduct = OrderProduct::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

        $this->actingAs($customer, 'sanctum')
            ->postJson("/api/v1/orders/{$order->code}/review", [
                'order_product_id' => $orderProduct->id,
                'star'             => 6,
                'comment'          => 'Too many stars',
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['star']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin moderation
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_approve_review(): void
    {
        $admin  = User::factory()->create();
        $admin->assignRole('admin');
        $review = Review::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/reviews/{$review->id}", ['status' => 'approved'])
            ->assertOk();

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'status' => 'approved']);
    }
}
