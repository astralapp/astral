<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Astral\Exceptions\NotAllGitHubStarsFetchedException;

class StarsJanitorController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function destroy()
    {
        $githubStars = Cache::get(auth()->user()->starsCacheKey());

        if (is_null($githubStars) || $githubStars['pageInfo']['hasNextPage']) {
            throw new NotAllGitHubStarsFetchedException;
        }

        $relayIds = collect($githubStars['edges'])->map(function ($edge) {
            return $edge['node']['id'];
        })->toArray();

        $userStarIds = auth()->user()->stars->map->relay_id->toArray();

        $idsToDelete = array_diff($userStarIds, $relayIds);

        auth()->user()->stars()->whereIn('relay_id', $idsToDelete)->delete();

        return auth()->user()->stars->load('tags');
    }
}
