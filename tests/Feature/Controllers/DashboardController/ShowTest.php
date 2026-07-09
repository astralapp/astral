<?php

declare(strict_types=1);

it('redirects guests to the sign-in page instead of silently re-authenticating')
    ->get('/')
    ->assertRedirectToRoute('auth.show');
