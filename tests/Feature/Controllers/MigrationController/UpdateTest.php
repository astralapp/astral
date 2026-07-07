<?php

declare(strict_types=1);

use App\Models\User;

it('redirects guests to the login page')
    ->put('/migrate', ['stars' => []])
    ->assertRedirect('/login');

it('marks the user migrated on the finalizing slice even with nothing to backfill', function () {
    $user = User::factory()->create();

    expect($user->hasMigrated())->toBeFalse();

    $this->actingAs($user)
        ->put(route('migrate.update'), ['stars' => [], 'finalize' => true])
        ->assertStatus(200)
        ->assertJson(['done' => true]);

    expect($user->fresh()->hasMigrated())->toBeTrue();
});

it('does not mark the user migrated on a non-final slice', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('migrate.update'), ['stars' => []])
        ->assertStatus(200)
        ->assertJson(['done' => false]);

    expect($user->fresh()->hasMigrated())->toBeFalse();
});

it('backfills metadata onto existing stars and marks the user migrated on finalize', function () {
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
            'finalize' => true,
        ])
        ->assertStatus(200)
        ->assertJson(['done' => true]);

    $star->refresh();

    expect($star->repo_id)->toBe(1234);
    expect($star->meta['nameWithOwner'])->toBe('astralapp/astral');
    expect($user->fresh()->hasMigrated())->toBeTrue();
});

it('backfills a star whose payload omits the description key', function () {
    $user = User::factory()->create();
    $star = $user->stars()->create(['repo_id' => 0]);

    // A repo with no GitHub description arrives without a `description` key at all.
    $this->actingAs($user)
        ->putJson(route('migrate.update'), [
            'stars' => [[
                'starId' => $star->id,
                'databaseId' => 1234,
                'nameWithOwner' => 'astralapp/astral',
                'url' => 'https://github.com/astralapp/astral',
            ]],
            'finalize' => true,
        ])
        ->assertStatus(200);

    expect($star->refresh()->meta['description'])->toBeNull();
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
            'finalize' => true,
        ])
        ->assertStatus(200);

    expect($star->refresh()->notes)->toBe('# Heading');
});
