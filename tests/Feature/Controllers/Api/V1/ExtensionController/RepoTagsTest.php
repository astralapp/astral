<?php

declare(strict_types=1);

use App\Models\Star;
use App\Models\Tag;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('requires authentication', function () {
    $this->getJson(route('api.v1.repos.tags', ['databaseId' => 1234]))->assertUnauthorized();
});

it('returns an empty set when the repo has never been tagged', function () {
    Sanctum::actingAs(User::factory()->create(), ['*']);

    $this->getJson(route('api.v1.repos.tags', ['databaseId' => 1234]))
        ->assertOk()
        ->assertExactJson([
            'databaseId' => 1234,
            'starExists' => false,
            'tags' => [],
        ]);
});

it('returns the tags applied to a tagged repo', function () {
    $user = User::factory()->create();
    $star = Star::factory()->create(['user_id' => $user->id, 'repo_id' => 1234]);
    $tag = Tag::factory()->create(['user_id' => $user->id, 'name' => 'Laravel']);
    $star->tags()->attach($tag->id);

    Sanctum::actingAs($user, ['*']);

    $this->getJson(route('api.v1.repos.tags', ['databaseId' => 1234]))
        ->assertOk()
        ->assertJsonPath('starExists', true)
        ->assertJsonPath('tags.0.name', 'Laravel');
});

it("does not expose another user's star", function () {
    $other = User::factory()->create();
    Star::factory()->create(['user_id' => $other->id, 'repo_id' => 1234]);

    Sanctum::actingAs(User::factory()->create(), ['*']);

    $this->getJson(route('api.v1.repos.tags', ['databaseId' => 1234]))
        ->assertOk()
        ->assertJsonPath('starExists', false);
});

it('rejects a non-numeric databaseId', function () {
    Sanctum::actingAs(User::factory()->create(), ['*']);

    $this->getJson('/api/v1/repos/not-a-number/tags')->assertNotFound();
});
