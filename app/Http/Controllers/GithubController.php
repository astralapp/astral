<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class GithubController extends Controller
{

  public function getStars(Request $request)
  {
    if( \Auth::check() ){
      $page = (int)$request->input('page', 1);
      $stars = \GithubClient::getStars($page);
      return \Response::json($stars, 200);
    }
    else {
      return \Response::json('Unauthorized', 401);
    }
  }

  public function getReadme(Request $request, $owner, $repo)
  {
    $readme = \GithubClient::getReadme($owner, $repo);
    return \Response::json($readme, 200);
  }
}
