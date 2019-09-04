<?php

namespace Astral\Lib;

use Illuminate\Support\Facades\Cache;

class StarsJanitor
{
    public function deleteEmptyStars()
    {
        auth()->user()->stars()->doesntHave('tags')->whereNull('notes')->get()->each->delete();

        return $this;
    }

    public function deleteUnstarredStars()
    {
        $githubStars = Cache::get(auth()->user()->starsCacheKey());

        if (is_null($githubStars) || $githubStars['pageInfo']['hasNextPage']) {
            return $this;
        }

        $ids = collect($githubStars['edges'])->map(function ($edge) {
            return $edge['node']['databaseId'];
        })->toArray();

        $userStarIds = auth()->user()->stars->map->repo_id->toArray();

        $idsToDelete = array_diff($userStarIds, $ids);
        auth()->user()->stars()->whereIn('repo_id', $idsToDelete)->get()->each->delete();

        return $this;
    }
}
