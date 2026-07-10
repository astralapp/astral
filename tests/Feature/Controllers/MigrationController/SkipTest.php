<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->post('/migrate/skip')
    ->assertRedirect('/auth');

it('marks the user migrated and routes them to welcome when they skip', function () {
    $user = User::factory()->create();
    // Legacy users have their welcome flag pre-set at sign-in; skipping must undo that.
    $user->markWelcomeCompleted();

    $this->actingAs($user)
        ->post(route('migrate.skip'))
        ->assertRedirect(route('welcome.index'));

    $user->refresh();

    expect($user->hasMigrated())->toBeTrue();
    expect($user->hasCompletedWelcome())->toBeFalse();
});

it('sends an already-migrated user to the dashboard without touching their welcome flag', function () {
    $user = User::factory()->create();
    $user->markAsMigrated();
    $user->markWelcomeCompleted();

    $this->actingAs($user)
        ->post(route('migrate.skip'))
        ->assertRedirect(route('dashboard.show'));

    expect($user->fresh()->hasCompletedWelcome())->toBeTrue();
});
