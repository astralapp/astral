<?php

namespace Astral\Http\Controllers;

use Auth;
use Cache;
use Astral\Models\Tag;
use Astral\Models\Star;
use Illuminate\Http\Request;

class StarController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        return Star::with('tags')->where('user_id', Auth::id())->get();
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function tag(Request $request)
    {
        $star_id = $request->input('repoId');
        $star_name = $request->input('repoName');
        $tag_id = $request->input('tagId');
        $star = Star::withRepoId($star_id)->first();
        if (! is_null($star)) {
            $star->tags()->sync([$tag_id], false);
            $star->save();
        } else {
            $star = new Star();
            $star->attachRepoInfo($star_id, $star_name);
            $star->tags()->attach($tag_id);
        }

        return [
            'star' => Star::withTags()->where('id', $star->id)->first(),
            'tags' => Tag::withStarCount()->get(),
        ];
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function syncTags(Request $request)
    {
        $repo = $request->input('star');
        $tags = $request->input('tags');
        $star = Star::withRepoId($repo['id'])->first();
        if (! $star) {
            $star = new Star();
            $star->attachRepoInfo($repo['id'], $repo['full_name']);
            $star->save();
        }
        $tagIds = [];
        if (empty($tags)) {
            $star->removeAllTags();
        } else {
            foreach ($tags as $tag) {
                $tagName = strtolower($tag['name']);
                $userTag = Tag::whereName($tagName)->first();
                if (! $userTag) {
                    $userTag = new Tag();
                    $userTag->name = $tag['name'];
                    $userTag->save();
                }
                array_push($tagIds, $userTag->id);
                $star->tags()->sync($tagIds);
            }
        }

        return [
            'star' => Star::withTags()->where('id', $star->id)->first(),
            'tags' => Tag::withStars()->get(),
        ];
    }

    public function autotag(Request $request)
    {
        $repos = $request->input('repos');
        if (count($repos) == 0) {
            return true;
        }
        foreach ($repos as $repo) {
            if ($repo['language']) {
                $languageTag = [['name' => $repo['language']]];
                $requestData = [
                  'star' => $repo,
                  'tags' => $languageTag,
                ];
                $syncRequest = Request::create('/api/stars/syncTags', 'POST', $requestData);
                $syncRequest->headers->set('Authorization', 'Bearer '.$request->header('Authorization'));
                app()->handle($syncRequest);
            }
        }

        return [
            'stars' => Star::withTags()->get(),
            'tags' => Tag::withStarCount()->get(),
        ];
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function editNotes(Request $request)
    {
        $repo = $request->input('star');
        $text = $request->input('text');
        $star = Star::withRepoId($repo['id'])->first();
        if (! $star) {
            $star = new Star();
            $star->attachRepoInfo($repo['id'], $repo['full_name']);
        }
        $star->notes = $text;
        $star->save();

        return $star;
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cleanupStars(Request $request)
    {
        $githubStarIds = collect(Cache::get(Auth::user()->starsCacheKey())['stars'])->pluck('id');
        $starIds = Auth::user()->stars()->has('tags')->get()->pluck('repo_id');
        $starIds->diff($githubStarIds)->each(function ($id) {
            Auth::user()->stars()->withRepoId($id)->first()->delete();
        });

        return [
            'stars' => Star::withTags()->get(),
            'tags' => Tag::withStarCount()->get(),
        ];
    }
}
