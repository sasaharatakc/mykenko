<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Http\Resources\CustomerResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers',
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => 'nullable|string|max:20',
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        $token = $customer->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $token,
            'customer' => new CustomerResource($customer),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (! $customer || ! Hash::check($request->password, $customer->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (! $customer->is_active) {
            return response()->json(['message' => 'Your account has been disabled.'], 403);
        }

        $customer->update(['last_login_at' => now()]);
        $token = $customer->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new CustomerResource($request->user()));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $customer = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'dob' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
        ]);

        $customer->update($validated);

        return response()->json(new CustomerResource($customer));
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $customer = $request->user();

        if (! Hash::check($request->current_password, $customer->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $customer->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $customer = Customer::where('email', $request->email)->first();

        if ($customer) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->upsert(
                [
                    'email' => $customer->email,
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ],
                ['email'],
                ['token', 'created_at']
            );

            $resetUrl = config('shofy.frontend_url')
                . '/reset-password?token=' . $token
                . '&email=' . urlencode($customer->email);

            Mail::send([], [], function ($message) use ($customer, $resetUrl) {
                $message->to($customer->email, $customer->name)
                    ->subject('Reset Your Password — Shofy')
                    ->html(
                        "<p>Hello {$customer->name},</p>"
                        . "<p>Click the link below to reset your password. This link expires in 60 minutes.</p>"
                        . "<p><a href=\"{$resetUrl}\" style=\"color:#0989FF\">Reset Password</a></p>"
                        . "<p>If you did not request a password reset, ignore this email.</p>"
                    );
            });
        }

        return response()->json(['message' => 'If that email exists, we sent a reset link.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Reset token has expired.'], 422);
        }

        $customer = Customer::where('email', $request->email)->firstOrFail();
        $customer->update(['password' => Hash::make($request->password)]);

        $customer->tokens()->delete();
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }
}
