<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Helpers\GithubClient;
use Auth;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\Star;


class GithubController extends Controller
{
  public function __construct() {
    return $this->middleware('jwt.auth');
  }

  public function getStars(Request $request, GithubClient $client)
  {
      $page = (int)$request->input('page', 1);
      $access_token = $request->header('Access-Token');
      $stars = $client->getStars($page, $access_token);
      for($i = 0; $i <= count($stars['stars']) - 1; $i++){
        $userStar = Star::with('tags')->where('user_id', Auth::id())->where('repo_id', $stars['stars'][$i]['id'])->first();
        if($userStar){
          $stars['stars'][$i]['tags'] = $userStar->tags;
        }
        else {
          $stars['stars'][$i]['tags'] = [];
        }
      }
      return response()->json(compact('stars'), 200);
  }
}
