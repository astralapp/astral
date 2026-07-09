<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->post('/welcome/complete')
    ->assertRedirect('/auth');

it('clears the pending welcome flag and reports done', function () {
    $user = User::factory()->create();
    $user->markPendingWelcome();

    expect($user->hasPendingWelcome())->toBeTrue();

    $this->actingAs($user)
        ->post(route('welcome.complete'))
        ->assertOk()
        ->assertJson(['done' => true]);

    expect($user->fresh()->hasPendingWelcome())->toBeFalse();
});
