<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Socialite;

class AuthController extends Controller
{
    public function index()
    {
        return view('welcome');
    }

    public function redirectToProvider(Request $request)
    {
        $scope = $request->input('scope', 'read:user');
        $request->session()->put(['auth_scope' => $scope]);

        return Socialite::driver('github')
            ->setScopes([$scope])
            ->redirect();
    }

    public function handleProviderCallback(Request $request)
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

        auth()->login($user, true);

        return redirect()->route('dashboard.index');
    }

    public function revokeGrant()
    {
        auth()->user()->revokeGrant();

        return Inertia::location(route('logout'));
    }

    public function logout()
    {
        auth()->logout();

        return redirect(route('auth'));
    }
}
