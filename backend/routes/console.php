<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Expire flash sales that have ended
Schedule::command('flash-sales:expire')->everyMinute();

// Clean up expired cart sessions (older than 30 days for guests)
Schedule::command('cart:cleanup')->daily();
