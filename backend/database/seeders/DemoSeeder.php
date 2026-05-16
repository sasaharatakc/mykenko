<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Store;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\OrderAddress;
use App\Models\OrderHistory;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\FlashSale;
use App\Models\Review;
use App\Models\Discount;
use Spatie\Permission\Models\Role;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $vendorRole = Role::firstOrCreate(['name' => 'vendor', 'guard_name' => 'sanctum']);

        // ─── Categories (already created by DatabaseSeeder) ───
        $categories = ProductCategory::all()->keyBy('slug');

        // ─── Brands (already created by DatabaseSeeder) ───
        $brands = Brand::all()->keyBy('slug');

        // ─── Blog Categories ───
        $blogCats = BlogCategory::all()->keyBy('slug');

        // ─── Vendor Users & Stores ───
        $vendorData = [
            [
                'name'  => 'TechZone Store',
                'email' => 'vendor1@shofy.com',
                'store' => ['name' => 'TechZone', 'slug' => 'techzone', 'description' => 'Your one-stop shop for the latest electronics and gadgets.', 'is_verified' => true, 'commission_rate' => 10],
            ],
            [
                'name'  => 'FashionHub',
                'email' => 'vendor2@shofy.com',
                'store' => ['name' => 'FashionHub', 'slug' => 'fashionhub', 'description' => 'Trendy clothing and accessories for every occasion.', 'is_verified' => true, 'commission_rate' => 12],
            ],
            [
                'name'  => 'HomeDecor Plus',
                'email' => 'vendor3@shofy.com',
                'store' => ['name' => 'HomeDecor Plus', 'slug' => 'homedecor-plus', 'description' => 'Beautiful home goods and décor items.', 'is_verified' => false, 'commission_rate' => 8],
            ],
            [
                'name'  => 'SportsPro',
                'email' => 'vendor4@shofy.com',
                'store' => ['name' => 'SportsPro', 'slug' => 'sportspro', 'description' => 'Professional sports equipment and activewear.', 'is_verified' => true, 'commission_rate' => 10],
            ],
            [
                'name'  => 'Beauty World',
                'email' => 'vendor5@shofy.com',
                'store' => ['name' => 'Beauty World', 'slug' => 'beauty-world', 'description' => 'Premium beauty and skincare products.', 'is_verified' => true, 'commission_rate' => 15],
            ],
        ];

        $stores = [];
        foreach ($vendorData as $vd) {
            $user = User::firstOrCreate(
                ['email' => $vd['email']],
                ['name' => $vd['name'], 'password' => Hash::make('password'), 'email_verified_at' => now()]
            );
            $user->assignRole($vendorRole);

            $store = Store::firstOrCreate(
                ['slug' => $vd['store']['slug']],
                array_merge($vd['store'], [
                    'owner_id' => $user->id,
                    'status'   => 'approved',
                    'phone'    => fake()->phoneNumber(),
                    'email'    => $vd['email'],
                    'address'  => fake()->streetAddress(),
                    'city'     => fake()->city(),
                    'state'    => fake()->state(),
                    'country'  => 'US',
                    'rating'   => rand(35, 50) / 10,
                    'rating_count' => rand(50, 300),
                    'total_revenue' => rand(5000, 50000),
                    'total_sales'   => rand(100, 1000),
                ])
            );
            $stores[$vd['store']['slug']] = $store;
        }

        // ─── Products ───
        $techStore    = $stores['techzone'];
        $fashionStore = $stores['fashionhub'];
        $homeStore    = $stores['homedecor-plus'];
        $sportsStore  = $stores['sportspro'];
        $beautyStore  = $stores['beauty-world'];

        $electronicsId = $categories['electronics']->id ?? null;
        $fashionId     = $categories['fashion']->id ?? null;
        $homeId        = $categories['home-garden']->id ?? null;
        $sportsId      = $categories['sports']->id ?? null;
        $beautyId      = $categories['beauty']->id ?? null;
        $booksId       = $categories['books']->id ?? null;

        $appleId   = $brands['apple']->id ?? null;
        $samsungId = $brands['samsung']->id ?? null;
        $nikeId    = $brands['nike']->id ?? null;
        $adidasId  = $brands['adidas']->id ?? null;
        $sonyId    = $brands['sony']->id ?? null;

        $productsData = [
            // Electronics
            [
                'name' => 'iPhone 15 Pro Max', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $appleId, 'price' => 1199.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1706549622226-c4cef8afee4f?w=500&q=80',
                'description' => 'The most powerful iPhone ever with A17 Pro chip, titanium design, and incredible camera system.',
                'quantity' => 50, 'is_featured' => true, 'views' => 8420,
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $samsungId, 'price' => 1099.99, 'sale_price' => 999.99,
                'image' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
                'description' => 'Ultimate Android flagship with built-in S Pen, 200MP camera, and AI-powered features.',
                'quantity' => 45, 'is_featured' => true, 'views' => 7210,
            ],
            [
                'name' => 'Sony WH-1000XM5 Headphones', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $sonyId, 'price' => 399.99, 'sale_price' => 299.99,
                'image' => 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
                'description' => 'Industry-leading noise cancellation with exceptional sound quality and 30-hour battery life.',
                'quantity' => 80, 'is_featured' => true, 'views' => 5680,
            ],
            [
                'name' => 'Apple MacBook Pro 14"', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $appleId, 'price' => 1999.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
                'description' => 'Supercharged by M3 Pro chip with up to 22 hours battery life and stunning Liquid Retina XDR display.',
                'quantity' => 30, 'is_featured' => true, 'views' => 9120,
            ],
            [
                'name' => 'iPad Air 5th Generation', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $appleId, 'price' => 749.99, 'sale_price' => 649.99,
                'image' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
                'description' => 'Serious performance with M1 chip, beautiful 10.9" Liquid Retina display, and 5G capability.',
                'quantity' => 60, 'is_featured' => false, 'views' => 4320,
            ],
            [
                'name' => 'Samsung 65" QLED 4K Smart TV', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $samsungId, 'price' => 1299.99, 'sale_price' => 999.99,
                'image' => 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80',
                'description' => 'Quantum Dot technology for 100% Color Volume, Alexa built-in, and Ambient Mode+.',
                'quantity' => 20, 'is_featured' => false, 'views' => 3890,
            ],
            [
                'name' => 'Sony PlayStation 5', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $sonyId, 'price' => 499.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&q=80',
                'description' => 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback.',
                'quantity' => 25, 'is_featured' => true, 'views' => 11250,
            ],
            [
                'name' => 'Apple Watch Series 9', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => $appleId, 'price' => 429.99, 'sale_price' => 379.99,
                'image' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80',
                'description' => 'The most capable Apple Watch ever. Advanced health features, brighter display, and carbon neutral.',
                'quantity' => 70, 'is_featured' => false, 'views' => 6540,
            ],
            [
                'name' => 'DJI Mini 4 Pro Drone', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => null, 'price' => 759.99, 'sale_price' => 699.99,
                'image' => 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&q=80',
                'description' => '4K/60fps video, omnidirectional obstacle sensing, 34-min max flight time, under 249g.',
                'quantity' => 35, 'is_featured' => false, 'views' => 5230,
            ],
            [
                'name' => 'Logitech MX Master 3S Mouse', 'store_id' => $techStore->id, 'category_id' => $electronicsId,
                'brand_id' => null, 'price' => 99.99, 'sale_price' => 79.99,
                'image' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
                'description' => 'Advanced wireless mouse with MagSpeed scroll wheel, 8000 DPI, and quiet click performance.',
                'quantity' => 120, 'is_featured' => false, 'views' => 2840,
            ],

            // Fashion
            [
                'name' => 'Nike Air Max 270', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => $nikeId, 'price' => 149.99, 'sale_price' => 119.99,
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
                'description' => 'Nike\'s biggest Air unit yet delivers a cushioned, bouncy feel. Iconic style meets everyday comfort.',
                'quantity' => 100, 'is_featured' => true, 'views' => 7830,
            ],
            [
                'name' => 'Adidas Ultraboost 23', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => $adidasId, 'price' => 189.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
                'description' => 'Feel the energy return and cushioning comfort of these premium running shoes.',
                'quantity' => 85, 'is_featured' => true, 'views' => 6920,
            ],
            [
                'name' => 'Classic Leather Jacket', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => null, 'price' => 299.99, 'sale_price' => 249.99,
                'image' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
                'description' => 'Premium genuine leather jacket with a timeless design. Perfect for any season.',
                'quantity' => 40, 'is_featured' => false, 'views' => 3450,
            ],
            [
                'name' => 'Summer Floral Dress', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => null, 'price' => 79.99, 'sale_price' => 59.99,
                'image' => 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80',
                'description' => 'Light and breezy floral pattern dress perfect for summer occasions.',
                'quantity' => 90, 'is_featured' => true, 'views' => 5120,
            ],
            [
                'name' => 'Men\'s Slim Fit Chinos', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => null, 'price' => 69.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80',
                'description' => 'Versatile slim-fit chinos that look great for both office and casual wear.',
                'quantity' => 150, 'is_featured' => false, 'views' => 2870,
            ],
            [
                'name' => 'Designer Handbag', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => null, 'price' => 199.99, 'sale_price' => 159.99,
                'image' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
                'description' => 'Elegant leather handbag with gold hardware and multiple compartments.',
                'quantity' => 55, 'is_featured' => true, 'views' => 4680,
            ],
            [
                'name' => 'Nike Dri-FIT Running Shirt', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => $nikeId, 'price' => 49.99, 'sale_price' => 39.99,
                'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
                'description' => 'Lightweight and breathable running shirt with sweat-wicking technology.',
                'quantity' => 200, 'is_featured' => false, 'views' => 3210,
            ],
            [
                'name' => 'Ray-Ban Aviator Sunglasses', 'store_id' => $fashionStore->id, 'category_id' => $fashionId,
                'brand_id' => null, 'price' => 164.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
                'description' => 'Classic aviator style with UV protection. Timeless eyewear for all occasions.',
                'quantity' => 65, 'is_featured' => false, 'views' => 4100,
            ],

            // Home & Garden
            [
                'name' => 'Ergonomic Office Chair', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 449.99, 'sale_price' => 379.99,
                'image' => 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80',
                'description' => 'Fully adjustable ergonomic chair with lumbar support and breathable mesh back.',
                'quantity' => 30, 'is_featured' => true, 'views' => 5870,
            ],
            [
                'name' => 'Minimalist Desk Lamp', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 89.99, 'sale_price' => 69.99,
                'image' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
                'description' => 'LED desk lamp with adjustable color temperature and brightness. USB charging port.',
                'quantity' => 75, 'is_featured' => false, 'views' => 2340,
            ],
            [
                'name' => 'Ceramic Plant Pot Set', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 34.99, 'sale_price' => 24.99,
                'image' => 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80',
                'description' => 'Set of 3 modern ceramic plant pots in gradient white. Perfect for succulents and small plants.',
                'quantity' => 120, 'is_featured' => false, 'views' => 1820,
            ],
            [
                'name' => 'Scented Candle Collection', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 44.99, 'sale_price' => 34.99,
                'image' => 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500&q=80',
                'description' => 'Set of 4 hand-poured soy wax candles with premium fragrance oils. 40-hour burn time each.',
                'quantity' => 95, 'is_featured' => true, 'views' => 3460,
            ],
            [
                'name' => 'Bamboo Cutting Board Set', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 49.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1585668099984-4cee7dd4b38c?w=500&q=80',
                'description' => 'Set of 3 premium bamboo cutting boards with juice groove and easy-grip feet.',
                'quantity' => 110, 'is_featured' => false, 'views' => 2100,
            ],
            [
                'name' => 'Smart Robot Vacuum', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 349.99, 'sale_price' => 279.99,
                'image' => 'https://images.unsplash.com/photo-1603618090557-6b9c0ef14a9e?w=500&q=80',
                'description' => 'AI-powered robot vacuum with laser mapping, 3000Pa suction, and 180-min runtime.',
                'quantity' => 25, 'is_featured' => true, 'views' => 7240,
            ],
            [
                'name' => 'Throw Blanket Knitted', 'store_id' => $homeStore->id, 'category_id' => $homeId,
                'brand_id' => null, 'price' => 54.99, 'sale_price' => 44.99,
                'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
                'description' => 'Soft chunky knit throw blanket. Perfect for cozy evenings on the couch.',
                'quantity' => 80, 'is_featured' => false, 'views' => 2680,
            ],

            // Sports
            [
                'name' => 'Yoga Mat Premium', 'store_id' => $sportsStore->id, 'category_id' => $sportsId,
                'brand_id' => null, 'price' => 79.99, 'sale_price' => 59.99,
                'image' => 'https://images.unsplash.com/photo-1601925228139-f6e89b0484e3?w=500&q=80',
                'description' => 'Non-slip premium yoga mat with alignment lines, 6mm thickness, and carrying strap.',
                'quantity' => 150, 'is_featured' => true, 'views' => 4560,
            ],
            [
                'name' => 'Adjustable Dumbbell Set', 'store_id' => $sportsStore->id, 'category_id' => $sportsId,
                'brand_id' => null, 'price' => 299.99, 'sale_price' => 249.99,
                'image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80',
                'description' => 'Adjustable 5-52.5 lbs dumbbells that replace 15 sets of weights. Space-saving design.',
                'quantity' => 40, 'is_featured' => true, 'views' => 6710,
            ],
            [
                'name' => 'Resistance Band Set', 'store_id' => $sportsStore->id, 'category_id' => $sportsId,
                'brand_id' => null, 'price' => 29.99, 'sale_price' => 24.99,
                'image' => 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&q=80',
                'description' => 'Set of 5 resistance bands with different tensions. Perfect for strength training and rehabilitation.',
                'quantity' => 200, 'is_featured' => false, 'views' => 3280,
            ],
            [
                'name' => 'Hydro Flask Water Bottle', 'store_id' => $sportsStore->id, 'category_id' => $sportsId,
                'brand_id' => null, 'price' => 44.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
                'description' => 'Insulated 32oz water bottle. Keeps cold 24 hours, hot 12 hours. BPA-free.',
                'quantity' => 175, 'is_featured' => false, 'views' => 2940,
            ],
            [
                'name' => 'Adidas Running Shoes', 'store_id' => $sportsStore->id, 'category_id' => $sportsId,
                'brand_id' => $adidasId, 'price' => 129.99, 'sale_price' => 99.99,
                'image' => 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500&q=80',
                'description' => 'Lightweight and responsive running shoes with Bounce cushioning for all-day comfort.',
                'quantity' => 90, 'is_featured' => true, 'views' => 5340,
            ],
            [
                'name' => 'Foam Roller Set', 'store_id' => $sportsStore->id, 'category_id' => $sportsId,
                'brand_id' => null, 'price' => 34.99, 'sale_price' => 27.99,
                'image' => 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?w=500&q=80',
                'description' => 'High-density foam roller for deep tissue massage and muscle recovery.',
                'quantity' => 130, 'is_featured' => false, 'views' => 1870,
            ],

            // Beauty
            [
                'name' => 'Facial Serum Vitamin C', 'store_id' => $beautyStore->id, 'category_id' => $beautyId,
                'brand_id' => null, 'price' => 49.99, 'sale_price' => 39.99,
                'image' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
                'description' => 'Brightening Vitamin C serum with hyaluronic acid for glowing, hydrated skin.',
                'quantity' => 200, 'is_featured' => true, 'views' => 5890,
            ],
            [
                'name' => 'Skincare Starter Kit', 'store_id' => $beautyStore->id, 'category_id' => $beautyId,
                'brand_id' => null, 'price' => 89.99, 'sale_price' => 69.99,
                'image' => 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500&q=80',
                'description' => 'Complete 5-step skincare routine: cleanser, toner, serum, moisturizer, and SPF.',
                'quantity' => 75, 'is_featured' => true, 'views' => 4760,
            ],
            [
                'name' => 'Electric Face Massager', 'store_id' => $beautyStore->id, 'category_id' => $beautyId,
                'brand_id' => null, 'price' => 79.99, 'sale_price' => null,
                'image' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
                'description' => 'Vibrating face massager for improved circulation, reduced puffiness, and better product absorption.',
                'quantity' => 60, 'is_featured' => false, 'views' => 3120,
            ],
            [
                'name' => 'Hair Care Bundle', 'store_id' => $beautyStore->id, 'category_id' => $beautyId,
                'brand_id' => null, 'price' => 64.99, 'sale_price' => 54.99,
                'image' => 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=500&q=80',
                'description' => 'Nourishing shampoo, conditioner, and hair mask set for healthy, shiny hair.',
                'quantity' => 110, 'is_featured' => false, 'views' => 2450,
            ],
            [
                'name' => 'Luxury Perfume Collection', 'store_id' => $beautyStore->id, 'category_id' => $beautyId,
                'brand_id' => null, 'price' => 129.99, 'sale_price' => 99.99,
                'image' => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500&q=80',
                'description' => 'Set of 4 mini luxury fragrances to find your signature scent. 15ml each.',
                'quantity' => 55, 'is_featured' => true, 'views' => 6230,
            ],
        ];

        $createdProducts = [];
        foreach ($productsData as $pd) {
            $slug = Str::slug($pd['name']) . '-' . Str::random(5);
            $product = Product::firstOrCreate(
                ['name' => $pd['name'], 'store_id' => $pd['store_id']],
                array_merge($pd, [
                    'slug'        => $slug,
                    'sku'         => strtoupper(Str::random(8)),
                    'content'     => fake()->paragraphs(3, true),
                    'stock_status' => 'in_stock',
                    'with_storehouse_management' => true,
                    'status'      => 'published',
                    'order'       => 0,
                ])
            );
            $createdProducts[] = $product;
        }

        // ─── Flash Sale ───
        $flashSale = FlashSale::firstOrCreate(
            ['name' => 'Summer Mega Sale'],
            [
                'start_date' => now()->subHours(2),
                'end_date'   => now()->addDays(3),
                'status'     => 'published',
                'is_featured' => true,
            ]
        );

        // Add 6 products to flash sale with discounted prices
        $flashProducts = collect($createdProducts)->filter(fn($p) => $p->is_featured)->take(6);
        foreach ($flashProducts as $fp) {
            $flashSale->products()->syncWithoutDetaching([
                $fp->id => [
                    'price'    => round($fp->price * 0.7, 2),
                    'quantity' => 50,
                    'sold'     => rand(5, 40),
                ]
            ]);
        }

        // ─── Blog Posts ───
        $admin = User::where('email', 'admin@shofy.com')->first();
        $techBlogCat   = $blogCats['technology'] ?? null;
        $fashionBlogCat = $blogCats['fashion'] ?? null;
        $lifestyleCat  = $blogCats['lifestyle'] ?? null;

        $blogPosts = [
            [
                'title'       => 'Top 10 Tech Gadgets of 2024 You Need Right Now',
                'description' => 'Discover the most innovative tech gadgets that are transforming how we live and work in 2024.',
                'content'     => "<p>Technology continues to evolve at an unprecedented pace, bringing us gadgets that seemed like science fiction just a few years ago. From AI-powered devices to sustainable tech solutions, 2024 has been a remarkable year for innovation.</p><p>In this comprehensive guide, we'll explore the top 10 tech gadgets that have captured our imagination and proved their worth in everyday life. Whether you're a tech enthusiast or simply looking to upgrade your lifestyle, these picks offer something for everyone.</p><p>From smart home devices to wearable technology, the choices are more exciting than ever. Let's dive into what's making waves in the tech world this year.</p>",
                'image'       => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
                'is_featured' => true,
                'views'       => 12450,
                'category_id' => $techBlogCat?->id,
            ],
            [
                'title'       => 'The Ultimate Guide to Sustainable Fashion in 2024',
                'description' => 'How to build a stylish wardrobe while making eco-conscious choices that matter.',
                'content'     => "<p>Fashion is one of the world's most polluting industries, but a new wave of designers and brands are changing that. Sustainable fashion isn't just a trend—it's a movement that's reshaping the entire industry.</p><p>In this guide, we'll show you how to build a wardrobe that looks great while minimizing your environmental footprint. From choosing natural fibers to supporting ethical brands, every choice makes a difference.</p><p>Discover capsule wardrobe essentials, second-hand shopping tips, and how to care for your clothes to extend their lifespan. Looking good and doing good for the planet has never been easier.</p>",
                'image'       => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
                'is_featured' => true,
                'views'       => 8920,
                'category_id' => $fashionBlogCat?->id,
            ],
            [
                'title'       => 'Home Office Setup: Create Your Perfect Workspace',
                'description' => 'Transform any room into a productive home office with these expert tips and product recommendations.',
                'content'     => "<p>Working from home has become the new normal for millions of people worldwide. But creating a productive workspace at home requires more than just a desk and a chair.</p><p>Whether you have a dedicated room or just a corner of your bedroom, we'll show you how to design a workspace that boosts your productivity, comfort, and creativity. From ergonomic furniture to smart lighting solutions, every element matters.</p><p>In this guide, we cover everything from cable management to acoustic panels, helping you create a professional workspace that you'll love spending time in.</p>",
                'image'       => 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
                'is_featured' => false,
                'views'       => 6780,
                'category_id' => $lifestyleCat?->id,
            ],
            [
                'title'       => 'iPhone 15 Pro vs Samsung Galaxy S24 Ultra: Complete Comparison',
                'description' => 'We put the two flagship phones through their paces to find out which one deserves your money.',
                'content'     => "<p>The battle between Apple and Samsung continues with their latest flagships. Both the iPhone 15 Pro Max and Galaxy S24 Ultra represent the pinnacle of smartphone technology, each with their unique strengths.</p><p>We've spent weeks testing both devices to give you the most comprehensive comparison available. From camera performance to battery life, we cover every aspect that matters to real users.</p><p>Our verdict might surprise you. While both phones are exceptional, there are clear winners in different categories. Read on to find out which phone is right for your needs.</p>",
                'image'       => 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
                'is_featured' => true,
                'views'       => 18920,
                'category_id' => $techBlogCat?->id,
            ],
            [
                'title'       => 'Morning Skincare Routine: 5 Steps to Glowing Skin',
                'description' => 'Start your day right with a scientifically-backed skincare routine that delivers real results.',
                'content'     => "<p>Great skin doesn't happen by chance—it's the result of a consistent, well-designed skincare routine. Morning skincare is especially crucial as it protects your skin throughout the day from UV rays, pollution, and other environmental stressors.</p><p>In this guide, skincare experts break down the essential 5 steps of an effective morning routine. We'll explain why each step matters and recommend products for every skin type and budget.</p><p>Whether you're a skincare novice or a seasoned enthusiast, these tips will help you achieve your best skin ever. Consistency is key, and we'll show you how to stick to your routine.</p>",
                'image'       => 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
                'is_featured' => false,
                'views'       => 9340,
                'category_id' => $lifestyleCat?->id,
            ],
            [
                'title'       => 'Best Running Shoes for Every Budget in 2024',
                'description' => 'From budget-friendly to premium options, we\'ve tested over 30 running shoes to find the best picks.',
                'content'     => "<p>Finding the right running shoe can make the difference between an enjoyable run and a painful one. With hundreds of options on the market, choosing the right shoe for your foot type, running style, and budget can be overwhelming.</p><p>Our team of running experts has tested over 30 models to bring you the definitive guide to the best running shoes of 2024. We've evaluated cushioning, stability, breathability, durability, and value for money.</p><p>Whether you're training for your first 5K or preparing for a marathon, we have the perfect shoe recommendation for you. Discover our top picks across six categories.</p>",
                'image'       => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
                'is_featured' => false,
                'views'       => 7610,
                'category_id' => $lifestyleCat?->id,
            ],
        ];

        foreach ($blogPosts as $bp) {
            $slug = Str::slug($bp['title']);
            $catId = $bp['category_id'] ?? null;
            $blogData = $bp;
            unset($blogData['category_id']);

            $blog = Blog::firstOrCreate(
                ['slug' => $slug],
                array_merge($blogData, [
                    'slug'        => $slug,
                    'author_id'   => $admin->id,
                    'author_type' => User::class,
                    'status'      => 'published',
                    'published_at' => now()->subDays(rand(1, 30)),
                ])
            );
            if ($catId) {
                $blog->categories()->syncWithoutDetaching([$catId]);
            }
        }

        // ─── Customers ───
        $customersData = [
            ['name' => 'John Smith',    'email' => 'john@example.com'],
            ['name' => 'Emma Johnson',  'email' => 'emma@example.com'],
            ['name' => 'Michael Davis', 'email' => 'michael@example.com'],
            ['name' => 'Sarah Wilson',  'email' => 'sarah@example.com'],
            ['name' => 'Robert Brown',  'email' => 'robert@example.com'],
        ];

        $customers = [];
        foreach ($customersData as $cd) {
            $customer = Customer::firstOrCreate(
                ['email' => $cd['email']],
                ['name' => $cd['name'], 'password' => Hash::make('password'), 'email_verified_at' => now(), 'is_active' => true]
            );
            CustomerAddress::firstOrCreate(
                ['customer_id' => $customer->id, 'is_default' => true],
                [
                    'name'     => $customer->name,
                    'email'    => $customer->email,
                    'address'  => fake()->streetAddress(),
                    'city'     => fake()->city(),
                    'state'    => fake()->state(),
                    'zip_code' => fake()->postcode(),
                    'country'  => 'US',
                    'phone'    => fake()->phoneNumber(),
                    'is_default' => true,
                ]
            );
            $customers[] = $customer;
        }

        // ─── Discount Codes ───
        Discount::firstOrCreate(
            ['code' => 'WELCOME10'],
            [
                'description'      => 'Welcome Discount - 10% off',
                'type'             => 'percentage',
                'value'            => 10,
                'min_order_amount' => 50,
                'max_uses'         => 1000,
                'uses'             => 48,
                'starts_at'        => now()->subDays(30),
                'expires_at'       => now()->addDays(60),
                'status'           => 'published',
            ]
        );

        Discount::firstOrCreate(
            ['code' => 'SAVE20'],
            [
                'description'      => 'Save $20 on orders over $100',
                'type'             => 'fixed',
                'value'            => 20,
                'min_order_amount' => 100,
                'max_uses'         => 500,
                'uses'             => 127,
                'starts_at'        => now()->subDays(10),
                'expires_at'       => now()->addDays(20),
                'status'           => 'published',
            ]
        );

        // ─── Sample Orders ───
        $statuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
        $payStatuses = ['paid', 'paid', 'paid', 'paid', 'pending', 'paid'];

        foreach ($customers as $i => $customer) {
            // Each customer gets 2 orders
            for ($j = 0; $j < 2; $j++) {
                $randomProducts = collect($createdProducts)->random(rand(1, 3));
                $subTotal = 0;
                $orderItems = [];
                foreach ($randomProducts as $rp) {
                    $qty = rand(1, 2);
                    $price = $rp->sale_price ?? $rp->price;
                    $subTotal += $price * $qty;
                    $orderItems[] = ['product' => $rp, 'qty' => $qty, 'price' => $price];
                }
                $shipping   = 9.99;
                $tax        = round($subTotal * 0.1, 2);
                $total      = round($subTotal + $shipping + $tax, 2);
                $statusIdx  = ($i + $j) % count($statuses);

                $order = Order::create([
                    'customer_id'    => $customer->id,
                    'store_id'       => $orderItems[0]['product']->store_id,
                    'status'         => $statuses[$statusIdx],
                    'payment_status' => $payStatuses[$statusIdx],
                    'payment_method' => 'stripe',
                    'sub_total'      => round($subTotal, 2),
                    'tax_amount'     => $tax,
                    'shipping_amount' => $shipping,
                    'discount_amount' => 0,
                    'total_amount'   => $total,
                    'shipping_method' => 'standard',
                    'currency'       => 'USD',
                    'is_confirmed'   => true,
                    'token'          => Str::random(40),
                ]);

                foreach ($orderItems as $oi) {
                    OrderProduct::create([
                        'order_id'     => $order->id,
                        'product_id'   => $oi['product']->id,
                        'product_name' => $oi['product']->name,
                        'product_image' => $oi['product']->image,
                        'qty'          => $oi['qty'],
                        'price'        => $oi['price'],
                        'sub_total'    => round($oi['price'] * $oi['qty'], 2),
                    ]);
                }

                $addr = $customer->addresses()->first();
                if ($addr) {
                    OrderAddress::create([
                        'order_id' => $order->id,
                        'type'     => 'shipping',
                        'name'     => $addr->name,
                        'email'    => $addr->email,
                        'address'  => $addr->address,
                        'city'     => $addr->city,
                        'state'    => $addr->state,
                        'zip_code' => $addr->zip_code,
                        'country'  => $addr->country,
                        'phone'    => $addr->phone,
                    ]);
                }

                OrderHistory::create([
                    'order_id'    => $order->id,
                    'action'      => 'status_changed',
                    'description' => 'Order status: ' . $statuses[$statusIdx],
                ]);
            }
        }

        // ─── Reviews ───
        $reviewTexts = [
            ['rating' => 5, 'comment' => 'Absolutely love this product! Exceeded all my expectations. Would definitely buy again.'],
            ['rating' => 5, 'comment' => 'Perfect quality and fast shipping. This is exactly what I was looking for!'],
            ['rating' => 4, 'comment' => 'Great product overall. Minor packaging issue but the item itself is fantastic.'],
            ['rating' => 4, 'comment' => 'Really happy with this purchase. Good value for money.'],
            ['rating' => 3, 'comment' => 'Decent product but not as described. Still works well enough.'],
        ];

        $reviewableProducts = collect($createdProducts)->take(15);
        foreach ($reviewableProducts as $rp) {
            foreach ($customers as $k => $customer) {
                if ($k % 2 === 0) {
                    $rv = $reviewTexts[$k % count($reviewTexts)];
                    Review::firstOrCreate(
                        ['product_id' => $rp->id, 'customer_id' => $customer->id],
                        [
                            'star'    => $rv['rating'],
                            'comment' => $rv['comment'],
                            'status'  => 'approved',
                        ]
                    );
                }
            }

            // (product rating aggregated from reviews at query time)
        }

        $this->command->info('✅ Demo data seeded successfully!');
        $this->command->info('  → ' . count($createdProducts) . ' products');
        $this->command->info('  → ' . count($stores) . ' vendor stores');
        $this->command->info('  → ' . count($blogPosts) . ' blog posts');
        $this->command->info('  → ' . count($customers) . ' customers');
        $this->command->info('  → 10 sample orders');
        $this->command->info('  → 1 active flash sale');
        $this->command->info('  → 2 discount codes');
    }
}
