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
        $starIds = $request->input('starIds');
        $tagId = $request->input('tag')['id'];

        foreach ($starIds as $id) {
            $star = auth()->user()->stars()->withRepoId($id)->first();
            if (!is_null($star)) {
                $star->tags()->sync([$tagId], false);
                $star->save();
            } else {
                $star = new Star();
                $star->relay_id = $id;
                $star->user_id = auth()->id();
                $star->save();
                $star->tags()->attach($tagId);
            }
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
