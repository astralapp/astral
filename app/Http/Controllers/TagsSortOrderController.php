<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;

class TagsSortOrderController extends Controller
{
    public function update(Request $request)
    {
        $tags = $request->input('tags');

        $this->validate($request, [
            'tags'              => 'required|array',
            'tags.*.id'         => 'required|integer|exists:tags,id',
            'tags.*.sort_order' => 'required|integer',
        ]);

        foreach ($tags as $tag) {
            $userTag = auth()->user()->tags()->find($tag['id']);
            $userTag->sort_order = $tag['sort_order'];
            $userTag->save();
        }

        return auth()->user()->tags()->withStarCount()->get();
    }
}
