<?php

namespace Astral\Http\Controllers;

use Astral\Lib\GitHubClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GitHubStarsController extends Controller
{
    protected $client;

    public function __construct(GitHubClient $client)
    {
        $this->middleware('auth:api');
        $this->client = $client;
    }

    public function index(Request $request)
    {
        $key = auth()->user()->starsCacheKey();
        $starsToReturn = [];

        if ($request->has('refresh')) {
            Cache::forget($key);
        }

        $cursor = $request->has('cursor') ? $request->input('cursor') : null;
        $expiry = env('APP_ENV') == 'local' ? 60 * 8 : 60 * 2;
        if (Cache::has($key)) {
            $cached = Cache::get($key);

            if ((bool) $cached['pageInfo']['hasNextPage'] == false) {
                // We already have all their stars so just return them
                $starsToReturn = $cached;
            } else {
                // Get the next page
                $next = $this->client->fetchStars($cached['pageInfo']['endCursor']);

                $oldEdges = $cached['edges'];
                $newEdges = $next['edges'];

                // Merge the old and new edges
                $edges = array_merge($oldEdges, $newEdges);

                // Grab the new page info
                $pageInfo = $next['pageInfo'];
                $totalCount = $next['totalCount'];
                // Create our new response and put it in the Cache
                $new = [
                    'edges'      => $edges,
                    'pageInfo'   => $pageInfo,
                    'totalCount' => $totalCount,
                ];
                Cache::put($key, $new, $expiry);

                // If they passed a cursor just return the new edges, else return the combined version
                $starsToReturn = $cursor ? $next : $new;
            }
        } else {
            $cursor = null;
            $fetched = $this->client->fetchStars($cursor);
            Cache::put($key, $fetched, $expiry);

            $starsToReturn = $fetched;
        }

        return $starsToReturn;
    }
}
