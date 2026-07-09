<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\DB;

it('redirects guests to the login page')
    ->post('/migrate')
    ->assertRedirect('/auth');

it('imports a legacy chunk and reports progress without marking migrated', function () {
    bootLegacyDatabase();

    $user = User::factory()->create(['github_id' => 2468]);
    $legacyId = seedLegacyUser(2468);

    $tag = DB::connection('legacy')->table('tags')->insertGetId(['user_id' => $legacyId, 'name' => 'Dev Tools', 'sort_order' => 1]);
    $star = DB::connection('legacy')->table('stars')->insertGetId(['user_id' => $legacyId, 'repo_id' => 99, 'notes' => 'handy']);
    DB::connection('legacy')->table('star_tag')->insert(['star_id' => $star, 'tag_id' => $tag]);

    $this->actingAs($user)
        ->post(route('migrate.import'))
        ->assertStatus(200)
        ->assertJson(['done' => true, 'total' => 1, 'processed' => 1]);

    expect($user->tags()->count())->toBe(1);
    expect($user->stars()->count())->toBe(1);
    // The import alone does not complete migration; the meta backfill (PUT) does.
    expect($user->fresh()->hasMigrated())->toBeFalse();
});
