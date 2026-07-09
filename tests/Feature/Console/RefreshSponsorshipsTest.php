<?php

declare(strict_types=1);

use App\Lib\Sponsorship;
use App\Models\User;

it('does nothing when sponsorship checking is disabled', function () {
    config(['app.check_for_sponsorship' => false]);

    $this->mock(Sponsorship::class)->shouldNotReceive('updateUserSponsorshipStatus');

    $sponsor = User::factory()->create();
    $sponsor->setSponsorshipStatus(true);

    $this->artisan('sponsorships:refresh')->assertSuccessful();
});

it('re-verifies only current sponsors that still have a token', function () {
    config(['app.check_for_sponsorship' => true]);

    $sponsor = User::factory()->create();
    $sponsor->setSponsorshipStatus(true);

    // Not a sponsor → nothing to revoke.
    User::factory()->create();

    // A sponsor with no token can't be verified, so it's left alone.
    $tokenless = User::factory()->create(['access_token' => null]);
    $tokenless->setSponsorshipStatus(true);

    $this->mock(Sponsorship::class)
        ->shouldReceive('updateUserSponsorshipStatus')
        ->once()
        ->withArgs(fn (User $user) => $user->is($sponsor));

    $this->artisan('sponsorships:refresh')->assertSuccessful();
});

it('keeps refreshing the rest when one sponsor fails to verify', function () {
    config(['app.check_for_sponsorship' => true]);

    User::factory()->count(2)->create()->each->setSponsorshipStatus(true);

    $this->mock(Sponsorship::class)
        ->shouldReceive('updateUserSponsorshipStatus')
        ->twice()
        ->andThrow(new RuntimeException('GitHub is unreachable'));

    $this->artisan('sponsorships:refresh')->assertSuccessful();
});
