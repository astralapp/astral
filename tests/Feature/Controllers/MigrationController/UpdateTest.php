<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->put('/migrate', ['stars' => []])
    ->assertRedirect('/login');

it('completes the migration when the user has no stars to backfill', function () {
    $user = User::factory()->create();

    expect($user->hasMigrated())->toBeFalse();

    $this->actingAs($user)
        ->put(route('migrate.update'), ['stars' => []])
        ->assertRedirect(route('dashboard.show'));

    expect($user->fresh()->hasMigrated())->toBeTrue();
});

it('backfills metadata onto existing stars and marks the user migrated', function () {
    $user = User::factory()->create();
    $star = $user->stars()->create(['repo_id' => 0]);

    $this->actingAs($user)
        ->put(route('migrate.update'), [
            'stars' => [[
                'starId' => $star->id,
                'databaseId' => 1234,
                'nameWithOwner' => 'astralapp/astral',
                'url' => 'https://github.com/astralapp/astral',
                'description' => 'Organize your GitHub stars',
            ]],
        ])
        ->assertRedirect(route('dashboard.show'));

    $star->refresh();

    expect($star->repo_id)->toBe(1234);
    expect($star->meta['nameWithOwner'])->toBe('astralapp/astral');
    expect($user->fresh()->hasMigrated())->toBeTrue();
});

it('leaves imported notes untouched (no HTML conversion)', function () {
    $user = User::factory()->create();
    $star = $user->stars()->create(['repo_id' => 1234, 'notes' => '# Heading']);

    $this->actingAs($user)
        ->put(route('migrate.update'), [
            'stars' => [[
                'starId' => $star->id,
                'databaseId' => 1234,
                'nameWithOwner' => 'astralapp/astral',
                'url' => 'https://github.com/astralapp/astral',
                'description' => null,
            ]],
        ])
        ->assertRedirect(route('dashboard.show'));

    expect($star->refresh()->notes)->toBe('# Heading');
});
