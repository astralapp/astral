<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Eloquent\MassAssignmentException;

it('refuses to mass-assign is_sponsor', function () {
    $user = User::factory()->create();

    expect(fn () => $user->update(['is_sponsor' => now()]))
        ->toThrow(MassAssignmentException::class);

    expect($user->fresh()->is_sponsor)->toBeNull();
});

it('sets sponsorship status through the dedicated setter', function () {
    config(['app.check_for_sponsorship' => true]);

    $user = User::factory()->create();
    expect($user->isSponsor())->toBeFalse();

    $user->setSponsorshipStatus(true);
    expect($user->fresh()->isSponsor())->toBeTrue();

    $user->setSponsorshipStatus(false);
    expect($user->fresh()->isSponsor())->toBeFalse();
});
