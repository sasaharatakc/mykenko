<?php

return [

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    'default_commission' => env('DEFAULT_COMMISSION', 10),

    'min_withdrawal' => env('MIN_WITHDRAWAL', 50),

    'currency' => env('DEFAULT_CURRENCY', 'USD'),

    'currency_symbol' => env('CURRENCY_SYMBOL', '$'),

    'items_per_page' => env('ITEMS_PER_PAGE', 20),

];
