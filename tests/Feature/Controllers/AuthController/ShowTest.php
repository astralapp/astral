<?php

declare(strict_types=1);

use App\Providers\RouteServiceProvider;

it('renders the login page for unauthenticated users')
    ->get('/auth')
    ->assertStatus(200)
    ->assertHybridView('auth');

it('redirects authenticated users back to the dashboard')
    ->login()
    ->get('/auth')
    ->assertRedirect(RouteServiceProvider::HOME);
