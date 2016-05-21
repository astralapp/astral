<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\ClientInterface;
use Astral\Http\Requests;
use Astral\Http\Controllers\Controller;
use Astral\Models\Star;
use Astral\Models\Tag;
use Auth;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class StarController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $stars = Star::with('tags')->where('user_id', Auth::id())->get();
        return response()->json(compact('stars'), 200);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function tag(Request $request)
    {
        $star_id = $request->input('repoId');
        $star_name = $request->input('repoName');
        $tag_id = $request->input('tagId');
        $star = Star::where('repo_id', $star_id)->where('user_id', Auth::id())->first();
        if (!is_null($star)) {
            $star->tags()->sync([$tag_id], false);
            $star->save();
        } else {
            $star = new Star();
            $star->repo_id = $star_id;
            $star->repo_name = $star_name;
            $star->save();
            $star->tags()->attach($tag_id);
        }
        $stars = Star::with('tags')->where('user_id', Auth::id())->get();
        $tags = Tag::with('stars')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
        return response()->json(compact('stars', 'tags'), 200);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncTags(Request $request)
    {
        $repo = $request->input('star');
        $tags = $request->input('tags');
        $star = Star::where('repo_id', $repo['id'])->where('user_id', Auth::id())->first();
        if (!$star) {
            $star = new Star();
            $star->repo_id = $repo['id'];
            $star->repo_name = $repo['full_name'];
            $star->save();
        }
        $tagIds = [];
        if (empty($tags)) {
            $star->tags()->sync([]);
        } else {
            foreach ($tags as $tag) {
                $tagName = strtolower($tag['name']);
                $userTag = Tag::where('name', $tagName)->where('user_id', Auth::id())->first();
                if (!$userTag) {
                    $userTag = new Tag();
                    $userTag->name = $tag['name'];
                    $userTag->save();
                }
                array_push($tagIds, $userTag->id);
                $star->tags()->sync($tagIds);
            }
        }
        $stars = Star::with('tags')->where('user_id', Auth::id())->get();
        return response()->json(compact('stars'), 200);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function editNotes(Request $request)
    {
        $repo = $request->input('star');
        $text = $request->input('text');
        $star = Star::where('repo_id', $repo['id'])->where('user_id', Auth::id())->first();
        if (!$star) {
            $star = new Star();
            $star->repo_id = $repo['id'];
            $star->repo_name = $repo['full_name'];
            $star->save();
        }
        $star->notes = $text;
        $star->save();
        $stars = Star::with('tags')->where('user_id', Auth::id())->get();
        return response()->json(compact('stars'), 200);
    }
}
