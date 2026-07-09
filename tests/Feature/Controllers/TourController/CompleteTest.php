<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->post('/tour/complete')
    ->assertRedirect('/auth');

it('marks the tour as completed and reports done', function () {
    $user = User::factory()->create();

    expect($user->hasCompletedTour())->toBeFalse();

    $this->actingAs($user)
        ->post(route('tour.complete'))
        ->assertOk()
        ->assertJson(['done' => true]);

    expect($user->fresh()->hasCompletedTour())->toBeTrue();
});

it('is idempotent when the tour is replayed', function () {
    $user = User::factory()->create();
    $user->markTourCompleted();

    $this->actingAs($user)
        ->post(route('tour.complete'))
        ->assertOk()
        ->assertJson(['done' => true]);

    expect($user->fresh()->hasCompletedTour())->toBeTrue();
});
