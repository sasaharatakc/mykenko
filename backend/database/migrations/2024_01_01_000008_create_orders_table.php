<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('token', 64)->unique()->nullable();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->decimal('sub_total', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('shipping_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('payment_fee', 10, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->decimal('coupon_discount', 10, 2)->default(0);
            $table->text('discount_description')->nullable();
            $table->string('shipping_method')->nullable();
            $table->string('shipping_option')->nullable();
            $table->string('tracking_id')->nullable();
            $table->text('note')->nullable();
            $table->text('private_notes')->nullable();
            $table->boolean('is_confirmed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->string('proof_file')->nullable();
            $table->string('currency')->default('USD');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['store_id', 'status']);
        });

        Schema::create('order_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('shipping'); // shipping | billing
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('zip_code')->nullable();
            $table->timestamps();
        });

        Schema::create('order_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('product_image')->nullable();
            $table->integer('qty')->default(1);
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('sub_total', 15, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->json('options')->nullable();
            $table->string('product_type')->default('physical');
            $table->json('product_file_ids')->nullable();
            $table->unsignedBigInteger('variation_id')->nullable();
            $table->string('license_code')->nullable();
            $table->boolean('restock_quantity_when_cancelled')->default(true);
            $table->timestamps();
        });

        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->text('description')->nullable();
            $table->json('extras')->nullable();
            $table->timestamps();
        });

        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->string('return_reason')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->string('status')->default('pending');
            $table->text('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('order_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_product_id')->nullable()->constrained('order_products')->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('qty')->default(1);
            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_return_items');
        Schema::dropIfExists('order_returns');
        Schema::dropIfExists('order_histories');
        Schema::dropIfExists('order_products');
        Schema::dropIfExists('order_addresses');
        Schema::dropIfExists('orders');
    }
};
