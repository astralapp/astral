<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportLegacyData
{
    /**
     * Legacy stars imported per chunk. Small enough to keep each request well under
     * PHP's execution-time/memory limits; the frontend drives the cursor loop.
     */
    private const CHUNK_SIZE = 300;

    public function __construct(private LegacyMigration $legacy) {}

    /**
     * Pull a user's tags, smart filters, stars (+notes), and star/tag links from the
     * legacy database into the new one. Idempotent: tags/filters match by name and
     * stars by repo_id, so re-running converges instead of duplicating. Sponsorship
     * limits are intentionally not enforced — legacy data is grandfathered in.
     */
    public function handle(User $user): void
    {
        $cursor = null;

        do {
            $result = $this->importChunk($user, $cursor);
            $cursor = $result['cursor'];
        } while (! $result['done']);
    }

    /**
     * Import a single cursor-bounded batch of legacy stars, so a large account can be
     * migrated across many short requests instead of one that times out. Tags and smart
     * filters are small and bounded, so they are imported once on the first chunk
     * (`$cursor === null`). Each chunk commits on its own; the import is idempotent, so a
     * dropped connection safely resumes from the cursor.
     *
     * @return array{cursor: int|null, done: bool, total: int, processed: int}
     */
    public function importChunk(User $user, ?int $cursor, int $limit = self::CHUNK_SIZE): array
    {
        $legacyId = $this->legacy->legacyUserId($user);

        if ($legacyId === null) {
            return ['cursor' => null, 'done' => true, 'total' => 0, 'processed' => 0];
        }

        return DB::transaction(function () use ($user, $legacyId, $cursor, $limit) {
            if ($cursor === null) {
                $this->importTags($user, $legacyId);
                $this->importSmartFilters($user, $legacyId);
            }

            $legacyStars = DB::connection('legacy')
                ->table('stars')
                ->where('user_id', $legacyId)
                ->when($cursor !== null, fn ($query) => $query->where('id', '>', $cursor))
                ->orderBy('id')
                ->limit($limit)
                ->get();

            $this->importStars($user, $this->buildTagMap($user, $legacyId), $legacyStars);

            $processed = $legacyStars->count();

            return [
                'cursor' => $legacyStars->last()?->id ?? $cursor,
                'done' => $processed < $limit,
                'total' => DB::connection('legacy')->table('stars')->where('user_id', $legacyId)->count(),
                'processed' => $processed,
            ];
        });
    }

    /**
     * Rebuild the legacy-tag-id => new-tag-id map from already-imported tags (matched by
     * name), so each star chunk can resolve its tag links without re-importing tags.
     *
     * @return array<int, int>
     */
    private function buildTagMap(User $user, int $legacyId): array
    {
        $newTagIdsByName = $user->tags()->pluck('id', 'name');

        return DB::connection('legacy')
            ->table('tags')
            ->where('user_id', $legacyId)
            ->get()
            ->mapWithKeys(fn ($legacyTag) => [$legacyTag->id => $newTagIdsByName[$legacyTag->name] ?? null])
            ->filter()
            ->all();
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
     * @param  Collection<int, object>  $legacyStars  the batch to import
     */
    private function importStars(User $user, array $tagMap, Collection $legacyStars): void
    {
        if ($legacyStars->isEmpty()) {
            return;
        }

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
