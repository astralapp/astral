<?php

declare(strict_types=1);

use App\Lib\Sponsorship;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Cache;

// Reset the rate limiter between tests; RefreshDatabase reuses user ids, so the
// per-user throttle bucket would otherwise leak across cases.
beforeEach(fn () => Cache::flush());

it('redirects guests to the login page')
    ->post('/sponsorship/recheck')
    ->assertRedirect('/auth');

it('degrades a failed recheck to an error flash instead of a 500', function () {
    config(['app.check_for_sponsorship' => true]);

    $this->mock(Sponsorship::class)
        ->shouldReceive('updateUserSponsorshipStatus')
        ->once()
        ->andThrow(new RuntimeException('GitHub is unreachable'));

    $this->login();

    $this
        ->post(route('sponsor.check'))
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('rechecks and redirects to the dashboard on success', function () {
    config(['app.check_for_sponsorship' => true]);

    $this->mock(Sponsorship::class)
        ->shouldReceive('updateUserSponsorshipStatus')
        ->once();

    $this->login();

    $this
        ->post(route('sponsor.check'))
        ->assertRedirect(RouteServiceProvider::HOME)
        ->assertSessionMissing('error');
});

it('throttles repeated rechecks', function () {
    config(['app.check_for_sponsorship' => false]);

    $this->login();

    foreach (range(1, 6) as $ignored) {
        $this->post(route('sponsor.check'))->assertRedirect();
    }

    $this->post(route('sponsor.check'))->assertStatus(429);
});
