<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Suppress deprecated warnings from PHP 8.4+ to prevent them from
// being injected into JSON API responses and breaking JSON parsing.
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
