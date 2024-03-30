<?php

declare(strict_types=1);

use App\Models\Star;
use App\Models\Tag;

it('redirects guests to the login page')
    ->post('/stars/tag')
    ->assertRedirect('/login');

it('creates a new `Star` record if it does not exist', function () {
    $repositoryMeta = [
        'databaseId' => 1234,
        'nameWithOwner' => 'obsproject/obs-studio',
        'url' => 'https://github.com/obsproject/obs-studio',
    ];

    $this->login();

    expect(auth()->user()->stars()->count())->toBe(0);

    $this
        ->put(route('star.tags.update'), [
            ...$repositoryMeta,
            'tags' => [['name' => 'Livestreaming']],
        ])
        ->assertRedirect(route('dashboard.show'));

    $this->assertDatabaseHas('stars', [
        'repo_id' => 1234,
    ]);

    $this->assertDatabaseHas('star_tag', [
        'tag_id' => auth()->user()->tags()->where('name', 'Livestreaming')->first()->id,
        'star_id' => auth()->user()->stars()->where('repo_id', 1234)->first()->id,
    ]);
});

it('does not create a new `Star` record if it already exists for that user', function () {
    $repositoryMeta = [
        'databaseId' => 1234,
        'nameWithOwner' => 'obsproject/obs-studio',
        'url' => 'https://github.com/obsproject/obs-studio',
    ];

    $this->login();

    Star::factory()->create(['repo_id' => 1234, 'user_id' => auth()->id()]);

    expect(auth()->user()->stars()->count())->toBe(1);

    $this
        ->put(route('star.tags.update'), [
            ...$repositoryMeta,
            'tags' => [['name' => 'Livestreaming']],
        ]);

    expect(auth()->user()->stars()->count())->toBe(1);
    expect(auth()->user()->stars()->first()->meta)
        ->toEqual(collect($repositoryMeta)->except('databaseId')->toArray());
});

it('creates a new `Tag` record for each tag passed that does not already exist', function () {
    $repositoryMeta = [
        'databaseId' => 1234,
        'nameWithOwner' => 'obsproject/obs-studio',
        'url' => 'https://github.com/obsproject/obs-studio',
    ];

    $this->login();

    Star::factory()->create(['repo_id' => 1234, 'user_id' => auth()->id()]);
    Tag::factory()->create(['name' => 'Livestreaming', 'user_id' => auth()->id()]);

    expect(Tag::where('name', 'Twitch')->exists())->toBeFalse();

    $this
        ->put(route('star.tags.update'), [
            ...$repositoryMeta,
            'tags' => [['name' => 'Livestreaming'], ['name' => 'Twitch']],
        ]);

    expect(Tag::where('name', 'Twitch')->exists())->toBeTrue();
});

it('does not create a new `Tag` record for the user if it already exists', function () {
    $repositoryMeta = [
        'databaseId' => 1234,
        'nameWithOwner' => 'obsproject/obs-studio',
        'url' => 'https://github.com/obsproject/obs-studio',
    ];

    $this->login();

    Star::factory()->create(['repo_id' => 1234, 'user_id' => auth()->id()]);
    Tag::factory()->create(['name' => 'Livestreaming', 'user_id' => auth()->id()]);

    expect(Tag::where('name', 'Twitch')->exists())->toBeFalse();

    $this
        ->put(route('star.tags.update'), [
            ...$repositoryMeta,
            'tags' => [['name' => 'Livestreaming'], ['name' => 'Twitch']],
        ]);

    expect(Tag::where('name', 'Livestreaming')->count())->toBe(1);
});

describe('Validating repository data', function () {
    beforeEach(function () {
        $this->login();

        Star::factory()->create(['repo_id' => 1234, 'user_id' => auth()->id()]);
        $this->tag = Tag::factory()->create(['name' => 'Laravel', 'user_id' => auth()->id()]);

        $this->meta = [
            'databaseId' => 1234,
            'nameWithOwner' => 'astralapp/astral',
            'url' => 'https://github.com/astralapp/astral',
        ];
        $this->metaWithoutDatabaseId = collect($this->meta)->except(['databaseId'])->toArray();
        $this->metaWithoutNameWithOwner = collect($this->meta)->except(['nameWithOwner'])->toArray();
        $this->metaWithoutUrl = collect($this->meta)->except(['url'])->toArray();
    });

    it('requires a valid `databaseId` value', function ($badData, array|string $errors) {
        $this
            ->put(route('star.tags.update'), [
                ...$badData,
                'tags' => [['name' => 'Livestreaming']],
            ])
            ->assertInvalid($errors);
    })->with([
        fn () => [[$this->metaWithoutDatabaseId], 'databaseId'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'databaseId' => 'foobar']], 'databaseId'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'databaseId' => null]], 'databaseId'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'databaseId' => []]], 'databaseId'],
    ]);

    it('requires a valid `nameWithOwner` value', function ($badData, array|string $errors) {
        $this
            ->put(route('star.tags.update'), [
                ...$badData,
                'tags' => [['name' => 'Livestreaming']],
            ])
            ->assertInvalid($errors);
    })->with([
        fn () => [[$this->metaWithoutDatabaseId], 'nameWithOwner'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'nameWithOwner' => 420]], 'nameWithOwner'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'nameWithOwner' => null]], 'nameWithOwner'],
        fn () => [[[...$this->metaWithoutDatabaseId, 'nameWithOwner' => []]], 'nameWithOwner'],
    ]);
});

it('requires a valid `url` value')->todo();
it('validates the `description` value if present')->todo();
it('validates the tags are an array')->todo();
it('validates that each tag has a valid `name` value')->todo();
