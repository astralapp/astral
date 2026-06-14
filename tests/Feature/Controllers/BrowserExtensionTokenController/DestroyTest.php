<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Http;

it('redirects guests to the login page')
    ->delete('/browser-extension-token')
    ->assertRedirect('/login');

it('revokes the browser-extension token', function () {
    $this->login();
    auth()->user()->createToken(User::BROWSER_EXTENSION_TOKEN);

    $this->assertDatabaseCount('personal_access_tokens', 1);

    $this->deleteJson(route('browser-extension-token.destroy'))->assertNoContent();

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('removes the token when the user is deleted', function () {
    Http::fake(['api.github.com/*' => Http::response('ok', 200)]);

    $this->login();
    $user = auth()->user();
    $user->createToken(User::BROWSER_EXTENSION_TOKEN);

    $this->assertDatabaseCount('personal_access_tokens', 1);

    $user->delete();

    $this->assertDatabaseCount('personal_access_tokens', 0);
});
