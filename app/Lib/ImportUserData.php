<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ImportUserData
{
    /**
     * Upsert a user's exported tags, stars, and smart filters into their account.
     * File-wins: matching records (tag/filter by name, star by repo_id) are
     * overwritten, so re-importing the same file converges instead of duplicating.
     * Runs in one transaction — a malformed import leaves the account untouched.
     *
     * @param  array<string, mixed>  $data
     * @return array{tags: int, stars: int, smart_filters: int}
     */
    public function handle(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data): array {
            $this->importTags($user, $data['tags'] ?? []);

            $tagsByName = $user->tags()->get()->keyBy('name');

            $this->importStars($user, $data['stars'] ?? [], $tagsByName);
            $this->importSmartFilters($user, $data['smart_filters'] ?? [], $tagsByName);

            return [
                'tags' => count($data['tags'] ?? []),
                'stars' => count($data['stars'] ?? []),
                'smart_filters' => count($data['smart_filters'] ?? []),
            ];
        });
    }

    /**
     * @param  array<int, array{name: string, sort_order?: int}>  $tags
     */
    private function importTags(User $user, array $tags): void
    {
        foreach ($tags as $tag) {
            $model = $user->tags()->firstOrCreate(['name' => $tag['name']]);

            // The creating hook auto-numbers sort_order; overwrite it with the file's.
            if (array_key_exists('sort_order', $tag)) {
                $model->sort_order = (int) $tag['sort_order'];
                $model->save();
            }
        }
    }

    /**
     * @param  array<int, array{repo_id: int, notes?: ?string, meta?: ?array<string, mixed>, tags?: array<int, string>}>  $stars
     * @param  Collection<string, Tag>  $tagsByName
     */
    private function importStars(User $user, array $stars, Collection $tagsByName): void
    {
        foreach ($stars as $star) {
            $attributes = ['notes' => $star['notes'] ?? null];

            if (array_key_exists('meta', $star)) {
                $attributes['meta'] = $star['meta'];
            }

            $model = $user->stars()->updateOrCreate(['repo_id' => $star['repo_id']], $attributes);

            $tagIds = collect($star['tags'] ?? [])
                ->map(fn (string $name) => $tagsByName->get($name)?->id)
                ->filter()
                ->values()
                ->all();

            // File-wins: replace the star's tag set entirely.
            $model->tags()->sync($tagIds);
        }
    }

    /**
     * @param  array<int, array{name: string, sort_order?: int, body?: array<string, mixed>}>  $filters
     * @param  Collection<string, Tag>  $tagsByName
     */
    private function importSmartFilters(User $user, array $filters, Collection $tagsByName): void
    {
        foreach ($filters as $filter) {
            $model = $user->smartFilters()->firstOrCreate(['name' => $filter['name']]);

            $model->body = $this->resolveBodyTags($filter['body'] ?? [], $tagsByName);

            if (array_key_exists('sort_order', $filter)) {
                $model->sort_order = (int) $filter['sort_order'];
            }

            $model->save();
        }
    }

    /**
     * Re-resolve name-only tag references in a filter body to the importing user's
     * tags. Unknown names are left name-only so the filter still loads and simply
     * matches nothing for that predicate.
     *
     * @param  array<string, mixed>  $body
     * @param  Collection<string, Tag>  $tagsByName
     * @return array<string, mixed>
     */
    private function resolveBodyTags(array $body, Collection $tagsByName): array
    {
        if (! isset($body['groups']) || ! is_array($body['groups'])) {
            return $body;
        }

        $body['groups'] = array_map(function (array $group) use ($tagsByName): array {
            $group['predicates'] = array_map(function (array $predicate) use ($tagsByName): array {
                if (($predicate['selectedTarget'] ?? null) === 'tags' && is_array($predicate['argument'] ?? null)) {
                    $predicate['argument'] = array_map(function (array $tag) use ($tagsByName): array {
                        $model = $tagsByName->get($tag['name'] ?? null);

                        return $model
                            ? ['id' => $model->id, 'name' => $model->name, 'user_id' => $model->user_id, 'sort_order' => (int) $model->sort_order]
                            : ['name' => $tag['name'] ?? null];
                    }, $predicate['argument']);
                }

                return $predicate;
            }, $group['predicates'] ?? []);

            return $group;
        }, $body['groups']);

        return $body;
    }
}
