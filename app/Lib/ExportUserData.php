<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\SmartFilter;
use App\Models\Star;
use App\Models\Tag;
use App\Models\User;

class ExportUserData
{
    public const VERSION = 1;

    /**
     * Build a portable, instance-independent snapshot of the user's Astral layer:
     * tags, DB stars (notes + meta + tag names), and smart filters. Keyed on
     * natural keys (repo_id, tag/filter name) so it can be re-imported anywhere.
     *
     * @return array<string, mixed>
     */
    public function handle(User $user): array
    {
        return [
            'version' => self::VERSION,
            'exported_at' => now()->toIso8601String(),
            'tags' => $this->tags($user),
            'stars' => $this->stars($user),
            'smart_filters' => $this->smartFilters($user),
        ];
    }

    /**
     * @return array<int, array{name: string, sort_order: int}>
     */
    private function tags(User $user): array
    {
        return $user->tags()
            ->orderBy('name')
            ->get()
            ->map(fn (Tag $tag): array => [
                'name' => $tag->name,
                'sort_order' => (int) $tag->sort_order,
            ])
            ->all();
    }

    /**
     * @return array<int, array{repo_id: int, notes: ?string, meta: ?array<string, mixed>, tags: array<int, string>}>
     */
    private function stars(User $user): array
    {
        return $user->stars()
            ->with('tags')
            ->orderBy('repo_id')
            ->get()
            ->map(fn (Star $star): array => [
                'repo_id' => (int) $star->repo_id,
                'notes' => $star->notes,
                'meta' => $star->meta,
                'tags' => $star->tags->pluck('name')->sort()->values()->all(),
            ])
            ->all();
    }

    /**
     * @return array<int, array{name: string, sort_order: int, body: array<string, mixed>}>
     */
    private function smartFilters(User $user): array
    {
        return $user->smartFilters()
            ->orderBy('name')
            ->get()
            ->map(fn (SmartFilter $filter): array => [
                'name' => $filter->name,
                'sort_order' => (int) $filter->sort_order,
                'body' => $this->exportBody($filter->body),
            ])
            ->all();
    }

    /**
     * Reduce tag predicates in a filter body to names only, dropping the origin's
     * instance-specific tag ids so the filter can be re-resolved on import.
     *
     * @param  array<string, mixed>|string|null  $body
     * @return array<string, mixed>
     */
    private function exportBody($body): array
    {
        $body = is_string($body) ? json_decode($body, true) : $body;

        if (! is_array($body)) {
            return [];
        }

        if (! isset($body['groups']) || ! is_array($body['groups'])) {
            return $body;
        }

        $body['groups'] = array_map(function (array $group): array {
            $group['predicates'] = array_map(function (array $predicate): array {
                if (($predicate['selectedTarget'] ?? null) === 'tags' && is_array($predicate['argument'] ?? null)) {
                    $predicate['argument'] = array_map(
                        fn (array $tag): array => ['name' => $tag['name'] ?? null],
                        $predicate['argument'],
                    );
                }

                return $predicate;
            }, $group['predicates'] ?? []);

            return $group;
        }, $body['groups']);

        return $body;
    }
}
