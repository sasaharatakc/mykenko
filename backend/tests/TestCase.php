<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Reset Spatie permission cache between tests
        $this->app->make(\Spatie\Permission\PermissionRegistrar::class)
            ->forgetCachedPermissions();

        // Seed core roles (guard_name must match config('auth.defaults.guard') = 'sanctum')
        Role::firstOrCreate(['name' => 'admin',  'guard_name' => 'sanctum']);
        Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'sanctum']);
    }
}
