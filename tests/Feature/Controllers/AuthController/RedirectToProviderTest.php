<?php

declare(strict_types=1);

it('validates the scope if present', function (array $badData, array|string $errors) {
    $this
        ->get(route('github.auth', $badData))
        ->assertInvalid($errors);
})->with([
    [['scope' => 'admin:org'], 'scope'],
    [['scope' => 'repo'], 'scope'],
    [['scope' => 'user'], 'scope'],
]);

it('requests the given scope from the auth provider', function () {
    $this
        ->get(route('github.auth', ['scope' => 'public_repo']))
        ->assertRedirectContains('scope=public_repo');
});

it('defaults to the `read:user` scope if no scope is provided', function () {
    $this
        ->get(route('github.auth', ['scope' => null]))
        ->assertRedirectContains('scope=' . urlencode('read:user'));
});

it('redirects to the auth provider when a valid scope is present', function (?string $scope) {
    $this->get(route('github.auth', ['scope' => $scope]))->assertRedirect();
})->with(['read:user', 'public_repo', null]);

it('lets an already-authenticated user re-authorize to elevate their scope', function () {
    $this->login();

    $this
        ->get(route('github.auth', ['scope' => 'public_repo']))
        ->assertRedirectContains('scope=public_repo');
});
