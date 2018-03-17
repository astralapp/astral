<?php

namespace Astral\Lib;

use Zttp\Zttp;
use Astral\Models\Star;
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

    $relayIds = collect($githubStars['edges'])->map(function ($edge) {
      return $edge['node']['id'];
    })->toArray();

    $userStarIds = $this->user->stars->map->relay_id->toArray();

    $idsToDelete = array_diff($userStarIds, $relayIds);

    $this->user->stars()->whereIn('relay_id', $idsToDelete)->get()->each->delete();

    return $this;

  }

  public function migrateStarIds()
  {
    $starsToFix = $this->user()->stars()->whereNull('relay_id')->get();

    foreach ($starsToFix as $star) {
      if (!$star->repo_id) {
        continue;
      }
      $repo = $this->fetchRepo($star->repo_id);
      if (!array_key_exists('node_id', $repo)) {
        continue;
      }
      $nodeId = $repo['node_id'];
      $star->update(['relay_id' => $nodeId]);
    }

    return $this;
  }

  private function fetchRepo($id)
  {
    $token = $this->user()->access_token;
    return Zttp::withHeaders([
      'Accept' => 'application/vnd.github.jean-grey-preview+json'
    ])->get("https://api.github.com/repositories/{$id}?access_token={$token}")->json();
  }
}