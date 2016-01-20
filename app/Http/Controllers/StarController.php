<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Models\Star;
use App\Models\Tag;
use Auth;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;


class StarController extends Controller
{
  public function __construct()
  {
    $this->middleware("jwt.auth");
  }

  public function index(){
    $stars = Star::with('tags')->where('user_id', Auth::id())->get();
    return response()->json(compact('stars'), 200);
  }

  public function tag(Request $request){
    $star_id = $request->input('repoId');
		$star_name = $request->input('repoName');
    $tag_id = $request->input('tagId');
    $star = Star::where('repo_id', $star_id)->where('user_id', Auth::id())->first();
    if(!is_null($star)){
      $star->tags()->sync([$tag_id], false);
      $star->save();
    }
    else {
      $star = new Star();
      $star->repo_id = $star_id;
      $star->repo_name = $star_name;
      $star->save();
      $star->tags()->attach($tag_id);
    }
    $tags = Tag::with('stars')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
    return response()->json(compact('tags'), 200);
  }
}
