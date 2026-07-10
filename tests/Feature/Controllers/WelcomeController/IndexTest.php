<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->get('/welcome')
    ->assertRedirect('/auth');

it('redirects a user who has completed welcome to the dashboard', function () {
    $user = User::factory()->create();
    $user->markWelcomeCompleted();

    $this->actingAs($user)
        ->get(route('welcome.index'))
        ->assertRedirect(route('dashboard.show'));
});

it('shows the welcome screen to a user who has not completed it', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('welcome.index'))
        ->assertStatus(200)
        ->assertHybridView('views.welcome');
});

it('redirects a user who has not completed welcome off the dashboard to the welcome screen', function () {
    $user = User::factory()->create();
    $user->markAsMigrated();

    $this->actingAs($user)
        ->get(route('dashboard.show'))
        ->assertRedirect(route('welcome.index'));
});
