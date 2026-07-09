<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\DB;

it('redirects guests to the login page')
    ->get('/migrate')
    ->assertRedirect('/auth');

it('marks a user with no legacy data as migrated and skips the migrate step', function () {
    // Migration check is disabled by default in tests, so there is nothing to migrate.
    $user = User::factory()->create();

    expect($user->hasMigrated())->toBeFalse();

    $this->actingAs($user)
        ->get(route('migrate.index'))
        ->assertRedirect(route('dashboard.show'));

    expect($user->fresh()->hasMigrated())->toBeTrue();
});

it('shows the migrate step to a legacy user with data', function () {
    bootLegacyDatabase();

    $user = User::factory()->create(['github_id' => 1234]);
    $legacyId = seedLegacyUser(1234);
    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 1, 'notes' => 'note']);

    $this->actingAs($user)
        ->get(route('migrate.index'))
        ->assertStatus(200)
        ->assertHybridView('views.migrate');

    expect($user->fresh()->hasMigrated())->toBeFalse();
});

it('marks a legacy user with no data as migrated and skips the migrate step', function () {
    bootLegacyDatabase();

    $user = User::factory()->create(['github_id' => 4321]);
    seedLegacyUser(4321); // account exists, but no stars/tags/filters

    $this->actingAs($user)
        ->get(route('migrate.index'))
        ->assertRedirect(route('dashboard.show'));

    expect($user->fresh()->hasMigrated())->toBeTrue();
});

it('redirects an already-migrated user to the dashboard', function () {
    $user = User::factory()->create();
    $user->markAsMigrated();

    $this->actingAs($user)
        ->get(route('migrate.index'))
        ->assertRedirect(route('dashboard.show'));
});
