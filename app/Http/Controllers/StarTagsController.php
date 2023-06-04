<?php

namespace App\Http\Controllers;

use App\Lib\Abilities;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StarTagsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'repos' => ['required', 'array'],
            'repos.*.databaseId' => ['required', 'integer'],
            'repos.*.nameWithOwner' => ['required', 'string'],
            'repos.*.url' => ['required', 'string', 'url'],
            'repos.*.description' => ['nullable', 'string'],
            'tagId' => ['required', Rule::exists('tags', 'id')->where(function ($query) {
                return $query->where('user_id', auth()->id());
            }), ],
        ]);

        $repos = $request->input('repos');
        $tagId = $request->input('tagId');

        foreach ($repos as $repo) {
            $star = auth()->user()->stars()->firstOrCreate(['repo_id' => $repo['databaseId']], ['meta' => collect($repo)->except(['databaseId'])->toArray()]);
            $star->tags()->syncWithoutDetaching([$tagId]);
        }

        return redirect()->route('dashboard.index');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Star  $star
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $request->validate([
            'databaseId' => ['required', 'integer'],
            'nameWithOwner' => ['required', 'string'],
            'url' => ['required', 'string', 'url'],
            'description' => ['nullable', 'string'],
            'tags' => 'array',
            'tags.*.name' => ['required_with:tags', 'string'],
        ]);

        DB::beginTransaction();

        $repoId = $request->input('databaseId');
        $tags = $request->input('tags');
        $meta = $request->only(['nameWithOwner', 'url', 'description']);

        $star = auth()->user()->stars()->firstOrCreate(['repo_id' => $repoId], ['meta' => $meta]);

        $ids = [];

        if (empty($tags)) {
            $star->removeAllTags();
        } else {
            foreach ($tags as $tag) {
                $tag = auth()->user()->tags()->firstOrCreate(['name' => $tag['name']]);
                $ids[] = $tag->id;
            }
            $star->tags()->sync($ids);
        }

        if (auth()->user()->cannot('sync', Tag::class)) {
            DB::rollBack();

            return redirect()->back()->withErrors([
                'sponsorship_required' => [Abilities::CREATE_TAG],
            ]);
        }

        DB::commit();

        return redirect()->route('dashboard.index');
    }
}
