<?php

declare(strict_types=1);

use App\Models\Tag;
use App\Providers\RouteServiceProvider;

it('redirects guests to the login page')
    ->post('/tags')
    ->assertRedirect('/login');

it('creates a new tag', function () {
    $this->login();

    $this->assertDatabaseMissing('tags', ['name' => 'Laravel']);

    $this
        ->post(route('tags.store'), ['name' => 'Laravel'])
        ->assertRedirect(RouteServiceProvider::HOME)
        ->assertSessionHas('success', "The 'Laravel' tag was added");

    $this->assertDatabaseHas('tags', ['name' => 'Laravel']);
});

it('requires a valid name', function (array $badData, array|string $errors) {
    $this
        ->login()
        ->post(route('tags.store'), [...$badData])
        ->assertInvalid($errors);
})->with([
    [['name' => null], 'name'],
    [['name' => true], 'name'],
    [['name' => 12], 'name'],
    [[], 'name'],
]);

it('requires a unique name per user', function () {
    Tag::factory()->create(['name' => 'VueJS']);

    $this
        ->login()
        ->post(route('tags.store'), ['name' => 'VueJS'])
        ->assertValid()
        ->assertRedirect(RouteServiceProvider::HOME);

    expect(auth()->user()->tags()->count())->toBe(1);

    $this
        ->post(route('tags.store'), ['name' => 'VueJS'])
        ->assertInvalid(['name' => 'You already have a tag with that name.']);

    expect(auth()->user()->tags()->count())->toBe(1);
});

it('flashes an error if the user is not a sponsor and is at their tag limit', function () {
    $this->login();

    Tag::factory()->count(5)->create(['user_id' => auth()->id()]);

    $this
        ->post(route('tags.store'), ['name' => 'VueJS'])
        ->assertRedirect(RouteServiceProvider::HOME)
        ->assertSessionHasErrors(['sponsorship_required' => 'create_tag']);

    $this->assertDatabaseMissing('tags', ['user_id' => auth()->id(), 'name' => 'VueJS']);
});
