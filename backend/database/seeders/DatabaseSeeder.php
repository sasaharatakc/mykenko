<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\Tax;
use App\Models\BlogCategory;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles – guard_name must match config('auth.defaults.guard') = 'sanctum'
        $adminRole  = Role::firstOrCreate(['name' => 'admin',  'guard_name' => 'sanctum']);
        $vendorRole = Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'sanctum']);

        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@shofy.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);

        // Default tax
        Tax::firstOrCreate(
            ['title' => 'Standard Tax'],
            ['percentage' => 10.00, 'status' => 'published']
        );

        // Categories
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'order' => 1],
            ['name' => 'Fashion', 'slug' => 'fashion', 'order' => 2],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'order' => 3],
            ['name' => 'Sports', 'slug' => 'sports', 'order' => 4],
            ['name' => 'Books', 'slug' => 'books', 'order' => 5],
            ['name' => 'Beauty', 'slug' => 'beauty', 'order' => 6],
            ['name' => 'Toys', 'slug' => 'toys', 'order' => 7],
            ['name' => 'Automotive', 'slug' => 'automotive', 'order' => 8],
        ];

        foreach ($categories as $cat) {
            ProductCategory::firstOrCreate(['slug' => $cat['slug']], array_merge($cat, ['status' => 'published']));
        }

        // Brands
        $brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP'];
        foreach ($brands as $brand) {
            Brand::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($brand)],
                ['name' => $brand, 'status' => 'published']
            );
        }

        // Blog Categories
        $blogCats = ['Technology', 'Fashion', 'Lifestyle', 'Travel', 'Food'];
        foreach ($blogCats as $cat) {
            BlogCategory::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($cat)],
                ['name' => $cat, 'status' => 'published']
            );
        }

        // Default settings
        $defaults = [
            'site_name'                   => 'Shofy',
            'site_tagline'                => 'The Multivendor Marketplace',
            'site_email'                  => 'hello@shofy.com',
            'currency'                    => 'USD',
            'currency_symbol'             => '$',
            'default_commission'          => '10',
            'min_withdrawal'              => '50',
            'tax_rate'                    => '10',
            'maintenance_mode'            => '0',
            'registration_enabled'        => '1',
            'vendor_registration_enabled' => '1',
        ];
        foreach ($defaults as $key => $value) {
            \DB::table('settings')->updateOrInsert(['key' => $key], ['value' => $value, 'updated_at' => now()]);
        }
    }
}
