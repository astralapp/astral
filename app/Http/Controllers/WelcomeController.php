<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class WelcomeController extends Controller
{
    public function index()
    {
        if (! auth()->user()->hasPendingWelcome()) {
            return redirect(route('dashboard.show'));
        }

        return hybridly()->view('views.welcome');
    }

    /**
     * Clear the welcome gate once the frontend has fetched the user's stars, so the next
     * dashboard visit is populated. Idempotent: safe to call from the lockout-escape path too.
     */
    public function complete(): JsonResponse
    {
        auth()->user()->markWelcomeComplete();

        return response()->json(['done' => true]);
    }
}
