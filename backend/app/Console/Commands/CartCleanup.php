<?php

namespace App\Console\Commands;

use App\Models\CartItem;
use Illuminate\Console\Command;

class CartCleanup extends Command
{
    protected $signature = 'cart:cleanup {--days=30 : Remove guest carts older than this many days}';
    protected $description = 'Remove old guest cart items';

    public function handle(): int
    {
        $days = (int) $this->option('days');

        $count = CartItem::whereNull('customer_id')
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        $this->info("Removed {$count} stale guest cart item(s).");

        return self::SUCCESS;
    }
}
