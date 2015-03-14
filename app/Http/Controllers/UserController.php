<?php

class UserController extends BaseController {
  public function authenticate() {
    $code = Input::get( 'code' );
    $gh = OAuth::consumer( 'GitHub', url('/auth'), null);

    if ( !empty( $code ) ) {
      $token = $gh->requestAccessToken($code);
      $result = json_decode( $gh->request( '/user' ), true );
      $user = User::where('github_id', $result['id'])->first();
      if(!is_null($user)){
        $user->username = $result['login'];
        if( array_key_exists('name', $result) ) {
          $user->name = $result['name'];
        }
        $user->avatar_url = $result['avatar_url'];
        $user->save();
        Auth::login($user);
      }
      else {
        $user = new User();
        $user->github_id = $result['id'];
        $user->username = $result['login'];
        if( array_key_exists('name', $result) ) {
          $user->name = $result['name'];
        }
        $user->avatar_url = $result['avatar_url'];
        $user->save();
        Auth::login($user);
      }
      return Response::json($user, 200);
    }
    else {
      $url = $gh->getAuthorizationUri();
      $res = [
        'authUrl' => urldecode($url)
      ];
      return Response::json($res, 200);
    }
  }
  public function user() {
    return Response::json(Auth::user(), 200);
  }
  public function updateAutotag() {
    $checked = Input::get('checked');
    $user = User::find( Auth::user()->id );
    $user->autotag = $checked;
    $user->save();
    return Response::json($user, 200);
  }
  public function updateCrowdtag() {
    $checked = Input::get('checked');
    $user = User::find( Auth::user()->id );
    $user->crowdtag = $checked;
    $user->save();
    return Response::json($user, 200);
  }

  public function exportData() {
    $stars = Star::with("tags")->where("user_id", Auth::user()->id)->get()->reverse()->toJson();
    $path = public_path("temp/".Auth::user()->username."_astral_data.json");
    $file = File::put($path, $stars);
    App::finish(function($request, $response) use ($path){
      File::delete($path);
    });
    return Response::download($path);
  }

  public function logout() {
    Auth::logout();
  }
}