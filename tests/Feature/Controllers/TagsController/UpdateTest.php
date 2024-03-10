<?php

declare(strict_types=1);

use App\Models\Tag;
use App\Providers\RouteServiceProvider;

it('redirects guests to the login page')
    ->put('/tags/1', ['name' => 'TypeScript'])
    ->assertRedirect('/login');

it('updates a tag', function () {
    $this->login();

    $tag = Tag::factory()->create(['name' => 'SwypeScript', 'user_id' => auth()->id()]);

    $this
        ->put(route('tags.update', $tag), ['name' => 'TypeScript'])
        ->assertRedirect(route('dashboard.show'));

    $this->assertDatabaseHas('tags', ['id' => $tag->id, 'name' => 'TypeScript']);
});

it('requires a valid name', function (array $badData, array|string $errors) {
    $this->login();

    $tag = Tag::factory()->create(['user_id' => auth()->id()]);

    $this
        ->put(route('tags.update', $tag), [...$badData])
        ->assertInvalid($errors);
})->with([
    [['name' => null], 'name'],
    [['name' => true], 'name'],
    [['name' => 12], 'name'],
    [[], 'name'],
]);

it('requires a unique name per user', function () {
    // Create a tag called Laravel by someone else
    Tag::factory()->create(['name' => 'Laravel']);

    $this->login();

    $tag = Tag::factory()->create(['name' => 'Laaravell', 'user_id' => auth()->id()]);
    $tagB = Tag::factory()->create(['user_id' => auth()->id()]);

    $this
        ->put(route('tags.update', $tag), ['name' => 'Laravel'])
        ->assertValid()
        ->assertRedirect(RouteServiceProvider::HOME);

    $this
        ->put(route('tags.update', $tagB), ['name' => 'Laravel'])
        ->assertInvalid(['name' => 'You already have a tag with that name.']);
});
