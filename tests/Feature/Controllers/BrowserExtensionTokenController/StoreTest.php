<?php

declare(strict_types=1);

use App\Data\UserData;
use App\Models\User;

it('redirects guests to the login page')
    ->post('/browser-extension-token')
    ->assertRedirect('/auth');

it('generates a token and returns the plaintext value once', function () {
    $this->login();

    $token = $this->postJson(route('browser-extension-token.store'))
        ->assertOk()
        ->assertJsonStructure(['token'])
        ->json('token');

    expect($token)->toBeString()->not->toBeEmpty();

    $this->assertDatabaseCount('personal_access_tokens', 1);
    expect(auth()->user()->tokens()->where('name', User::BROWSER_EXTENSION_TOKEN)->exists())->toBeTrue();
});

it('replaces the existing token when regenerated', function () {
    $this->login();

    $first = $this->postJson(route('browser-extension-token.store'))->json('token');
    $second = $this->postJson(route('browser-extension-token.store'))->json('token');

    expect($second)->not->toBe($first);
    $this->assertDatabaseCount('personal_access_tokens', 1);
});

it('flips the has_browser_extension_token flag on the user payload', function () {
    $this->login();

    expect(UserData::fromModel(auth()->user())->has_browser_extension_token)->toBeFalse();

    $this->postJson(route('browser-extension-token.store'))->assertOk();

    expect(UserData::fromModel(auth()->user()->fresh())->has_browser_extension_token)->toBeTrue();
});
