<?php

it('logs out an authenticated user', function() {
    $this->login()
        ->get('/logout')
        ->assertRedirect(route('auth.show'));

    $this->assertGuest();
});

it('redirects guest users back to the login page')
    ->get('/logout')
    ->assertRedirect('/login');
