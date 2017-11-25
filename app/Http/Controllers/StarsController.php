<?php
namespace Astral\Http\Controllers;

use Astral\Models\Star;
use Astral\Lib\GitHubClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StarsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        return Star::with('tags')->where('user_id', auth()->id())->get();
    }

    public function fetchGitHubStars(Request $request)
    {
        $token = auth()->user()->access_token;
        $client = new GitHubClient($token);
        $cursor = $request->has('cursor') ? $request->input('cursor') : null;
        $key = auth()->user()->starsCacheKey();
        $expiry = env('APP_ENV') == 'local' ? 60 * 8 : 60 * 2;

        if (Cache::has($key)) {
            $cached = Cache::get($key);

            if ((bool)$cached['pageInfo']['hasNextPage'] == false) {
                // We already have all their stars so just return them
                return $cached;
            } else {
                // Get the next page
                $next = $client->fetchStars($cached['pageInfo']['endCursor']);

                $oldEdges = $cached['edges'];
                $newEdges = $next['edges'];
                
                // Merge the old and new edges
                $edges = array_merge($oldEdges, $newEdges);
                
                // Grab the new page info
                $pageInfo = $next['pageInfo'];
                $totalCount = $next['totalCount'];
                // Create our new response and put it in the Cache
                $new = [
                    'edges' => $edges,
                    'pageInfo' => $pageInfo,
                    'totalCount' => $totalCount,
                ];
                Cache::put($key, $new, $expiry);

                // If they passed a cursor just return the new edges, else return the combined version
                return $cursor ? $next : $new;
            }
        } else {
            $cursor = null;
            $fetched = $client->fetchStars($cursor);
            Cache::put($key, $fetched, $expiry);

            return $fetched;
        }
    }
}
