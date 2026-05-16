<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('image')->nullable();
            $table->json('images')->nullable();
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('sale_price', 15, 2)->nullable();
            $table->decimal('cost_per_item', 15, 2)->nullable();
            $table->string('sale_type')->default('fixed'); // fixed | date
            $table->timestamp('sale_starts_at')->nullable();
            $table->timestamp('sale_ends_at')->nullable();
            $table->integer('quantity')->default(0);
            $table->boolean('allow_checkout_when_out_of_stock')->default(false);
            $table->boolean('with_storehouse_management')->default(true);
            $table->string('stock_status')->default('in_stock');
            $table->decimal('weight', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();
            $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_variation')->default(false);
            $table->boolean('is_digital')->default(false);
            $table->boolean('generate_license_code')->default(false);
            $table->string('product_type')->default('physical');
            $table->integer('minimum_order_quantity')->nullable();
            $table->integer('maximum_order_quantity')->nullable();
            $table->integer('views')->default(0);
            $table->string('status')->default('published');
            $table->integer('order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('specification_table_id')->nullable()->constrained('specification_tables')->nullOnDelete();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'is_variation', 'is_featured']);
            $table->index(['brand_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['store_id', 'status']);
            $table->index('price');
            $table->index('views');
            // MySQL-only: full-text index (skipped on SQLite test databases)
            if (\DB::connection()->getDriverName() === 'mysql') {
                $table->fullText(['name', 'description', 'sku']);
            }
        });

        Schema::create('product_category', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('product_categories')->cascadeOnDelete();
            $table->primary(['product_id', 'category_id']);
        });

        Schema::create('product_tag', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_tag_id')->constrained('product_tags')->cascadeOnDelete();
            $table->primary(['product_id', 'product_tag_id']);
        });

        Schema::create('product_label_products', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_label_id')->constrained('product_labels')->cascadeOnDelete();
            $table->primary(['product_id', 'product_label_id']);
        });

        Schema::create('product_collection_products', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_collection_id')->constrained('product_collections')->cascadeOnDelete();
            $table->primary(['product_id', 'product_collection_id']);
        });

        Schema::create('product_with_attribute_set', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_attribute_set_id')->constrained('product_attribute_sets')->cascadeOnDelete();
            $table->primary(['product_id', 'product_attribute_set_id']);
        });

        Schema::create('product_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('configurable_product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->boolean('is_default')->default(false);
            $table->boolean('allow_checkout_when_out_of_stock')->default(false);
            $table->timestamps();
        });

        Schema::create('product_variation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variation_id')->constrained('product_variations')->cascadeOnDelete();
            $table->foreignId('attribute_id')->constrained('product_attributes')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variation_items');
        Schema::dropIfExists('product_variations');
        Schema::dropIfExists('product_with_attribute_set');
        Schema::dropIfExists('product_collection_products');
        Schema::dropIfExists('product_label_products');
        Schema::dropIfExists('product_tag');
        Schema::dropIfExists('product_category');
        Schema::dropIfExists('products');
    }
};
