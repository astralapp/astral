<?php

namespace Astral\Http\Controllers;

use Astral\Models\Tag;
use Auth;
use Illuminate\Http\Request;

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
        return Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $tag = Tag::create($request->only('name', 'description'));

        return Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
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
            $tag = Tag::find((int) $row['id']);
            $tag->sort_order = $row['sort_order'];
            $tag->save();
        }

        return Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get();
    }

    /**
     * @param Request $request
     * @param int     $id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $tag = Tag::where('id', $id)->where('user_id', Auth::id())->first();
        $tag->name = $request->input('name');
        $tag->save();

        return [
            'tag' => $tag,
            'tags' => Tag::with('stars.tags')->where('user_id', Auth::id())->orderBy('sort_order', 'asc')->get(),
        ];
    }
}
