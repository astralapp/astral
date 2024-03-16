<?php

declare(strict_types=1);

use App\Models\Tag;
use App\Models\Star;

it('redirects guests to the login page')
    ->post('/stars/tag')
    ->assertRedirect('/login');

it('creates a new `Star` record + pivot entry for each repository passed to the request', function () {
    $repoData = [
        [
            'databaseId' => 1234,
            'nameWithOwner' => 'obsproject/obs-studio',
            'url' => 'https://github.com/obsproject/obs-studio',
        ],
        [
            'databaseId' => 5678,
            'nameWithOwner' => 'stream-labs/desktop',
            'url' => 'https://github.com/stream-labs/desktop',
        ],
    ];

    $this->login();

    $tag = Tag::factory()->create(['name' => 'Livestreaming', 'user_id' => auth()->id()]);

    $this->assertDatabaseMissing('star_tag', ['tag_id' => $tag->id]);

    $this
        ->post(route('star.tags.store'), [
            'repos' => $repoData,
            'tagId' => $tag->id,
        ])
        ->assertRedirect(route('dashboard.show'));

    foreach ($repoData as $repo) {
        $this->assertDatabaseHas('stars', [
            'repo_id' => $repo['databaseId'],
            'meta' => collect($repo)->except(['databaseId'])->toJson(),
        ]);

        $this->assertDatabaseHas('star_tag', [
            'tag_id' => $tag->id,
            'star_id' => auth()->user()->stars()->where('repo_id', $repo['databaseId'])->first()->id,
        ]);
    }
});

it('doesn\'t create a new `Star` if it already exists for that user', function () {
    $repoData = [
        [
            'databaseId' => 1234,
            'nameWithOwner' => 'obsproject/obs-studio',
            'url' => 'https://github.com/obsproject/obs-studio',
        ],
        [
            'databaseId' => 5678,
            'nameWithOwner' => 'stream-labs/desktop',
            'url' => 'https://github.com/stream-labs/desktop',
        ],
    ];

    $this->login();

    $tag = Tag::factory()->create(['name' => 'Livestreaming', 'user_id' => auth()->id()]);
    Star::factory()->create(['repo_id' => 1234, 'user_id' => auth()->id()]);

    $this
        ->post(route('star.tags.store'), [
            'repos' => $repoData,
            'tagId' => $tag->id,
        ]);

    expect(auth()->user()->stars()->count())->toBe(2);
    expect(auth()->user()->stars()->where('repo_id', 1234)->count())->toBe(1);
});

describe('Validating repository data', function () {
    beforeEach(function () {
        $this->login();

        $this->tag = Tag::factory()->create(['name' => 'Laravel', 'user_id' => auth()->id()]);
        $this->meta = [
            'databaseId' => 583823,
            'nameWithOwner' => 'astralapp/astral',
            'url' => 'https://github.com/astralapp/astral',
        ];
        $this->metaWithoutDatabaseId = collect($this->meta)->except(['databaseId'])->toArray();
        $this->metaWithoutNameWithOwner = collect($this->meta)->except(['nameWithOwner'])->toArray();
        $this->metaWithoutUrl = collect($this->meta)->except(['url'])->toArray();
    });

    it('requires an array of repository data', function ($badData, array|string $errors) {
        $this
            ->post(route('star.tags.store'), ['tagId' => $this->tag->id, 'repos' => $badData])
            ->assertInvalid($errors);
    })->with([
        [[], 'repos'],
        [null, 'repos'],
        [1234, 'repos'],
        ['[]', 'repos'],
    ]);

    it('requires a valid `databaseId` field for each repository passed', function ($badData, array|string $errors) {
        $this
            ->post(route('star.tags.store'), ['tagId' => $this->tag->id, 'repos' => $badData])
            ->assertInvalid($errors);
    })->with([
        fn () => [[$this->metaWithoutDatabaseId], 'repos.0.databaseId'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'databaseId' => 'foobar']], 'repos.0.databaseId'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'databaseId' => null]], 'repos.0.databaseId'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'databaseId' => []]], 'repos.0.databaseId'],
    ]);

    it('requires a valid `nameWithOwner` field for each repository passed', function ($badData, array|string $errors) {
        $this
            ->post(route('star.tags.store'), ['tagId' => $this->tag->id, 'repos' => $badData])
            ->assertInvalid($errors);
    })->with([
        fn () => [[$this->metaWithoutNameWithOwner], 'repos.0.nameWithOwner'],
        fn () => [[[...$this->metaWithoutNameWithOwner, 'nameWithOwner' => 12345]], 'repos.0.nameWithOwner'],
        fn () => [[[...$this->metaWithoutNameWithOwner, 'nameWithOwner' => null]], 'repos.0.nameWithOwner'],
        fn () => [[[...$this->metaWithoutNameWithOwner, 'nameWithOwner' => []]], 'repos.0.nameWithOwner'],
    ]);

    it('requires a valid `url` field for each repository passed', function ($badData, array|string $errors) {
        $this
            ->post(route('star.tags.store'), ['tagId' => $this->tag->id, 'repos' => $badData])
            ->assertInvalid($errors);
    })->with([
        fn () => [[$this->metaWithoutUrl], 'repos.0.url'],
        fn () => [[[...$this->metaWithoutUrl, 'url' => 12345]], 'repos.0.url'],
        fn () => [[[...$this->metaWithoutUrl, 'url' => 'not-a-url-string']], 'repos.0.url'],
        fn () => [[[...$this->metaWithoutUrl, 'url' => null]], 'repos.0.url'],
        fn () => [[[...$this->metaWithoutUrl, 'url' => []]], 'repos.0.url'],
    ]);

    it('validates the `description` field if present', function ($badData, array|string $errors) {
        $this
            ->post(route('star.tags.store'), ['tagId' => $this->tag->id, 'repos' => $badData])
            ->assertInvalid($errors);
    })->with([
        fn () => [[[...$this->metaWithoutUrl, 'description' => 12345]], 'repos.0.description'],
        fn () => [[[...$this->metaWithoutUrl, 'description' => []]], 'repos.0.description'],
    ]);
});
