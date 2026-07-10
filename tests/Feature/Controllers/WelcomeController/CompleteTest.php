<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->post('/welcome/complete')
    ->assertRedirect('/auth');

it('marks the welcome complete and reports done', function () {
    $user = User::factory()->create();

    expect($user->hasCompletedWelcome())->toBeFalse();

    $this->actingAs($user)
        ->post(route('welcome.complete'))
        ->assertOk()
        ->assertJson(['done' => true]);

    expect($user->fresh()->hasCompletedWelcome())->toBeTrue();
});
