<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Send guests to the sign-in page, not the /login OAuth shortcut. The latter
        // auto-initiates GitHub OAuth, which silently re-authenticates a just-logged-out
        // user whose GitHub grant is still active, defeating logout.
        return $request->expectsJson() ? null : route('auth.show');
    }
}
