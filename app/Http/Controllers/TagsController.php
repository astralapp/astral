<?php

namespace App\Http\Controllers;

use App\Lib\Abilities;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return auth()->user()->tags;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (auth()->user()->cannot('create', Tag::class)) {
            return redirect()->back()->withErrors([
                'sponsorship_required' => [Abilities::CREATE_TAG],
            ]);
        }

        $request->validate([
            'name' => 'bail|required|string|unique:tags,name,NULL,id,user_id,'.auth()->id(),
        ], [
            'required' => 'You must give a name to your tag.',
            'unique' => 'You already have a tag with that name.',
        ]);

        auth()->user()->tags()->create(['name' => $request->input('name')]);

        return redirect()->route('dashboard.index');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Tag $tag)
    {
        $this->validate($request, [
            'name' => 'bail|required|string|unique:tags,name,'.$tag->id.',id,user_id,'.auth()->id(),
        ], [
            'required' => 'You must give a name to your tag.',
            'unique' => 'You already have a tag with that name.',
        ]);

        $tag->name = $request->input('name');
        $tag->save();

        return redirect()->route('dashboard.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->route('dashboard.index');
    }
}
