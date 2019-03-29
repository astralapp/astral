<?php

namespace Astral\Http\Controllers;

use Astral\Models\Star;
use Illuminate\Http\Request;

class StarTagsController extends Controller
{
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
                $star->repo_id = $id;
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
        $ids = [];
        $id = $request->input('id', null);
        if ($id !== null) {
            $ids = [$id];
        } else {
            $ids = $id;
        }
        foreach ($ids as $starId) {
            $star = auth()->user()->stars()->withRepoId($starId)->first();

            if (!$star) {
                $star = new Star();
                $star->repo_id = $starId;
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
