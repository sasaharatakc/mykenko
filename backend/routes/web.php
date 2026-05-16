<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn() => response()->json(['message' => 'Shofy API', 'version' => '1.0']));

Route::get('/up', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));
