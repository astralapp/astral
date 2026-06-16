<?php

declare(strict_types=1);

use App\Models\User;

it('defaults show_topics to false for new users', function () {
    $user = User::factory()->create();

    expect($user->readSetting('show_topics'))->toBeFalse();
});

it('toggles the show_topics setting', function () {
    $this->login();

    $this
        ->put(route('settings.update'), ['key' => 'show_topics', 'enabled' => true])
        ->assertRedirect(route('dashboard.show'));

    expect(auth()->user()->fresh()->readSetting('show_topics'))->toBeTrue();
});

it('rejects settings keys that are not allowed', function () {
    $this
        ->login()
        ->put(route('settings.update'), ['key' => 'not_a_real_setting', 'enabled' => true])
        ->assertInvalid('key');
});
