<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    */

    'defaults' => [
        'guard'     => 'sanctum',
        'passwords' => 'customers',
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Shofy uses two separate auth models:
    |   - Customer: shoppers (customers table) – used for all /api/* routes
    |   - User:     vendors & admins (users table) – used for /api/vendor/* and /api/admin/*
    |
    | Both models use Sanctum token auth. Sanctum resolves the model from the
    | token's tokenable_type column, so both can share the same 'sanctum' guard.
    |
    */

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'customers',
        ],

        'sanctum' => [
            'driver'   => 'sanctum',
            'provider' => null,   // Accept any tokenable model (Customer or User); Sanctum resolves via tokenable_type
        ],

        'admin' => [
            'driver'   => 'session',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    */

    'providers' => [
        'customers' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Customer::class,
        ],

        'users' => [
            'driver' => 'eloquent',
            'model'  => App\Models\User::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    */

    'passwords' => [
        'customers' => [
            'provider' => 'customers',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],

        'users' => [
            'provider' => 'users',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];
