<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────────────
    // Register
    // ─────────────────────────────────────────────────────────────────────────

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'customer']);

        $this->assertDatabaseHas('customers', ['email' => 'test@example.com']);
    }

    public function test_register_requires_valid_email(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Test',
            'email'                 => 'not-an-email',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_requires_password_confirmation(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name'     => 'Test',
            'email'    => 'test@example.com',
            'password' => 'password123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_prevents_duplicate_email(): void
    {
        Customer::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name'                  => 'Another',
            'email'                 => 'existing@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────────────────────────────────

    public function test_customer_can_login_with_valid_credentials(): void
    {
        $customer = Customer::factory()->create(['password' => bcrypt('secret123')]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => $customer->email,
            'password' => 'secret123',
        ])->assertOk()
            ->assertJsonStructure(['token', 'customer']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $customer = Customer::factory()->create(['password' => bcrypt('correct')]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => $customer->email,
            'password' => 'wrong',
        ])->assertUnauthorized();
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email'    => 'nobody@example.com',
            'password' => 'password',
        ])->assertUnauthorized();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authenticated_customer_can_get_profile(): void
    {
        $customer = Customer::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $customer->email);
    }

    public function test_unauthenticated_request_to_profile_is_rejected(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Logout
    // ─────────────────────────────────────────────────────────────────────────

    public function test_authenticated_customer_can_logout(): void
    {
        $customer = Customer::factory()->create();

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/v1/auth/logout')
            ->assertOk();
    }
}
