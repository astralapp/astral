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
    expect($user->sponsorship_checked_at)->toBeNull();

    $user->setSponsorshipStatus(true);
    expect($user->fresh()->isSponsor())->toBeTrue();
    expect($user->fresh()->sponsorship_checked_at)->not->toBeNull();

    $user->setSponsorshipStatus(false);
    expect($user->fresh()->isSponsor())->toBeFalse();
});

it('treats the sponsoree account as a sponsor', function () {
    config(['app.check_for_sponsorship' => true, 'app.github_sponsoree_login' => 'octocat']);

    $owner = User::factory()->create(['username' => 'octocat']);
    $other = User::factory()->create(['username' => 'someone-else']);

    expect($owner->isSponsor())->toBeTrue();
    expect($other->isSponsor())->toBeFalse();
});
