<?php

declare(strict_types=1);

namespace App\Lib;

use App\Data\Enums\Ability;
use App\Exceptions\TagLimitExceededException;
use App\Models\Star;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SyncStarTags
{
    /**
     * Sync the full set of tags on a user's star for the given repo, creating the
     * star and any missing tags as needed. Shared by the web dashboard and the
     * extension API so both stay identical.
     *
     * @param  array<string, mixed>  $meta  nameWithOwner, url, description
     * @param  array<int, array{name: string}>  $tags
     *
     * @throws TagLimitExceededException when a non-sponsor exceeds the tag cap
     */
    public function handle(User $user, int $repoId, array $meta, array $tags): Star
    {
        DB::beginTransaction();

        $star = $user->stars()->firstOrCreate(
            ['repo_id' => $repoId],
            ['meta' => $meta]
        );

        $star->meta = $meta;
        $star->save();

        if (empty($tags)) {
            $star->removeAllTags();
        } else {
            $ids = [];
            foreach ($tags as $tag) {
                $ids[] = $user->tags()->firstOrCreate(['name' => $tag['name']])->id;
            }
            $star->tags()->sync($ids);
        }

        // Authorized after the writes: syncing can firstOrCreate new tags, so the
        // sponsorship cap is only knowable against the resulting tag count.
        if ($user->cannot('sync', Tag::class)) {
            DB::rollBack();

            throw new TagLimitExceededException(Ability::CREATE_TAG);
        }

        DB::commit();

        return $star;
    }
}
