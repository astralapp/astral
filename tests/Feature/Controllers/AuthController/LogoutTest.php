<?php

declare(strict_types=1);

it('logs out an authenticated user', function () {
    $this->login()
        ->get('/logout')
        ->assertRedirectToRoute('auth.show');

    $this->assertGuest();
});

it('redirects guest users back to the login page')
    ->get('/logout')
    ->assertRedirectToRoute('login.show');
