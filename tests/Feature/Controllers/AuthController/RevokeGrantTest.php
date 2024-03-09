<?php

declare(strict_types=1);

use App\Exceptions\InvalidAccessTokenException;
use Illuminate\Support\Facades\Http;

it('sends an API reqest to GitHub to revoke the user\'s access token', function () {
    Http::fake([
        'api.github.com/*' => Http::response('ok', 200),
    ]);

    $this
        ->login()
        ->post('/revoke-grant')->assertRedirectToRoute('auth.destroy');

    expect(auth()->user()->access_token)->toBeNull();
});

it('throws an InvalidAccessTokenException if the api request comes back with a 404', function () {
    $this->withoutExceptionHandling();

    Http::fake([
        'api.github.com/*' => Http::response('not-found', 404),
    ]);

    $this
        ->login()
        ->post('/revoke-grant');

    expect(auth()->user()->access_token)->not->toBeNull();
})->throws(InvalidAccessTokenException::class);

it('redirects guest users back to the login page')
    ->post('/revoke-grant')
    ->assertRedirectToRoute('login.show');
