<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class BrowserExtensionTokenController extends Controller
{
    /**
     * Generate (or regenerate) the user's single browser-extension token and
     * return the plaintext value once. Returns JSON so the secret never rides
     * through Hybridly's persisted shared props.
     */
    public function store(): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $user->tokens()->where('name', User::BROWSER_EXTENSION_TOKEN)->delete();

        return response()->json([
            'token' => $user->createToken(User::BROWSER_EXTENSION_TOKEN)->plainTextToken,
        ]);
    }

    public function destroy(): Response
    {
        auth()->user()->tokens()->where('name', User::BROWSER_EXTENSION_TOKEN)->delete();

        return response()->noContent();
    }
}
