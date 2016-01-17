<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

use Socialite;
use Auth;

use App\Models\User;

class AuthController extends Controller
{
    public function __construct(){
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
    public function handleProviderCallback() {
        $githubUser = Socialite::driver('github')->user();
        $id = $githubUser->getId();
        $user = User::where('github_id', $id)->first();
        $token = $githubUser->token;
        // If the user exists, just update fields that they may have changed in their Github settings
        if(!is_null($user)){
          $user->username = $githubUser->getNickname();
          if( $githubUser->getName() ) {
            $user->name = $githubUser->getName();
          }
          $user->avatar_url = $githubUser->getAvatar();
          $user->save();
        }
        // If no user was found, create a new one
        else {
          $user = new User();
          $user->github_id = $id;
          $user->username = $githubUser->getNickname();
          if( $githubUser->getName() ) {
            $user->name = $githubUser->getName();
          }
          $user->avatar_url = $githubUser->getAvatar();
          $user->save();
        }
        $jwt = JWTAuth::fromUser($user);
        return redirect('/auth?token='.$jwt.'&access_token='.$token);
    }

    public function fetchUser() {
      $user = Auth::user();
      return response()->json(compact('user'), 200);
    }

    public function logout() {
      Auth::logout();
    }

}
