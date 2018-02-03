<?php
namespace Astral\Http\Controllers;

use JWTAuth;
use Socialite;
use Astral\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['redirectToProvider', 'handleProviderCallback']]);
    }

    public function redirectToProvider()
    {
        return Socialite::driver('github')->redirect();
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
        if (!is_null($user)) {
            $user->mapGithubUser($githubUser);
        } // If no user was found, create a new one
        else {
            $user = new User();
            $user->mapGithubUser($githubUser);
        }
        $jwt = JWTAuth::fromUser($user);
        $jwtExpiry = $this->guard()->factory()->getTTL() * 60;
        return redirect('/auth?token=' . $jwt . '&token_expiry=' . $jwtExpiry);
    }

    public function me(Request $request)
    {
        return response()->json($this->guard()->user());
    }

    public function refresh()
    {
        return $this->respondWithToken($this->guard()->refresh());
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $this->guard()->factory()->getTTL() * 60
        ]);
    }

    public function logout()
    {
        $this->guard()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }


    public function guard()
    {
        return Auth::guard();
    }
}
