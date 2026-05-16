<?php

namespace App\Console\Commands;

use App\Models\FlashSale;
use Illuminate\Console\Command;

class FlashSaleExpire extends Command
{
    protected $signature = 'flash-sales:expire';
    protected $description = 'Mark expired flash sales as inactive';

    public function handle(): int
    {
        $count = FlashSale::where('is_active', true)
            ->where('end_date', '<', now())
            ->update(['is_active' => false]);

        $this->info("Expired {$count} flash sale(s).");

        return self::SUCCESS;
    }
}
