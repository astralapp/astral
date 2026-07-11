<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\LegacyMigration;
use App\Lib\Sponsorship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Socialite;
use Throwable;

class AuthController extends Controller
{
    public function show()
    {
        return hybridly()->view('views.auth');
    }

    public function redirectToProvider(Request $request)
    {
        $request->validate([
            'scope' => ['nullable', 'string', Rule::in(['read:user', 'public_repo'])],
        ]);

        $scope = $request->input('scope', 'read:user');

        return Socialite::driver('github')
            ->setScopes([$scope])
            ->redirect();
    }

    public function handleProviderCallback(Request $request, Sponsorship $sponsorship, LegacyMigration $migration)
    {
        $githubUser = Socialite::driver('github')->user();

        $user = User::firstOrNew(['github_id' => $githubUser->getId()]);

        // Always store the freshly-minted token: a returning user re-signing in heals a
        // token GitHub has invalidated server-side (secret rotation, revoked grant).
        $user->access_token = $githubUser->token;
        // Trust the scopes GitHub actually granted (cumulative across authorizations) rather
        // than the scope we requested. A dropped request scope must never silently downgrade a
        // user who already granted public_repo and re-trigger the unstar upgrade prompt forever.
        $user->scope = in_array('public_repo', $githubUser->approvedScopes ?? [], true) ? 'public_repo' : 'read:user';

        $user->updateFromGitHubProfile($githubUser);

        $user->save();

        if ($user->wasRecentlyCreated) {
            try {
                $migration->markAsMigratedUnlessLegacy($user);
            } catch (Throwable $e) {
                // A legacy lookup failure must never block sign-in; the user stays
                // gated to /migrate, which is harmless when they have no data.
                Log::warning('Legacy migration check failed during login', ['user_id' => $user->id, 'exception' => $e]);
            }

            // A fresh, non-legacy account (marked migrated above) is gated to /welcome, where
            // it fetches its stars before landing on a populated dashboard. Legacy accounts
            // stay unmigrated and onboard through /migrate instead, so mark their welcome
            // complete up front to keep them off the welcome screen once they land.
            if (! $user->hasMigrated()) {
                $user->markWelcomeCompleted();
            }
        }

        if (config('app.check_for_sponsorship')) {
            try {
                $sponsorship->updateUserSponsorshipStatus($user);
            } catch (Throwable $e) {
                // A sponsorship lookup failure must never block sign-in.
                Log::warning('Sponsorship check failed during login', ['user_id' => $user->id, 'exception' => $e]);
            }
        }

        auth()->login($user, true);

        $request->session()->regenerate();

        return redirect()->route('dashboard.show');
    }

    public function revokeGrant()
    {
        auth()->user()->revokeGrant();

        return hybridly()->external(route('auth.destroy'));
    }

    public function logout(Request $request)
    {
        auth()->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return hybridly()->external(route('auth.show'));
    }
}
