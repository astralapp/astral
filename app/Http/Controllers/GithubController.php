<?php

namespace Astral\Http\Controllers;

use Astral\Helpers\GithubClient;
use Astral\Http\Requests;
use Astral\Models\Star;
use Auth;
use Illuminate\Http\Request;
use JWTAuth;

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
    public function getStars(Request $request, GithubClient $client)
    {
        $page = (int)$request->input('page', 1);
        $access_token = $request->header('Access-Token');
        $stars = $client->getStars($page, $access_token);
        for ($i = 0; $i <= count($stars['stars']) - 1; $i++) {
            $userStar = Star::with('tags')->where('user_id', Auth::id())->where(
                'repo_id', $stars['stars'][$i]['id']
            )->first();
            if ($userStar) {
                $stars['stars'][$i]['tags'] = $userStar->tags;
            } else {
                $stars['stars'][$i]['tags'] = [];
            }
        }

        return $stars;
    }
}
