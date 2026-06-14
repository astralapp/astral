<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exceptions\TagLimitExceededException;
use App\Lib\SyncStarTags;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StarTagsController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
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
            'tagId' => [
                'required',
                Rule::exists('tags', 'id')
                    ->where(fn ($query) => $query->where('user_id', auth()->id())),
            ],
        ]);

        $repos = $request->input('repos');
        $tagId = $request->input('tagId');

        foreach ($repos as $repo) {
            $star = auth()
                ->user()
                ->stars()
                ->firstOrCreate(
                    ['repo_id' => $repo['databaseId']],
                    ['meta' => collect($repo)->except(['databaseId'])->toArray()]
                );

            $star->tags()->syncWithoutDetaching([$tagId]);
        }

        return redirect()->route('dashboard.show');
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, SyncStarTags $syncStarTags)
    {
        $request->validate([
            'databaseId' => ['required', 'integer'],
            'nameWithOwner' => ['required', 'string'],
            'url' => ['required', 'string', 'url'],
            'description' => ['nullable', 'string'],
            'tags' => 'array',
            'tags.*.name' => ['required_with:tags', 'string'],
        ]);

        try {
            $syncStarTags->handle(
                auth()->user(),
                (int) $request->input('databaseId'),
                $request->only(['nameWithOwner', 'url', 'description']),
                $request->input('tags', []),
            );
        } catch (TagLimitExceededException $e) {
            return $this->sponsorshipRequired($e->ability);
        }

        return redirect()->route('dashboard.show');
    }
}
