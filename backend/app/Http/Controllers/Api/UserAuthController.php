<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

/**
 * Handles authentication for User model (vendors & admins).
 * Customers use AuthController; this is for the back-office user types.
 */
class UserAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (isset($user->is_active) && ! $user->is_active) {
            return response()->json(['message' => 'Your account has been disabled.'], 403);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('user-api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'avatar' => $user->avatar ?? null,
                'roles'  => $user->getRoleNames(),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'avatar' => $user->avatar ?? null,
                'roles'  => $user->getRoleNames(),
                'store'  => $user->store ? [
                    'id'     => $user->store->id,
                    'name'   => $user->store->name,
                    'slug'   => $user->store->slug,
                    'status' => $user->store->status,
                ] : null,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
