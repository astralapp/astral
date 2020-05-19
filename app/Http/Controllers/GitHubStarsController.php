<?php

namespace Astral\Http\Controllers;

use Astral\Lib\GitHubClient;
use Illuminate\Http\Request;

class GitHubStarsController extends Controller
{
    protected $client;

    public function __construct(GitHubClient $client)
    {
        $this->client = $client;
    }

    public function unstar(Request $request)
    {
        $databaseId = (int) $request->input('databaseId');

        // Remove it from DB if it exists
        $userStar = auth()->user()->stars()->where('repo_id', $databaseId)->first();

        if ($userStar) {
            $userStar->delete();
            $tags = auth()->user()->tags()->withStarCount()->get();
            $stars = auth()->user()->stars()->with('tags')->get();

            return response()->json(compact('stars', 'tags'));
        } else {
            return response()->json([], 204);
        }


    }
}
