<?php

declare(strict_types=1);

use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;

it('creates a new user if the user doesn\'t exist and logs them in', function () {
    mockSocialiteFacade();

    $this->assertDatabaseMissing(User::class, [
        'github_id' => 1234567890,
    ]);

    $this->get('/auth/github/callback')->assertRedirect(RouteServiceProvider::HOME);

    $this->assertAuthenticated();

    $this->assertDatabaseHas(User::class, [
        'github_id' => 1234567890,
        'username' => 'JaneDoe',
        'name' => 'Jane Doe',
        'avatar' => 'https://en.gravatar.com/userimage',
        'scope' => 'read:user',
    ]);
});

it('stores the `public_repo` scope when GitHub grants it', function () {
    mockSocialiteFacade(['read:user', 'public_repo']);

    $this->get('/auth/github/callback')->assertRedirect(RouteServiceProvider::HOME);

    $this->assertDatabaseHas(User::class, [
        'github_id' => 1234567890,
        'scope' => 'public_repo',
    ]);
});

it('stores the scope GitHub granted even when no requested scope is in the session', function () {
    // Regression: the callback used to trust the session's requested scope, which silently
    // defaulted to `read:user` when missing and re-triggered the upgrade prompt forever.
    mockSocialiteFacade(['read:user', 'public_repo']);

    $this->get('/auth/github/callback');

    $this->assertDatabaseHas(User::class, [
        'github_id' => 1234567890,
        'scope' => 'public_repo',
    ]);
});

it('does not downgrade an elevated user re-signing in with the default scope', function () {
    User::factory()->create(['github_id' => 1234567890, 'scope' => 'public_repo']);

    // GitHub grants are cumulative, so a plain sign-in still returns the previously granted scope.
    mockSocialiteFacade(['read:user', 'public_repo']);

    $this->get('/auth/github/callback');

    $this->assertDatabaseHas(User::class, [
        'github_id' => 1234567890,
        'scope' => 'public_repo',
    ]);
});

it('updates the user\'s info and logins them in if they already exist', function () {
    mockSocialiteFacade();

    $user = User::factory()->create([
        'github_id' => 1234567890,
        'username' => 'OldUsername',
        'name' => 'Old Name',
        'avatar' => 'https://old.gravatar.com/userimage',
        'scope' => 'read:user',
    ]);

    $this->get('/auth/github/callback')->assertRedirect(RouteServiceProvider::HOME);

    $this->assertAuthenticated();

    $this->assertDatabaseHas(User::class, [
        'github_id' => 1234567890,
        'username' => 'JaneDoe',
        'name' => 'Jane Doe',
        'avatar' => 'https://en.gravatar.com/userimage',
        'scope' => 'read:user',
    ]);

    expect(User::count())->toBe(1);
});

it('refreshes a returning user\'s access token even when the scope is unchanged', function () {
    mockSocialiteFacade();

    $user = User::factory()->create([
        'github_id' => 1234567890,
        'scope' => 'read:user',
        'access_token' => 'stale-revoked-token',
    ]);

    $this->get('/auth/github/callback')->assertRedirect(RouteServiceProvider::HOME);

    expect($user->fresh()->access_token)->toBe('abcde12345');
});

it('lets an already-authenticated user elevate their scope on re-authorization', function () {
    $user = User::factory()->create(['github_id' => 1234567890, 'scope' => 'read:user']);
    $this->actingAs($user);

    mockSocialiteFacade(['read:user', 'public_repo']);

    $this->get('/auth/github/callback')->assertRedirect(RouteServiceProvider::HOME);

    expect($user->fresh()->scope)->toBe('public_repo');
});

it('gates a brand-new non-legacy user behind the welcome screen', function () {
    mockSocialiteFacade();

    $this->get('/auth/github/callback');

    $user = User::firstWhere('github_id', 1234567890);

    expect($user->hasMigrated())->toBeTrue();
    expect($user->hasCompletedWelcome())->toBeFalse();
});

it('does not gate a legacy user behind the welcome screen', function () {
    bootLegacyDatabase();

    $legacyId = seedLegacyUser(1234567890);
    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 1, 'notes' => 'note']);

    mockSocialiteFacade();

    $this->get('/auth/github/callback');

    $user = User::firstWhere('github_id', 1234567890);

    expect($user->hasMigrated())->toBeFalse();
    expect($user->hasCompletedWelcome())->toBeTrue();
});

// Helpers
function mockSocialiteFacade(array $approvedScopes = ['read:user'])
{
    $abstractUser = Mockery::mock(Laravel\Socialite\Two\User::class);
    $abstractUser->shouldReceive('getId')
        ->andReturn(1234567890)
        ->shouldReceive('getNickname')
        ->andReturn('JaneDoe')
        ->shouldReceive('getName')
        ->andReturn('Jane Doe')
        ->shouldReceive('getAvatar')
        ->andReturn('https://en.gravatar.com/userimage');
    $abstractUser->token = 'abcde12345';
    $abstractUser->approvedScopes = $approvedScopes;

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('github')->andReturn($provider);
}
