<?php

use App\Http\Controllers\Admin\ReturnController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\FlashSaleController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────────────
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::put('password', [AuthController::class, 'changePassword']);
        });
    });

    // ── Products ──────────────────────────────────────────────────────────
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('api.products.index');
        Route::get('featured', [ProductController::class, 'featured']);
        Route::get('new-arrivals', [ProductController::class, 'newArrivals']);
        Route::get('best-sellers', [ProductController::class, 'bestSellers']);
        Route::get('{slug}', [ProductController::class, 'show'])->name('api.products.show');
        Route::get('{slug}/related', [ProductController::class, 'related']);
    });

    // ── Categories ────────────────────────────────────────────────────────
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('tree', [CategoryController::class, 'tree']);
        Route::get('{slug}', [CategoryController::class, 'show']);
    });

    // ── Brands ────────────────────────────────────────────────────────────
    Route::prefix('brands')->group(function () {
        Route::get('/', [BrandController::class, 'index']);
        Route::get('{slug}', [BrandController::class, 'show']);
    });

    // ── Attribute Sets (public read for product forms) ────────────────────
    Route::get('attribute-sets', [\App\Http\Controllers\Admin\AttributeSetController::class, 'index']);
    Route::get('attribute-sets/{attributeSet}', [\App\Http\Controllers\Admin\AttributeSetController::class, 'show']);

    // ── Reviews ───────────────────────────────────────────────────────────
    Route::get('reviews', [ReviewController::class, 'index']);

    // ── Flash Sales ───────────────────────────────────────────────────────
    Route::get('flash-sales/active', [FlashSaleController::class, 'active']);

    // ── Blog ──────────────────────────────────────────────────────────────
    Route::prefix('blog')->group(function () {
        Route::get('/', [BlogController::class, 'index'])->name('api.blog.index');
        Route::get('categories', [BlogController::class, 'categories']);
        Route::get('{slug}', [BlogController::class, 'show'])->name('api.blog.show');
    });

    // ── Stores ────────────────────────────────────────────────────────────
    Route::prefix('stores')->group(function () {
        Route::get('/', [StoreController::class, 'index']);
        Route::get('{slug}', [StoreController::class, 'show']);
        Route::get('{slug}/products', [StoreController::class, 'products']);

        Route::middleware('auth:sanctum')->post('register', [StoreController::class, 'register']);
    });

    // ── Cart ──────────────────────────────────────────────────────────────
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'add']);
        Route::put('{id}', [CartController::class, 'update']);
        Route::delete('{id}', [CartController::class, 'remove']);
        Route::delete('/', [CartController::class, 'clear']);
        Route::post('coupon', [CartController::class, 'applyCoupon']);
    });

    // ── Checkout ──────────────────────────────────────────────────────────
    Route::prefix('checkout')->group(function () {
        Route::post('shipping-rates', [CheckoutController::class, 'getShippingRates']);
        Route::post('payment-intent', [CheckoutController::class, 'getPaymentIntent']);
        Route::post('paypal/capture', [CheckoutController::class, 'paypalCapture']);
        Route::post('stripe/webhook', [CheckoutController::class, 'stripeWebhook']);

        Route::middleware('auth:sanctum')->post('/', [CheckoutController::class, 'placeOrder']);
    });

    // ── Orders ────────────────────────────────────────────────────────────
    Route::get('orders/track/{code}/{token}', [OrderController::class, 'track']);
    Route::post('orders/track', [OrderController::class, 'trackByEmail']);

    Route::middleware('auth:sanctum')->prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('{code}', [OrderController::class, 'show']);
        Route::post('{code}/cancel', [OrderController::class, 'cancel']);
        Route::post('{code}/return', [OrderController::class, 'requestReturn']);
        Route::post('{code}/review', [OrderController::class, 'review']);
        Route::get('{code}/invoice', [OrderController::class, 'downloadInvoice']);
    });

    // ── Wishlist ──────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('toggle', [WishlistController::class, 'toggle']);
        Route::get('check', [WishlistController::class, 'check']);
    });

    // ── Addresses ─────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('addresses')->group(function () {
        Route::get('/', [AddressController::class, 'index']);
        Route::post('/', [AddressController::class, 'store']);
        Route::put('{id}', [AddressController::class, 'update']);
        Route::delete('{id}', [AddressController::class, 'destroy']);
        Route::post('{id}/default', [AddressController::class, 'setDefault']);
    });

    // ── Newsletter ────────────────────────────────────────────────────────
    Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);
    Route::get('newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe']);

    // ── User Auth (vendors & admins) ──────────────────────────────────────
    Route::prefix('user/auth')->group(function () {
        Route::post('login', [UserAuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [UserAuthController::class, 'logout']);
            Route::get('me', [UserAuthController::class, 'me']);
        });
    });

    // ── Admin ─────────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('dashboard/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);
        Route::get('dashboard/recent-orders', [\App\Http\Controllers\Admin\DashboardController::class, 'recentOrders']);
        Route::get('dashboard/sales-chart', [\App\Http\Controllers\Admin\DashboardController::class, 'salesChart']);

        Route::get('products', [\App\Http\Controllers\Admin\ProductController::class, 'index']);
        Route::post('products', [\App\Http\Controllers\Admin\ProductController::class, 'store']);
        Route::post('products/bulk', [\App\Http\Controllers\Admin\ProductController::class, 'bulkAction']);
        Route::get('products/{product:id}', [\App\Http\Controllers\Admin\ProductController::class, 'show']);
        Route::put('products/{product:id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
        Route::delete('products/{product:id}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy']);

        Route::get('orders', [\App\Http\Controllers\Admin\OrderController::class, 'index']);
        Route::get('orders/export', [\App\Http\Controllers\Admin\OrderController::class, 'export']);
        Route::get('orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show']);
        Route::patch('orders/{order}/status', [\App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
        Route::patch('orders/{order}/payment-status', [\App\Http\Controllers\Admin\OrderController::class, 'updatePaymentStatus']);

        Route::get('customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index']);
        Route::get('customers/export', [\App\Http\Controllers\Admin\CustomerController::class, 'export']);
        Route::get('customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'show']);
        Route::patch('customers/{customer}/toggle-status', [\App\Http\Controllers\Admin\CustomerController::class, 'toggleStatus']);
        Route::delete('customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'destroy']);

        Route::get('stores', [\App\Http\Controllers\Admin\StoreController::class, 'index']);
        Route::get('stores/{store:id}', [\App\Http\Controllers\Admin\StoreController::class, 'show']);
        Route::patch('stores/{store:id}/verify', [\App\Http\Controllers\Admin\StoreController::class, 'verify']);
        Route::patch('stores/{store:id}/unverify', [\App\Http\Controllers\Admin\StoreController::class, 'unverify']);
        Route::patch('stores/{store:id}/commission', [\App\Http\Controllers\Admin\StoreController::class, 'updateCommission']);
        Route::get('withdrawals', [\App\Http\Controllers\Admin\StoreController::class, 'withdrawals']);
        Route::patch('withdrawals/{withdrawal}', [\App\Http\Controllers\Admin\StoreController::class, 'processWithdrawal']);

        Route::get('blog', [\App\Http\Controllers\Admin\BlogController::class, 'index']);
        Route::post('blog', [\App\Http\Controllers\Admin\BlogController::class, 'store']);
        Route::get('blog/{blog:id}', [\App\Http\Controllers\Admin\BlogController::class, 'show']);
        Route::put('blog/{blog:id}', [\App\Http\Controllers\Admin\BlogController::class, 'update']);
        Route::delete('blog/{blog:id}', [\App\Http\Controllers\Admin\BlogController::class, 'destroy']);

        Route::get('categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index']);
        Route::post('categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store']);
        Route::get('categories/{category:id}', [\App\Http\Controllers\Admin\CategoryController::class, 'show']);
        Route::put('categories/{category:id}', [\App\Http\Controllers\Admin\CategoryController::class, 'update']);
        Route::delete('categories/{category:id}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy']);

        Route::get('settings', [\App\Http\Controllers\Admin\SettingController::class, 'index']);
        Route::put('settings', [\App\Http\Controllers\Admin\SettingController::class, 'update']);

        Route::get('reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index']);
        Route::patch('reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'update']);
        Route::delete('reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy']);

        // Shipments
        Route::get('shipments', [ShipmentController::class, 'index']);
        Route::post('shipments', [ShipmentController::class, 'store']);
        Route::get('shipments/{shipment}', [ShipmentController::class, 'show']);
        Route::put('shipments/{shipment}', [ShipmentController::class, 'update']);
        Route::post('shipments/{shipment}/history', [ShipmentController::class, 'addHistory']);

        // Returns
        Route::get('returns', [ReturnController::class, 'index']);
        Route::get('returns/{return}', [ReturnController::class, 'show']);
        Route::patch('returns/{return}', [ReturnController::class, 'update']);

        // Brands
        Route::get('brands', [\App\Http\Controllers\Admin\BrandController::class, 'index']);
        Route::post('brands', [\App\Http\Controllers\Admin\BrandController::class, 'store']);
        Route::get('brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'show']);
        Route::put('brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'update']);
        Route::delete('brands/{brand}', [\App\Http\Controllers\Admin\BrandController::class, 'destroy']);

        // Discounts
        Route::get('discounts', [\App\Http\Controllers\Admin\DiscountController::class, 'index']);
        Route::post('discounts', [\App\Http\Controllers\Admin\DiscountController::class, 'store']);
        Route::get('discounts/{discount}', [\App\Http\Controllers\Admin\DiscountController::class, 'show']);
        Route::put('discounts/{discount}', [\App\Http\Controllers\Admin\DiscountController::class, 'update']);
        Route::delete('discounts/{discount}', [\App\Http\Controllers\Admin\DiscountController::class, 'destroy']);

        // Flash Sales
        Route::get('flash-sales', [\App\Http\Controllers\Admin\FlashSaleController::class, 'index']);
        Route::post('flash-sales', [\App\Http\Controllers\Admin\FlashSaleController::class, 'store']);
        Route::get('flash-sales/{flashSale}', [\App\Http\Controllers\Admin\FlashSaleController::class, 'show']);
        Route::put('flash-sales/{flashSale}', [\App\Http\Controllers\Admin\FlashSaleController::class, 'update']);
        Route::delete('flash-sales/{flashSale}', [\App\Http\Controllers\Admin\FlashSaleController::class, 'destroy']);
        Route::post('flash-sales/{flashSale}/products', [\App\Http\Controllers\Admin\FlashSaleController::class, 'addProduct']);
        Route::delete('flash-sales/{flashSale}/products', [\App\Http\Controllers\Admin\FlashSaleController::class, 'removeProduct']);

        // Taxes
        Route::get('taxes', [\App\Http\Controllers\Admin\TaxController::class, 'index']);
        Route::post('taxes', [\App\Http\Controllers\Admin\TaxController::class, 'store']);
        Route::put('taxes/{tax}', [\App\Http\Controllers\Admin\TaxController::class, 'update']);
        Route::delete('taxes/{tax}', [\App\Http\Controllers\Admin\TaxController::class, 'destroy']);

        // Newsletter
        Route::get('newsletter', [\App\Http\Controllers\Admin\NewsletterController::class, 'index']);
        Route::get('newsletter/stats', [\App\Http\Controllers\Admin\NewsletterController::class, 'stats']);
        Route::delete('newsletter/{newsletter}', [\App\Http\Controllers\Admin\NewsletterController::class, 'destroy']);

        // Product Tags
        Route::get('product-tags', [\App\Http\Controllers\Admin\ProductTagController::class, 'index']);
        Route::post('product-tags', [\App\Http\Controllers\Admin\ProductTagController::class, 'store']);
        Route::put('product-tags/{productTag}', [\App\Http\Controllers\Admin\ProductTagController::class, 'update']);
        Route::delete('product-tags/{productTag}', [\App\Http\Controllers\Admin\ProductTagController::class, 'destroy']);

        // Collections
        Route::get('collections', [\App\Http\Controllers\Admin\CollectionController::class, 'index']);
        Route::post('collections', [\App\Http\Controllers\Admin\CollectionController::class, 'store']);
        Route::put('collections/{collection}', [\App\Http\Controllers\Admin\CollectionController::class, 'update']);
        Route::delete('collections/{collection}', [\App\Http\Controllers\Admin\CollectionController::class, 'destroy']);

        // Labels
        Route::get('labels', [\App\Http\Controllers\Admin\LabelController::class, 'index']);
        Route::post('labels', [\App\Http\Controllers\Admin\LabelController::class, 'store']);
        Route::put('labels/{label}', [\App\Http\Controllers\Admin\LabelController::class, 'update']);
        Route::delete('labels/{label}', [\App\Http\Controllers\Admin\LabelController::class, 'destroy']);

        // Attribute Sets
        Route::get('attribute-sets', [\App\Http\Controllers\Admin\AttributeSetController::class, 'index']);
        Route::post('attribute-sets', [\App\Http\Controllers\Admin\AttributeSetController::class, 'store']);
        Route::get('attribute-sets/{attributeSet}', [\App\Http\Controllers\Admin\AttributeSetController::class, 'show']);
        Route::put('attribute-sets/{attributeSet}', [\App\Http\Controllers\Admin\AttributeSetController::class, 'update']);
        Route::delete('attribute-sets/{attributeSet}', [\App\Http\Controllers\Admin\AttributeSetController::class, 'destroy']);
        Route::get('attribute-sets/{attributeSet}/attributes', [\App\Http\Controllers\Admin\AttributeSetController::class, 'attributes']);
        Route::post('attribute-sets/{attributeSet}/attributes', [\App\Http\Controllers\Admin\AttributeSetController::class, 'storeAttribute']);
        Route::put('attribute-sets/{attributeSet}/attributes/{attribute}', [\App\Http\Controllers\Admin\AttributeSetController::class, 'updateAttribute']);
        Route::delete('attribute-sets/{attributeSet}/attributes/{attribute}', [\App\Http\Controllers\Admin\AttributeSetController::class, 'destroyAttribute']);

        // Specification Tables
        Route::get('spec-tables', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'index']);
        Route::post('spec-tables', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'store']);
        Route::get('spec-tables/{specificationTable}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'show']);
        Route::put('spec-tables/{specificationTable}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'update']);
        Route::delete('spec-tables/{specificationTable}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'destroy']);
        Route::post('spec-tables/{specificationTable}/groups', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'storeGroup']);
        Route::put('spec-groups/{group}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'updateGroup']);
        Route::delete('spec-groups/{group}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'destroyGroup']);
        Route::post('spec-groups/{group}/attributes', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'storeAttribute']);
        Route::put('spec-attributes/{attribute}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'updateAttribute']);
        Route::delete('spec-attributes/{attribute}', [\App\Http\Controllers\Admin\SpecificationTableController::class, 'destroyAttribute']);

        // Invoices
        Route::get('invoices', [\App\Http\Controllers\Admin\InvoiceController::class, 'index']);
        Route::get('invoices/{invoice:id}', [\App\Http\Controllers\Admin\InvoiceController::class, 'show']);
        Route::get('invoices/{invoice:id}/download', [\App\Http\Controllers\Admin\InvoiceController::class, 'download']);

        // Reports
        Route::get('reports/overview', [\App\Http\Controllers\Admin\ReportController::class, 'overview']);
        Route::get('reports/sales-chart', [\App\Http\Controllers\Admin\ReportController::class, 'salesChart']);
        Route::get('reports/top-products', [\App\Http\Controllers\Admin\ReportController::class, 'topProducts']);
        Route::get('reports/orders-by-status', [\App\Http\Controllers\Admin\ReportController::class, 'ordersByStatus']);
    });

    // ── Vendor ────────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:vendor|admin'])->prefix('vendor')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Vendor\DashboardController::class, 'stats']);
        Route::get('dashboard/recent-orders', [\App\Http\Controllers\Vendor\DashboardController::class, 'recentOrders']);
        Route::post('withdraw', [\App\Http\Controllers\Vendor\DashboardController::class, 'withdraw']);
        Route::get('withdrawals', [\App\Http\Controllers\Vendor\DashboardController::class, 'withdrawals']);

        Route::get('products', [\App\Http\Controllers\Vendor\ProductController::class, 'index']);
        Route::post('products', [\App\Http\Controllers\Vendor\ProductController::class, 'store']);
        Route::get('products/{product:id}', [\App\Http\Controllers\Vendor\ProductController::class, 'show']);
        Route::put('products/{product:id}', [\App\Http\Controllers\Vendor\ProductController::class, 'update']);
        Route::delete('products/{product:id}', [\App\Http\Controllers\Vendor\ProductController::class, 'destroy']);

        Route::get('store', [\App\Http\Controllers\Vendor\StoreController::class, 'show']);
        Route::put('store', [\App\Http\Controllers\Vendor\StoreController::class, 'update']);

        Route::get('orders', [\App\Http\Controllers\Vendor\OrderController::class, 'index']);
        Route::get('orders/{order}', [\App\Http\Controllers\Vendor\OrderController::class, 'show']);
        Route::post('orders/{order}/process', [\App\Http\Controllers\Vendor\OrderController::class, 'process']);
        Route::post('orders/{order}/ship', [\App\Http\Controllers\Vendor\OrderController::class, 'ship']);
    });

    // ── Affiliate (Admin) ──────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin/affiliate')->group(function () {
        Route::get('programs', [\App\Http\Controllers\Admin\AffiliateDashboardController::class, 'index']);
        Route::get('summary', [\App\Http\Controllers\Admin\AffiliateDashboardController::class, 'summary']);
        Route::get('conversions', [\App\Http\Controllers\Admin\AffiliateDashboardController::class, 'conversions']);
        Route::post('conversions/{id}/approve', [\App\Http\Controllers\Admin\AffiliateDashboardController::class, 'approve']);
    });
});
