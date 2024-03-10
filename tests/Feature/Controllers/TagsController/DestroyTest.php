<?php

declare(strict_types=1);

use App\Models\Tag;

it('redirects guests to the login page')
    ->delete('/tags/1')
    ->assertRedirect('/login');

it('deletes a tag', function () {
    $this->login();

    $tag = Tag::factory()->create(['name' => 'TypeScript', 'user_id' => auth()->id()]);

    $this
        ->delete(route('tags.destroy', $tag))
        ->assertRedirect(route('dashboard.show'));

    $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
});

it('automatically scopes the bound tag in the request to the authenticated user', function () {
    $tag = Tag::factory()->create();

    $this->login();

    $this
        ->delete(route('tags.destroy', $tag))
        ->assertNotFound();

    $this->assertDatabaseHas('tags', ['id' => $tag->id]);
});
