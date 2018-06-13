<?php

namespace Astral\Lib;

use Astral\Models\Star;
use Astral\Models\User;

class Autotagger
{
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function tagByTopic($stars)
    {
        collect($stars['edges'])->each(function ($star) {
            $starId = $star['node']['databaseId'];
            $topics = collect($star['node']['repositoryTopics']['edges'])->map(function ($edge) {
                return ['name' => $edge['node']['topic']['name']];
            });

            if (count($topics)) {
                $userStar = $this->user->stars()->withRepoId($starId)->first();

                if (!$userStar) {
                    $userStar = new Star();
                    $userStar->repo_id = $starId;
                    $userStar->user_id = $this->user->id;
                    $userStar->save();
                }

                if (!$userStar->autotagged_by_topic) {
                    $userStar->syncTags($topics, false);
                    $userStar->autotagged_by_topic = true;
                    $userStar->save();
                }
            }
        });
    }
}
