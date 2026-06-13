<?php

declare(strict_types=1);

namespace App\Http\Controllers;

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
        return hybridly('auth');
    }

    public function redirectToProvider(Request $request)
    {
        $request->validate([
            'scope' => ['nullable', 'string', Rule::in(['read:user', 'public_repo'])],
        ]);

        $scope = $request->input('scope', 'read:user');
        $request->session()->put(['auth_scope' => $scope]);

        return Socialite::driver('github')
            ->setScopes([$scope])
            ->redirect();
    }

    public function handleProviderCallback(Request $request, Sponsorship $sponsorship)
    {
        $scope = $request->session()->pull('auth_scope', 'read:user');

        $githubUser = Socialite::driver('github')->user();

        $user = User::firstOrNew(['github_id' => $githubUser->getId()]);

        if (is_null($user->access_token) || $user->scope !== $scope) {
            $user->access_token = $githubUser->token;
            $user->scope = $scope;
        }

        $user->updateFromGitHubProfile($githubUser);

        $user->save();

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
