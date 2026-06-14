<?php

declare(strict_types=1);

use App\Models\Star;
use App\Models\Tag;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('requires authentication', function () {
    $this->putJson(route('api.v1.repos.tags.sync'), [
        'databaseId' => 1234,
        'nameWithOwner' => 'obsproject/obs-studio',
        'url' => 'https://github.com/obsproject/obs-studio',
        'tags' => [],
    ])->assertUnauthorized();
});

it('validates the repository payload', function (array $payload, string $error) {
    Sanctum::actingAs(User::factory()->create(), ['*']);

    $this->putJson(route('api.v1.repos.tags.sync'), $payload)->assertJsonValidationErrors($error);
})->with([
    fn () => [['nameWithOwner' => 'a/b', 'url' => 'https://github.com/a/b'], 'databaseId'],
    fn () => [['databaseId' => 1234, 'url' => 'https://github.com/a/b'], 'nameWithOwner'],
    fn () => [['databaseId' => 1234, 'nameWithOwner' => 'a/b'], 'url'],
    fn () => [['databaseId' => 1234, 'nameWithOwner' => 'a/b', 'url' => 'not-a-url'], 'url'],
]);

describe('authenticated', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user, ['*']);

        $this->meta = [
            'databaseId' => 1234,
            'nameWithOwner' => 'obsproject/obs-studio',
            'url' => 'https://github.com/obsproject/obs-studio',
        ];
    });

    it('creates a star and tags it, returning the resulting set', function () {
        $this->putJson(route('api.v1.repos.tags.sync'), [
            ...$this->meta,
            'tags' => [['name' => 'Livestreaming']],
        ])
            ->assertOk()
            ->assertJsonPath('databaseId', 1234)
            ->assertJsonPath('tags.0.name', 'Livestreaming');

        $this->assertDatabaseHas('stars', ['repo_id' => 1234, 'user_id' => $this->user->id]);
        $this->assertDatabaseHas('tags', ['user_id' => $this->user->id, 'name' => 'Livestreaming']);
    });

    it('creates tags that do not exist yet', function () {
        $this->putJson(route('api.v1.repos.tags.sync'), [
            ...$this->meta,
            'tags' => [['name' => 'Livestreaming'], ['name' => 'Twitch']],
        ])->assertOk();

        $this->assertDatabaseHas('tags', ['user_id' => $this->user->id, 'name' => 'Twitch']);
    });

    it('replaces the full tag set on the repo', function () {
        $star = Star::factory()->create(['user_id' => $this->user->id, 'repo_id' => 1234]);
        $old = Tag::factory()->create(['user_id' => $this->user->id, 'name' => 'Old']);
        $star->tags()->attach($old->id);

        $this->putJson(route('api.v1.repos.tags.sync'), [
            ...$this->meta,
            'tags' => [['name' => 'New']],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'tags')
            ->assertJsonPath('tags.0.name', 'New');

        expect($star->fresh()->tags->pluck('name')->all())->toBe(['New']);
    });

    it('removes all tags when an empty set is synced', function () {
        $star = Star::factory()->create(['user_id' => $this->user->id, 'repo_id' => 1234]);
        $tag = Tag::factory()->create(['user_id' => $this->user->id, 'name' => 'Old']);
        $star->tags()->attach($tag->id);

        $this->putJson(route('api.v1.repos.tags.sync'), [
            ...$this->meta,
            'tags' => [],
        ])
            ->assertOk()
            ->assertJsonCount(0, 'tags');

        expect($star->fresh()->tags()->count())->toBe(0);
    });

    it('returns 403 and rolls back when a non-sponsor exceeds the tag cap', function () {
        config(['app.check_for_sponsorship' => true]);

        Tag::factory()->count(5)->create(['user_id' => $this->user->id]);

        $this->putJson(route('api.v1.repos.tags.sync'), [
            ...$this->meta,
            'tags' => [['name' => 'SixthBrandNewTag']],
        ])
            ->assertForbidden()
            ->assertJsonPath('sponsorshipRequired', 'create_tag');

        $this->assertDatabaseCount('tags', 5);
        $this->assertDatabaseMissing('tags', ['name' => 'SixthBrandNewTag']);
        $this->assertDatabaseMissing('stars', ['repo_id' => 1234, 'user_id' => $this->user->id]);
    });

    it('allows re-syncing an existing at-cap tag set', function () {
        config(['app.check_for_sponsorship' => true]);

        $tags = Tag::factory()->count(5)->create(['user_id' => $this->user->id]);

        $this->putJson(route('api.v1.repos.tags.sync'), [
            ...$this->meta,
            'tags' => $tags->map(fn ($tag) => ['name' => $tag->name])->all(),
        ])
            ->assertOk()
            ->assertJsonCount(5, 'tags');

        $this->assertDatabaseCount('tags', 5);
    });
});
