<?php

namespace Astral\Http\Controllers;

use Astral\Lib\GithubClient;
use Astral\Models\Star;
use Astral\Models\Tag;
use Auth;
use Illuminate\Http\Request;

class GithubController extends Controller
{
    public function __construct()
    {
        return $this->middleware('jwt.auth');
    }

    /**
     * @param Request $request
     * @param GithubClient $client
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStars(Request $request)
    {
        $page = (int) $request->input('page', 1);
        $access_token = $request->header('Access-Token');
        $githubClient = new GithubClient($access_token);
        $stars = $githubClient->getStars($page);

        return $this->mapStarsToRepos($stars);
    }

    /**
     * @param array $stars
     *
     * @return array
     */
    private function mapStarsToRepos($stars)
    {
        for ($i = 0; $i <= count($stars['stars']) - 1; ++$i) {
            // Current Repo in loop
            $repo = $stars['stars'][$i];
            // User star with repo id
            $star = Star::withRepoId($repo['id'])->first();
            // If user has autotag turned on and the repo has a language set
            if (Auth::user()->autotag && $repo['language']) {
              // If no star, create one first
              if (! $star) {
                  $star = new Star();
                  $star->attachRepoInfo($repo['id'], $repo['full_name']);
                  $star->save();
              }
              // Look for a tag with that name
              $tagName = strtolower($repo['language']);
              $userTag = Tag::whereName($tagName)->first();
              // If the tag isn't found, create a new one
              if (! $userTag) {
                  $userTag = new Tag();
                  $userTag->name = $repo['language'];
                  $userTag->save();
              }
              $star->tags()->sync([$userTag->id]);
            }
            $userStar = Star::with('tags')->where('user_id', Auth::id())->where(
                'repo_id', $stars['stars'][$i]['id']
            )->first();
            if ($userStar) {
                $stars['stars'][$i]['tags'] = $userStar->tags;
            } else {
                $stars['stars'][$i]['tags'] = [];
            }
        }

        return [
            'stars' => $stars,
            'tags' => Tag::withStars()->get(),
        ];
    }
}
