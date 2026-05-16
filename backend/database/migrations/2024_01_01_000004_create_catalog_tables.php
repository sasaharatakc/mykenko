<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->string('website')->nullable();
            $table->integer('order')->default(0);
            $table->string('status')->default('published');
            $table->boolean('is_featured')->default(false);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->string('status')->default('published');
            $table->boolean('is_featured')->default(false);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->decimal('percentage', 5, 2)->default(0);
            $table->string('status')->default('published');
            $table->integer('priority')->default(0);
            $table->timestamps();
        });

        Schema::create('product_attribute_sets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('display_layout')->default('dropdown');
            $table->integer('order')->default(0);
            $table->string('status')->default('published');
            $table->boolean('is_searchable')->default(false);
            $table->boolean('is_comparable')->default(false);
            $table->boolean('use_image_from_product_variation')->default(false);
            $table->timestamps();
        });

        Schema::create('product_attributes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('color')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('attribute_set_id')->constrained('product_attribute_sets')->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('product_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('product_labels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->default('#000000');
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('product_collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('status')->default('published');
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_collections');
        Schema::dropIfExists('product_labels');
        Schema::dropIfExists('product_tags');
        Schema::dropIfExists('product_attributes');
        Schema::dropIfExists('product_attribute_sets');
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('brands');
    }
};
