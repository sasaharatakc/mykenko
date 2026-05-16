<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $existing = Newsletter::where('email', $request->email)->first();

        if ($existing?->is_confirmed) {
            return response()->json(['message' => 'You are already subscribed.'], 422);
        }

        Newsletter::updateOrCreate(
            ['email' => $request->email],
            ['token' => Str::random(32)]
        );

        return response()->json(['message' => 'Thank you for subscribing!']);
    }

    public function unsubscribe(string $token): JsonResponse
    {
        $subscriber = Newsletter::where('token', $token)->firstOrFail();
        $subscriber->delete();
        return response()->json(['message' => 'Unsubscribed successfully.']);
    }
}
