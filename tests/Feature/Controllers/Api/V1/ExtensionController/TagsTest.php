<?php

declare(strict_types=1);

use App\Models\Tag;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('requires authentication', function () {
    $this->getJson(route('api.v1.tags.index'))->assertUnauthorized();
});

it("returns the authenticated user's tags as JSON", function () {
    $user = User::factory()->create();
    $tag = Tag::factory()->create(['user_id' => $user->id, 'name' => 'Laravel']);

    Sanctum::actingAs($user, ['*']);

    $this->getJson(route('api.v1.tags.index'))
        ->assertOk()
        ->assertJsonPath('tags.0.id', $tag->id)
        ->assertJsonPath('tags.0.name', 'Laravel')
        ->assertJsonPath('tags.0.user_id', $user->id)
        ->assertJsonPath('tags.0.stars_count', 0);
});

it("only returns the authenticated user's tags", function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Tag::factory()->create(['user_id' => $user->id, 'name' => 'Mine']);
    Tag::factory()->create(['user_id' => $other->id, 'name' => 'Theirs']);

    Sanctum::actingAs($user, ['*']);

    $this->getJson(route('api.v1.tags.index'))
        ->assertOk()
        ->assertJsonCount(1, 'tags')
        ->assertJsonPath('tags.0.name', 'Mine');
});
