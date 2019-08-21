<?php

namespace Astral\Http\Controllers;

use Astral\Models\Tag;
use Illuminate\Http\Request;

class TagsController extends Controller
{
    public function index()
    {
        return auth()->user()->tags()->withStarCount()->get();
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'bail|required|unique:tags,name,NULL,id,user_id,'.auth()->id(),
        ]);

        $name = $request->input('name');

        return auth()->user()->tags()->create(['name' => $name]);
    }

    public function update(Request $request, Tag $tag)
    {
        $this->validate($request, [
            'name' => 'bail|required|unique:tags,name,'.$tag->id.',id,user_id,'.auth()->id(),
        ]);

        $tag = auth()->user()->tags()->findOrFail($tag->id);
        $tag->name = $request->input('name');
        $tag->save();

        return auth()->user()->tags()->withStarCount()->findOrFail($tag->id);
    }

    public function destroy(Request $request, Tag $tag)
    {
        auth()->user()->tags()->findOrFail($tag->id)->delete();

        return response()->json([], 204);
    }
}
