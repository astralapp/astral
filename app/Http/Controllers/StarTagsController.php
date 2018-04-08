<?php
namespace Astral\Http\Controllers;

use Astral\Models\Star;
use Illuminate\Http\Request;

class StarTagsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function store(Request $request)
    {
        $id = $request->input('relayId');
        $tag_id = $request->input('tagId');
        $star = auth()->user()->stars()->withRepoId($id)->first();
        if (!is_null($star)) {
            $star->tags()->sync([$tag_id], false);
            $star->save();
        } else {
            $star = new Star();
            $star->relay_id = $id;
            $star->user_id = auth()->id();
            $star->save();
            $star->tags()->attach($tag_id);
        }

        return [
            'tags' => auth()->user()->tags()->withStarCount()->get(),
        ];
    }

    public function update(Request $request)
    {
        $relayIds = [];
        if ($request->input('relayId') !== null) {
            $relayIds = [$request->input('relayId')];
        } else {
            $relayIds = $request->input('relayIds');
        }
        foreach ($relayIds as $relayId) {
            $star = auth()->user()->stars()->withRepoId($relayId)->first();

            if (!$star) {
                $star = new Star();
                $star->relay_id = $relayId;
                $star->user_id = auth()->id();
                $star->save();
            }
            $star->syncTags($request->input('tags'));
            $star->load('tags');
        }
        $tags = auth()->user()->tags()->withStarCount()->get();

        return response()->json(compact('star', 'tags'));
    }
}
