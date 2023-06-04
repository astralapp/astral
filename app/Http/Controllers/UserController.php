<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class UserController extends Controller
{
    public function revokeGrant()
    {
        auth()->user()->revokeGrant();

        return Inertia::location(route('logout'));
    }

    public function destroy()
    {
        $user = auth()->user();
        auth()->logout();
        $user->delete();

        return Inertia::location(route('auth'));
    }
}
