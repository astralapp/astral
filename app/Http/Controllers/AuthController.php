<?php

namespace Astral\Http\Controllers;

use Astral\Models\User;
use Auth;
use JWTAuth;
use Socialite;
use Log;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['only' => ['fetchUser']]);
    }

    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @return Response
     */
    public function redirectToProvider()
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @return Response
     */
    public function handleProviderCallback(Request $request)
    {
        if (isset($request['error'])) {
            return redirect('/auth?error=true');
        }
        $githubUser = Socialite::driver('github')->user();
        $id = $githubUser->getId();
        $user = User::where('github_id', $id)->first();
        $token = $githubUser->token;
        // If the user exists, just update fields that they may have changed in their Github settings
        if (! is_null($user)) {
            $user->mapGithubUser($githubUser);
            $user->save();
        } // If no user was found, create a new one
        else {
            $user = new User();
            $user->mapGithubUser($githubUser);
            $user->save();
        }
        $jwt = JWTAuth::fromUser($user);

        return redirect('/auth?token='.$jwt.'&access_token='.$token);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchUser()
    {
        return Auth::user();
    }

    public function logout()
    {
        if ($token = JWTAuth::getToken()) {
            try {
                JWTAuth::invalidate($token);
            } catch (Exception $e) {
                Log::error($e);
            }
        }

        return redirect('auth');
    }
}
