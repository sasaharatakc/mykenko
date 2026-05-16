<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->default('percentage'); // percentage | fixed
            $table->decimal('value', 10, 2);
            $table->string('target')->default('all_orders');
            $table->decimal('min_order_amount', 15, 2)->nullable();
            $table->integer('max_uses')->nullable();
            $table->integer('uses')->default(0);
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('published');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('store_id')->nullable();
            $table->string('apply_via')->nullable();
            $table->integer('product_quantity')->nullable();
            $table->boolean('can_use_with_other_discounts')->default(false);
            $table->timestamps();

            $table->index(['code', 'status']);
        });

        Schema::create('discount_products', function (Blueprint $table) {
            $table->foreignId('discount_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['discount_id', 'product_id']);
        });

        Schema::create('discount_categories', function (Blueprint $table) {
            $table->foreignId('discount_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('product_categories')->cascadeOnDelete();
            $table->primary(['discount_id', 'category_id']);
        });

        Schema::create('discount_customers', function (Blueprint $table) {
            $table->foreignId('discount_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->primary(['discount_id', 'customer_id']);
        });

        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->string('status')->default('published');
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 15, 2);
            $table->integer('quantity')->default(0);
            $table->integer('sold')->default(0);
            $table->timestamps();
            $table->unique(['flash_sale_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_sale_products');
        Schema::dropIfExists('flash_sales');
        Schema::dropIfExists('discount_customers');
        Schema::dropIfExists('discount_categories');
        Schema::dropIfExists('discount_products');
        Schema::dropIfExists('discounts');
    }
};
