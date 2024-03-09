<?php

declare(strict_types=1);

use App\Models\User;
use App\Providers\RouteServiceProvider;
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

it('redirects authenticated users back to the dashboard')
    ->login()
    ->get('/auth/github/callback')
    ->assertRedirect(RouteServiceProvider::HOME);

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

    $provider = Mockery::mock(Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('github')->andReturn($provider);
}
