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
        $this->client = $client;
    }

    public function index(Request $request)
    {
        $key = auth()->user()->starsCacheKey();
        $starsToReturn = [];

        if ($request->has('refresh')) {
            Cache::forget($key);
        }

        $cursor = $request->input('cursor', null);
        $expiry = env('APP_ENV') == 'local' ? 3600 * 8 : 3600 * 2;
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

    public function unstar(Request $request)
    {
        $databaseId = (int) $request->input('databaseId');
        $nodeId = $request->input('nodeId');

        // Unstar through the GitHub API
        // $this->client->unstarStar($nodeId);

        // Remove it from DB if it exists
        $userStar = auth()->user()->stars()->where('repo_id', $databaseId)->first();
        if ($userStar) {
            $userStar->delete();
        }

        // Clear the cache
        // Cache::forget(auth()->user()->starsCacheKey());

        $tags = auth()->user()->tags()->withStarCount()->get();
        $stars = auth()->user()->stars()->with('tags')->get();

        return response()->json(compact('stars', 'tags'));
    }

    public function fetchReadme(Request $request)
    {
        return $this->client->fetchReadme($request->input('repo'));
    }
}
