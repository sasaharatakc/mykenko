<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    private array $allowedKeys = [
        'site_name', 'site_tagline', 'site_email', 'site_phone', 'site_address',
        'site_logo', 'site_favicon', 'currency', 'currency_symbol',
        'default_commission', 'min_withdrawal', 'tax_rate',
        'maintenance_mode', 'registration_enabled', 'vendor_registration_enabled',
        'smtp_host', 'smtp_port', 'smtp_user', 'smtp_from_name',
        'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url',
    ];

    public function index()
    {
        $settings = Cache::remember('admin_settings', 3600, function () {
            return \DB::table('settings')->pluck('value', 'key')->toArray();
        });

        return response()->json(['data' => $settings]);
    }

    public function update(Request $request)
    {
        $data = $request->only($this->allowedKeys);

        foreach ($data as $key => $value) {
            \DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }

        Cache::forget('admin_settings');

        return response()->json(['message' => 'Settings updated.']);
    }
}
