<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;
use Astral\Http\Requests;
use Astral\Http\Controllers\Controller;
use Astral\Models\Tag;
use Auth;
use Cache;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class TagController extends Controller
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
        $tags = Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
        return response()->json(compact('tags'), 200);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $tag = Tag::create($request->only('name', 'description'));
        $tags = Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
        return response()->json(compact('tags'), 200);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function reorder(Request $request)
    {
        $sortMap = $request->only('sortMap')['sortMap'];
        foreach ($sortMap as $row) {
            $tag = Tag::find((int)$row['id']);
            $tag->sort_order = $row['sort_order'];
            $tag->save();
        }
        $tags = Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
        return response()->json(compact('tags'), 200);
    }

    /**
     * @param Request $request
     * @param int $id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $tag = Tag::where('id', $id)->where('user_id', Auth::id())->first();
        $tag->name = $request->input('name');
        $tag->save();
        $tags = Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
        return response()->json(compact('tag', 'tags'), 200);
    }
}
