<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportLegacyData
{
    public function __construct(private LegacyMigration $legacy) {}

    /**
     * Pull a user's tags, smart filters, stars (+notes), and star/tag links from the
     * legacy database into the new one. Idempotent: tags/filters match by name and
     * stars by repo_id, so re-running converges instead of duplicating. Sponsorship
     * limits are intentionally not enforced — legacy data is grandfathered in.
     */
    public function handle(User $user): void
    {
        $legacyId = $this->legacy->legacyUserId($user);

        if ($legacyId === null) {
            return;
        }

        // ponytail: per-row firstOrCreate, bounded to one user's data; batch-insert if a
        // power user's import ever gets slow.
        DB::transaction(function () use ($user, $legacyId) {
            $tagMap = $this->importTags($user, $legacyId);

            $this->importSmartFilters($user, $legacyId);

            $this->importStars($user, $legacyId, $tagMap);
        });
    }

    /**
     * @return array<int, int> legacy tag id => new tag id
     */
    private function importTags(User $user, int $legacyId): array
    {
        $map = [];

        // Ordered by sort_order so the model's creating hook numbers them in the
        // same relative order the user had.
        $legacyTags = DB::connection('legacy')
            ->table('tags')
            ->where('user_id', $legacyId)
            ->orderBy('sort_order')
            ->get();

        foreach ($legacyTags as $legacyTag) {
            $map[$legacyTag->id] = $user->tags()->firstOrCreate(['name' => $legacyTag->name])->id;
        }

        return $map;
    }

    private function importSmartFilters(User $user, int $legacyId): void
    {
        $legacyFilters = DB::connection('legacy')
            ->table('predicates')
            ->where('user_id', $legacyId)
            ->orderBy('sort_order')
            ->get();

        foreach ($legacyFilters as $legacyFilter) {
            // The body is the same JSON shape the new app stores; copy it verbatim.
            // Skip anything that isn't decodable rather than poisoning the filter list.
            if (json_decode($legacyFilter->body) === null) {
                Log::warning('Skipped legacy smart filter with invalid body', [
                    'user_id' => $user->id,
                    'legacy_predicate_id' => $legacyFilter->id,
                ]);

                continue;
            }

            $user->smartFilters()->firstOrCreate(
                ['name' => $legacyFilter->name],
                ['body' => $legacyFilter->body],
            );
        }
    }

    /**
     * @param  array<int, int>  $tagMap  legacy tag id => new tag id
     */
    private function importStars(User $user, int $legacyId, array $tagMap): void
    {
        $legacyStars = DB::connection('legacy')
            ->table('stars')
            ->where('user_id', $legacyId)
            ->get();

        $tagIdsByStar = DB::connection('legacy')
            ->table('star_tag')
            ->whereIn('star_id', $legacyStars->pluck('id'))
            ->get()
            ->groupBy('star_id');

        foreach ($legacyStars as $legacyStar) {
            $legacyTagIds = $tagIdsByStar->get($legacyStar->id, collect())->pluck('tag_id');

            // Skip bare stars (no notes and no tags): the new app treats them as
            // orphans, and the GitHub fetch already surfaces plain starred repos.
            if (blank($legacyStar->notes) && $legacyTagIds->isEmpty()) {
                continue;
            }

            $star = $user->stars()->firstOrCreate(
                ['repo_id' => $legacyStar->repo_id],
                ['notes' => $legacyStar->notes],
            );

            $newTagIds = $legacyTagIds
                ->map(fn ($legacyTagId) => $tagMap[$legacyTagId] ?? null)
                ->filter()
                ->values()
                ->all();

            if (! empty($newTagIds)) {
                $star->tags()->syncWithoutDetaching($newTagIds);
            }
        }
    }
}
