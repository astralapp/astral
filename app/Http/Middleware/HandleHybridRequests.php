<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Data\SecurityData;
use App\Data\SharedData;
use App\Data\UserData;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleHybridRequests
{
    /**
     * Shares global data to every response and marks the authenticated user
     * as persistent so it survives partial reloads.
     */
    public function handle(Request $request, Closure $next): Response
    {
        hybridly()
            ->share(SharedData::from([
                'security' => SecurityData::from([
                    'user' => UserData::optional(auth()->user()),
                ]),
                'sponsorUrl' => 'https://github.com/sponsors/' . config('app.github_sponsoree_login'),
            ]))
            ->persist('security.user');

        return $next($request);
    }
}
