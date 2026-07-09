<?php

declare(strict_types=1);

use App\Lib\ImportLegacyData;
use App\Models\User;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    bootLegacyDatabase();
});

function importLegacyFor(User $user): void
{
    test()->actingAs($user);
    app(ImportLegacyData::class)->handle($user);
}

it('imports stars across multiple cursor-bounded chunks', function () {
    $user = User::factory()->create(['github_id' => 321]);
    $legacyId = seedLegacyUser(321);

    $tag = DB::connection('legacy')->table('tags')->insertGetId(['user_id' => $legacyId, 'name' => 'Keep', 'sort_order' => 1]);

    foreach ([11, 22, 33] as $repoId) {
        $star = DB::connection('legacy')->table('stars')->insertGetId(['user_id' => $legacyId, 'repo_id' => $repoId, 'notes' => "note {$repoId}"]);
        DB::connection('legacy')->table('star_tag')->insert(['star_id' => $star, 'tag_id' => $tag]);
    }

    $importer = app(ImportLegacyData::class);

    $first = $importer->importChunk($user, null, 2);
    expect($first)->toMatchArray(['done' => false, 'processed' => 2, 'total' => 3]);
    expect($user->stars()->count())->toBe(2);

    $second = $importer->importChunk($user, $first['cursor'], 2);
    expect($second)->toMatchArray(['done' => true, 'processed' => 1]);

    expect($user->stars()->pluck('repo_id')->all())->toEqualCanonicalizing([11, 22, 33]);
    // The tag map is rebuilt each chunk, so links resolve even on later chunks.
    expect($user->stars()->where('repo_id', 33)->first()->tags()->pluck('name')->all())->toBe(['Keep']);
});

it('imports tags, smart filters, stars, notes, and rebuilds the tag links', function () {
    $user = User::factory()->create(['github_id' => 555]);
    $legacyId = seedLegacyUser(555);

    $vue = DB::connection('legacy')->table('tags')->insertGetId(['user_id' => $legacyId, 'name' => 'Vue', 'sort_order' => 1]);
    $laravel = DB::connection('legacy')->table('tags')->insertGetId(['user_id' => $legacyId, 'name' => 'Laravel', 'sort_order' => 2]);

    $body = '{"groups":[{"logicalType":"any","predicates":[{"selectedTarget":"node.nameWithOwner","operator":"contains","argument":"laravel"}]}]}';
    DB::connection('legacy')->table('predicates')->insert(['user_id' => $legacyId, 'name' => 'Laravel repos', 'body' => $body, 'sort_order' => 1]);

    $taggedStar = DB::connection('legacy')->table('stars')->insertGetId(['user_id' => $legacyId, 'repo_id' => 111, 'notes' => '# Hello']);
    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 222, 'notes' => 'just notes']);

    DB::connection('legacy')->table('star_tag')->insert(['star_id' => $taggedStar, 'tag_id' => $vue]);
    DB::connection('legacy')->table('star_tag')->insert(['star_id' => $taggedStar, 'tag_id' => $laravel]);

    importLegacyFor($user);

    expect($user->tags()->pluck('name')->all())->toEqualCanonicalizing(['Vue', 'Laravel']);

    expect($user->smartFilters()->count())->toBe(1);
    // Body is copied verbatim and round-trips back to the same JSON string.
    expect($user->smartFilters()->first()->body)->toBe($body);

    expect($user->stars()->pluck('repo_id')->all())->toEqualCanonicalizing([111, 222]);

    $imported = $user->stars()->where('repo_id', 111)->first();
    // Notes are imported as-is (markdown source), not HTML-converted.
    expect($imported->notes)->toBe('# Hello');
    expect($imported->tags()->pluck('name')->all())->toEqualCanonicalizing(['Vue', 'Laravel']);
});

it('skips bare legacy stars with no notes and no tags', function () {
    $user = User::factory()->create(['github_id' => 7]);
    $legacyId = seedLegacyUser(7);

    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 111, 'notes' => 'keep me']);
    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 222, 'notes' => null]);
    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 333, 'notes' => '   ']);

    importLegacyFor($user);

    expect($user->stars()->pluck('repo_id')->all())->toBe([111]);
});

it('bypasses the tag cap for non-sponsors', function () {
    config()->set('app.check_for_sponsorship', true);

    $user = User::factory()->create(['github_id' => 9]);
    $legacyId = seedLegacyUser(9);

    expect($user->isSponsor())->toBeFalse();

    foreach (range(1, 8) as $n) {
        DB::connection('legacy')->table('tags')->insert(['user_id' => $legacyId, 'name' => "tag-{$n}", 'sort_order' => $n]);
    }

    importLegacyFor($user);

    // max_tags is 5; the import grandfathers all 8.
    expect($user->tags()->count())->toBe(8);
});

it('is idempotent when re-run', function () {
    $user = User::factory()->create(['github_id' => 42]);
    $legacyId = seedLegacyUser(42);

    $tag = DB::connection('legacy')->table('tags')->insertGetId(['user_id' => $legacyId, 'name' => 'Tooling', 'sort_order' => 1]);
    $star = DB::connection('legacy')->table('stars')->insertGetId(['user_id' => $legacyId, 'repo_id' => 111, 'notes' => 'note']);
    DB::connection('legacy')->table('star_tag')->insert(['star_id' => $star, 'tag_id' => $tag]);
    DB::connection('legacy')->table('predicates')->insert(['user_id' => $legacyId, 'name' => 'Filter', 'body' => '{"groups":[]}', 'sort_order' => 1]);

    importLegacyFor($user);
    importLegacyFor($user);

    expect($user->tags()->count())->toBe(1);
    expect($user->smartFilters()->count())->toBe(1);
    expect($user->stars()->count())->toBe(1);
    expect($user->stars()->first()->tags()->count())->toBe(1);
});

it('does nothing when the user has no legacy account', function () {
    $user = User::factory()->create(['github_id' => 1000]);

    importLegacyFor($user);

    expect($user->tags()->count())->toBe(0);
    expect($user->stars()->count())->toBe(0);
});
