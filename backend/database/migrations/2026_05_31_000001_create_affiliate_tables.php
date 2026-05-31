<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_programs', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('name');
            $table->decimal('commission_rate', 5, 4)->default(0.1); // e.g. 0.1 = 10%
            $table->enum('commission_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('fixed_amount', 10, 2)->nullable();
            $table->string('affiliate_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('affiliate_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_program_id')->constrained('affiliate_programs');
            $table->string('ref_code', 32)->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('landing_page')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('affiliate_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_program_id')->constrained('affiliate_programs');
            $table->foreignId('affiliate_click_id')->nullable()->constrained('affiliate_clicks');
            $table->foreignId('order_id')->constrained('orders');
            $table->string('ref_code', 32)->index();
            $table->decimal('order_amount', 12, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_conversions');
        Schema::dropIfExists('affiliate_clicks');
        Schema::dropIfExists('affiliate_programs');
    }
};
