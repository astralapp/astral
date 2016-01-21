<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Helpers\GithubClient;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;


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
      return response()->json(compact('stars'), 200);
  }
}
