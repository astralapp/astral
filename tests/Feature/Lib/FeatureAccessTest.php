<?php

declare(strict_types=1);

use App\Data\Enums\Ability;
use App\Lib\FeatureAccess;
use App\Models\User;

beforeEach(function () {
    config(['app.check_for_sponsorship' => true, 'limits.max_tags' => 5]);
    $this->access = app(FeatureAccess::class);
});

it('grants every ability to a sponsor', function () {
    $user = User::factory()->create();
    $user->setSponsorshipStatus(true);

    foreach (Ability::cases() as $ability) {
        expect($this->access->allows($user, $ability))->toBeTrue();
    }
});

it('gates smart filters and notes behind sponsorship', function () {
    $user = User::factory()->create();

    expect($this->access->allows($user, Ability::CREATE_SMART_FILTER))->toBeFalse();
    expect($this->access->allows($user, Ability::ADD_NOTES))->toBeFalse();
});

it('lets a non-sponsor create tags until the cap', function () {
    $user = User::factory()->create();

    $user->tags()->createMany(collect(range(1, 4))->map(fn ($n) => ['name' => "tag-{$n}"])->all());
    expect($this->access->allows($user, Ability::CREATE_TAG))->toBeTrue();

    $user->tags()->create(['name' => 'tag-5']);
    expect($this->access->allows($user, Ability::CREATE_TAG))->toBeFalse();
});

it('treats the tag cap as inclusive for syncs', function () {
    $user = User::factory()->create();
    $user->tags()->createMany(collect(range(1, 5))->map(fn ($n) => ['name' => "tag-{$n}"])->all());

    // At the cap: a create is denied but an existing at-cap sync is still allowed.
    expect($this->access->allows($user, Ability::CREATE_TAG))->toBeFalse();
    expect($this->access->canSyncTags($user))->toBeTrue();

    $user->tags()->create(['name' => 'tag-6']);
    expect($this->access->canSyncTags($user))->toBeFalse();
});

it('exposes an ability map covering every enum case', function () {
    $user = User::factory()->create();

    expect($this->access->map($user))->toHaveKeys(
        collect(Ability::cases())->map->value->all()
    );
});

it('unlocks everything when sponsorship checking is disabled', function () {
    config(['app.check_for_sponsorship' => false]);

    $user = User::factory()->create();

    foreach (Ability::cases() as $ability) {
        expect($this->access->allows($user, $ability))->toBeTrue();
    }
    expect($this->access->canSyncTags($user))->toBeTrue();
});
