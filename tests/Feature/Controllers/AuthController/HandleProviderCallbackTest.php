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

    session()->put('auth_scope', 'read:user');

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

it('updates the user\'s info and logins them in if they already exist', function () {
    mockSocialiteFacade();

    $user = User::factory()->create([
        'github_id' => 1234567890,
        'username' => 'OldUsername',
        'name' => 'Old Name',
        'avatar' => 'https://old.gravatar.com/userimage',
        'scope' => 'read:user',
    ]);

    session()->put('auth_scope', 'read:user');

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

    session()->put('auth_scope', 'read:user');

    $this->get('/auth/github/callback')->assertRedirect(RouteServiceProvider::HOME);

    expect($user->fresh()->access_token)->toBe('abcde12345');
});

it('redirects authenticated users back to the dashboard')
    ->login()
    ->get('/auth/github/callback')
    ->assertRedirect(RouteServiceProvider::HOME);

it('gates a brand-new non-legacy user behind the welcome screen', function () {
    mockSocialiteFacade();

    session()->put('auth_scope', 'read:user');

    $this->get('/auth/github/callback');

    $user = User::firstWhere('github_id', 1234567890);

    expect($user->hasMigrated())->toBeTrue();
    expect($user->hasPendingWelcome())->toBeTrue();
});

it('does not gate a legacy user behind the welcome screen', function () {
    bootLegacyDatabase();

    $legacyId = seedLegacyUser(1234567890);
    DB::connection('legacy')->table('stars')->insert(['user_id' => $legacyId, 'repo_id' => 1, 'notes' => 'note']);

    mockSocialiteFacade();

    session()->put('auth_scope', 'read:user');

    $this->get('/auth/github/callback');

    $user = User::firstWhere('github_id', 1234567890);

    expect($user->hasMigrated())->toBeFalse();
    expect($user->hasPendingWelcome())->toBeFalse();
});

// Helpers
function mockSocialiteFacade()
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

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('github')->andReturn($provider);
}
