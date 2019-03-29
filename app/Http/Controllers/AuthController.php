<?php

namespace Astral\Http\Controllers;

use Astral\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use JWTAuth;
use Socialite;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt', ['except' => ['redirectToProvider', 'handleProviderCallback']]);
    }

    public function redirectToProvider()
    {
        return Socialite::driver('github')
            ->setScopes(['read:user'])
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
        // If the user exists, just update fields that they may have changed in their Github settings
        if (is_null($user)) {
            $user = new User();
        } // If no user was found, create a new one
        $user->mapGitHubUser($githubUser);
        $jwt = 'Bearer '.JWTAuth::fromUser($user);

        return redirect('/auth?token='.$jwt);
    }

    public function me(Request $request)
    {
        return response()->json(auth()->user());
    }

    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => 'Bearer '.$token,
            'token_type'   => 'bearer',
        ]);
    }

    public function logout()
    {
        auth()->logout();

        return response()->json([], 204);
    }

    public function destroy(Request $request)
    {
        $user = auth()->user();
        $this->revokeUserAccess();
        Cache::forget($user->starsCacheKey());
        $user->tags()->delete();
        $user->stars()->delete();
        $user->delete();

        return response()->json([], 204);
    }

    public function revokeApplicationGrant()
    {
        $this->revokeUserAccess();
        auth()->logout();

        return response()->json([], 204);
    }

    protected function revokeUserAccess()
    {
        $client = app()->make('Astral\Lib\GitHubClient');
        $client->revokeApplicationGrant();
    }
}
