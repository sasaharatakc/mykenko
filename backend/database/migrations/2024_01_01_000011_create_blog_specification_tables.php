<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('published');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('blog_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_type')->default('App\\Models\\User');
            $table->string('status')->default('published');
            $table->integer('views')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();

            $table->index(['status', 'published_at']);
        });

        Schema::create('blog_category', function (Blueprint $table) {
            $table->foreignId('blog_id')->constrained('blogs')->cascadeOnDelete();
            $table->foreignId('blog_category_id')->constrained('blog_categories')->cascadeOnDelete();
            $table->primary(['blog_id', 'blog_category_id']);
        });

        Schema::create('blog_tag', function (Blueprint $table) {
            $table->foreignId('blog_id')->constrained('blogs')->cascadeOnDelete();
            $table->foreignId('blog_tag_id')->constrained('blog_tags')->cascadeOnDelete();
            $table->primary(['blog_id', 'blog_tag_id']);
        });

        Schema::create('specification_tables', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('specification_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('specification_table_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('specification_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('specification_group_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('value')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('global_options', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('required')->default(false);
            $table->string('type')->default('text');
            $table->integer('order')->default(0);
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('global_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('option_id')->constrained('global_options')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->string('price_type')->default('fixed');
            $table->string('image')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_options', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('global_option_id')->constrained('global_options')->cascadeOnDelete();
            $table->primary(['product_id', 'global_option_id']);
        });

        Schema::create('newsletters', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->boolean('is_confirmed')->default(false);
            $table->string('token')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletters');
        Schema::dropIfExists('product_options');
        Schema::dropIfExists('global_option_values');
        Schema::dropIfExists('global_options');
        Schema::dropIfExists('specification_attributes');
        Schema::dropIfExists('specification_groups');
        Schema::dropIfExists('specification_tables');
        Schema::dropIfExists('blog_tag');
        Schema::dropIfExists('blog_category');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('blog_tags');
        Schema::dropIfExists('blog_categories');
    }
};
