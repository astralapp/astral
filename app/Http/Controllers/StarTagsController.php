<?php
namespace Astral\Http\Controllers;

use Astral\Models\Star;
use Astral\Models\Tag;
use Illuminate\Http\Request;

class StarTagsController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt');
    }

    public function update(Request $request)
    {
        $id = $request->input('repo_id');
        $relayId = $request->input('relay_id');
        $star = Star::withRepoId($id)->first();
        if (!$star) {
            $star = new Star();
            $star->repo_id = $id;
            $star->relay_id = $relayId;
            $star->user_id = auth()->id();
            $star->save();
        }
        $star->syncTags($request->input('tags'));
        $star->load('tags');
        $tags = Tag::withStarCount()->get();

        return response()->json(compact('star', 'tags'));
    }
}
