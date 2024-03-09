<?php

declare(strict_types=1);

use App\Providers\RouteServiceProvider;

it('validates the scope if present', function (array $badData, array|string $errors) {
    $this
        ->get(route('github.auth', $badData))
        ->assertInvalid($errors);
})->with([
    [['scope' => 'admin:org'], 'scope'],
    [['scope' => 'repo'], 'scope'],
    [['scope' => 'user'], 'scope'],
]);

it('stores a valid scope in the current session', function (string $scope) {
    $this
        ->get(route('github.auth', ['scope' => $scope]))
        ->assertSessionHas('auth_scope', $scope);
})->with(['read:user', 'public_repo']);

it('defaults to the `read:user` scope if no scope is provided', function () {
    $this
        ->get(route('github.auth', ['scope' => null]))
        ->assertSessionHas('auth_scope', 'read:user');
});

it('redirects to the auth provider when a valid scope is present', function (?string $scope) {
    // TODO: Can we perform some assertions on what we passed to Socialite?
    $this->get(route('github.auth', ['scope' => $scope]))->assertRedirect();
})->with(['read:user', 'public_repo', null]);

it('redirects authenticated users back to the dashboard')
    ->login()
    ->get('/auth/github')
    ->assertRedirect(RouteServiceProvider::HOME);
