<?php

namespace Astral\Lib;

use Astral\Models\User;
use Illuminate\Support\Facades\Cache;

class StarsJanitor
{
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function deleteEmptyStars()
    {
        $this->user->stars()->doesntHave('tags')->whereNull('notes')->get()->each->delete();

        return $this;
    }

    public function deleteUnstarredStars()
    {
        $githubStars = Cache::get($this->user->starsCacheKey());

        if (is_null($githubStars) || $githubStars['pageInfo']['hasNextPage']) {
            return $this;
        }

        $ids = collect($githubStars['edges'])->map(function ($edge) {
            return $edge['node']['databaseId'];
        })->toArray();

        $userStarIds = $this->user->stars->map->repo_id->toArray();

        $idsToDelete = array_diff($userStarIds, $ids);

        $this->user->stars()->whereIn('repo_id', $idsToDelete)->get()->each->delete();

        return $this;
    }
}
