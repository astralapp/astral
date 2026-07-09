<?php

declare(strict_types=1);

use App\Lib\ExportUserData;
use App\Lib\ImportUserData;
use App\Models\User;

function tagsPredicateBody(array $tags): array
{
    return ['groups' => [[
        'logicalType' => 'any',
        'predicates' => [[
            'selectedTarget' => 'tags',
            'operator' => 'hasAnyTags',
            'argument' => $tags,
        ]],
    ]]];
}

it('exports the expected envelope and star shape', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $tag = $user->tags()->create(['name' => 'cli']);
    $star = $user->stars()->create([
        'repo_id' => 111,
        'notes' => 'a note',
        'meta' => ['nameWithOwner' => 'a/b', 'url' => 'https://github.com/a/b', 'description' => 'd'],
    ]);
    $star->tags()->sync([$tag->id]);

    $export = app(ExportUserData::class)->handle($user);

    expect($export['version'])->toBe(1);
    expect($export)->toHaveKeys(['version', 'exported_at', 'tags', 'stars', 'smart_filters']);
    expect($export['tags'])->toBe([['name' => 'cli', 'sort_order' => 1]]);
    // toEqual, not toBe: meta is a JSON blob whose key order the storage layer
    // doesn't preserve, and consumers read it by key.
    expect($export['stars'][0])->toEqual([
        'repo_id' => 111,
        'notes' => 'a note',
        'meta' => ['nameWithOwner' => 'a/b', 'url' => 'https://github.com/a/b', 'description' => 'd'],
        'tags' => ['cli'],
    ]);
});

it('exports filter tag references as names only', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $rust = $user->tags()->create(['name' => 'rust']);
    $user->smartFilters()->create([
        'name' => 'Rust repos',
        'body' => tagsPredicateBody([
            ['id' => $rust->id, 'name' => 'rust', 'user_id' => $user->id, 'sort_order' => 1],
        ]),
    ]);

    $export = app(ExportUserData::class)->handle($user);
    $argument = $export['smart_filters'][0]['body']['groups'][0]['predicates'][0]['argument'];

    expect($argument)->toBe([['name' => 'rust']]);
});

it('round-trips a full export into an identical account on another instance', function () {
    $source = User::factory()->create();
    test()->actingAs($source);

    $rust = $source->tags()->create(['name' => 'rust']);
    $cli = $source->tags()->create(['name' => 'cli']);

    $star = $source->stars()->create([
        'repo_id' => 111,
        'notes' => 'great tool',
        'meta' => ['nameWithOwner' => 'owner/repo', 'url' => 'https://github.com/owner/repo', 'description' => 'x'],
    ]);
    $star->tags()->sync([$rust->id, $cli->id]);

    $source->smartFilters()->create([
        'name' => 'Rust repos',
        'body' => tagsPredicateBody([
            ['id' => $rust->id, 'name' => 'rust', 'user_id' => $source->id, 'sort_order' => 1],
        ]),
    ]);

    $export = app(ExportUserData::class)->handle($source);

    $target = User::factory()->create();
    test()->actingAs($target);
    app(ImportUserData::class)->handle($target, $export);

    expect($target->tags()->pluck('name')->all())->toEqualCanonicalizing(['rust', 'cli']);

    $imported = $target->stars()->where('repo_id', 111)->first();
    expect($imported->notes)->toBe('great tool');
    // toEqual: meta key order is not preserved by storage (see export test).
    expect($imported->meta)->toEqual(['nameWithOwner' => 'owner/repo', 'url' => 'https://github.com/owner/repo', 'description' => 'x']);
    expect($imported->tags()->pluck('name')->all())->toEqualCanonicalizing(['rust', 'cli']);

    $filter = $target->smartFilters()->where('name', 'Rust repos')->first();
    $argument = $filter->body['groups'][0]['predicates'][0]['argument'];
    $targetRust = $target->tags()->where('name', 'rust')->first();

    // Tag predicate is re-resolved to the TARGET user's tag, not the source's ids.
    expect($argument[0]['name'])->toBe('rust');
    expect($argument[0]['id'])->toBe($targetRust->id);
    expect($argument[0]['user_id'])->toBe($target->id);
});

it('is idempotent when the same file is imported twice', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $data = [
        'version' => 1,
        'tags' => [['name' => 'rust', 'sort_order' => 1]],
        'stars' => [['repo_id' => 111, 'notes' => 'note', 'meta' => [], 'tags' => ['rust']]],
        'smart_filters' => [['name' => 'Filter', 'sort_order' => 1, 'body' => ['groups' => []]]],
    ];

    app(ImportUserData::class)->handle($user, $data);
    app(ImportUserData::class)->handle($user, $data);

    expect($user->tags()->count())->toBe(1);
    expect($user->stars()->count())->toBe(1);
    expect($user->smartFilters()->count())->toBe(1);
    expect($user->stars()->first()->tags()->count())->toBe(1);
});

it('overwrites notes and replaces the tag set on matching stars (file wins)', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $old = $user->tags()->create(['name' => 'old']);
    $star = $user->stars()->create(['repo_id' => 111, 'notes' => 'original']);
    $star->tags()->sync([$old->id]);

    app(ImportUserData::class)->handle($user, [
        'version' => 1,
        'tags' => [['name' => 'new']],
        'stars' => [['repo_id' => 111, 'notes' => 'replaced', 'tags' => ['new']]],
    ]);

    $star->refresh();
    expect($star->notes)->toBe('replaced');
    expect($star->tags()->pluck('name')->all())->toBe(['new']);
});

it('imports star rows even when the repo is not currently starred on GitHub', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    app(ImportUserData::class)->handle($user, [
        'version' => 1,
        'stars' => [['repo_id' => 999999, 'notes' => 'dormant', 'tags' => []]],
    ]);

    expect($user->stars()->where('repo_id', 999999)->exists())->toBeTrue();
});

it('keeps unresolvable filter tag references as name-only', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    app(ImportUserData::class)->handle($user, [
        'version' => 1,
        'tags' => [],
        'smart_filters' => [[
            'name' => 'Ghost',
            'sort_order' => 1,
            'body' => tagsPredicateBody([['name' => 'missing']]),
        ]],
    ]);

    $filter = $user->smartFilters()->where('name', 'Ghost')->first();
    $argument = $filter->body['groups'][0]['predicates'][0]['argument'];

    expect($argument[0])->toBe(['name' => 'missing']);
});
