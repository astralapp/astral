<?php

namespace Astral\Http\Controllers;

use Auth;
use Astral\Models\Tag;
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
        return Tag::withStarCount()->get();
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'bail|required|alpha_dash|unique:tags,name,NULL,id,user_id,'.Auth::id(),
        ]);
        $tag = Tag::create($request->only('name', 'description'));

        return $tag;
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
            $tag->sort_order = $row['sortOrder'];
            $tag->save();
        }

        return Tag::withStarCount()->get();
    }

    /**
     * @param Request $request
     * @param int     $id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'bail|required|alpha_dash|unique:tags,name,NULL,id,user_id,'.Auth::id(),
        ]);
        $tag = Tag::where('id', $id)->where('user_id', Auth::id())->first();
        $tag->name = $request->input('name');
        $tag->save();

        return [
            'tag' => $tag,
            'tags' => Tag::withStarCount()->get(),
        ];
    }

    /**
     * @param Request $request
     * @param int     $id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        Tag::where('id', $id)->where('user_id', Auth::id())->delete();

        return Tag::withStarCount()->get();
    }
}
