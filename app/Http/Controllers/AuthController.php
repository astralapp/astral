<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use User;
use Auth;

class AuthController extends Controller
{
    /**
     * Redirect the user to the GitHub authentication page.
     *
     * @return Response
     */
    public function redirectToProvider()
    {
        return \Socialite::driver('github')->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     *
     * @return Response
     */
    public function handleProviderCallback() {
        $githubUser = \Socialite::driver('github')->user();
        $id = $githubUser->getId();
        $user = User::where('github_id', $id)->first();
        $token = $githubUser->token;
        // We need to add this token to the session so we can make api calls elsewhere
        session(['access_token' => $token]);
        // If the user exists, just update fields that they may have changed in their Github settings
        if(!is_null($user)){
          $user->username = $githubUser->getNickname();
          if( $githubUser->getName() ) {
            $user->name = $githubUser->getName();
          }
          $user->avatar_url = $githubUser->getAvatar();
          $user->save();
          Auth::login($user);
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
          Auth::login($user);
        }
        return redirect('/auth?authenticated=true');
    }

    public function fetchUser() {
      return \Response::json(Auth::user(), 200);
    }

    public function logout() {
      Auth::logout();
    }

}
