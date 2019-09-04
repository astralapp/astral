<?php

namespace Astral\Http\Controllers;

use Astral\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Socialite;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => ['redirectToProvider', 'handleProviderCallback']]);
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
        if (isset($request['error'])) {
            return redirect('/auth?error=true');
        }

        $githubUser = Socialite::driver('github')->user();
        $id = $githubUser->getId();
        $user = User::where('github_id', $id)->first();
        // If no user is found, create a new one
        if (is_null($user)) {
            $user = new User();
        }

        $scope = $request->session()->pull('auth_scope', 'read:user');

        if (is_null($user->access_token) || $user->scope != $scope) {
            $user->access_token = encrypt($githubUser->token);
        }
        // If the user exists, just update fields that they may have changed in their Github settings
        $user->mapGitHubUserData($githubUser);
        $user->scope = $scope;
        $user->save();

        auth()->login($user, true);

        return redirect('/dashboard');
    }

    public function me()
    {
        return response()->json(auth()->user());
    }

    public function logout()
    {
        auth()->logout();

        return redirect('/');
    }

    public function destroy(Request $request)
    {
        $user = auth()->user();
        $this->revokeUserAccess();
        Cache::forget($user->starsCacheKey());
        $user->tags()->delete();
        $user->stars()->delete();
        $user->delete();

        return redirect('/');
    }

    public function revokeApplicationGrant()
    {
        $this->revokeUserAccess();

        auth()->user()->update([
            'access_token' => null,
            'scope'        => null,
        ]);

        auth()->logout();

        return redirect('/');
    }

    protected function revokeUserAccess()
    {
        $client = app()->make('Astral\Lib\GitHubClient');
        $client->revokeApplicationGrant();
    }
}
