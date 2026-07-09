<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->get('/welcome')
    ->assertRedirect('/login');

it('redirects a user with no pending welcome to the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('welcome.index'))
        ->assertRedirect(route('dashboard.show'));
});

it('shows the welcome screen to a user with a pending welcome', function () {
    $user = User::factory()->create();
    $user->markPendingWelcome();

    $this->actingAs($user)
        ->get(route('welcome.index'))
        ->assertStatus(200)
        ->assertHybridView('views.welcome');
});

it('redirects a pending user off the dashboard to the welcome screen', function () {
    $user = User::factory()->create();
    $user->markAsMigrated();
    $user->markPendingWelcome();

    $this->actingAs($user)
        ->get(route('dashboard.show'))
        ->assertRedirect(route('welcome.index'));
});
