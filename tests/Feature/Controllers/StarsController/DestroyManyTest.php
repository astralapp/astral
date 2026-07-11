<?php

declare(strict_types=1);

use App\Models\Star;
use App\Models\Tag;
use App\Models\User;

it('redirects guests to the login page')
    ->delete('/stars')
    ->assertRedirect('/auth');

it('deletes the given stars belonging to the authenticated user', function () {
    $this->login();

    $stars = Star::factory()->count(3)->create(['user_id' => auth()->id()]);

    $this
        ->delete(route('stars.destroy'), ['ids' => $stars->pluck('id')->all()])
        ->assertRedirect(route('dashboard.show'));

    foreach ($stars as $star) {
        $this->assertDatabaseMissing('stars', ['id' => $star->id]);
    }
});

it('detaches tag pivots for the deleted stars', function () {
    $this->login();

    $tag = Tag::factory()->create(['name' => 'Testing', 'user_id' => auth()->id()]);
    $star = Star::factory()->create(['user_id' => auth()->id()]);
    $star->tags()->attach($tag->id);

    $this->assertDatabaseHas('star_tag', ['star_id' => $star->id, 'tag_id' => $tag->id]);

    $this->delete(route('stars.destroy'), ['ids' => [$star->id]]);

    $this->assertDatabaseMissing('star_tag', ['star_id' => $star->id]);
});

it('does not delete stars belonging to another user', function () {
    $this->login();

    $mine = Star::factory()->create(['user_id' => auth()->id()]);
    $theirs = Star::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->delete(route('stars.destroy'), ['ids' => [$mine->id, $theirs->id]]);

    $this->assertDatabaseMissing('stars', ['id' => $mine->id]);
    $this->assertDatabaseHas('stars', ['id' => $theirs->id]);
});

it('requires a valid `ids` array', function ($badData, array|string $errors) {
    $this->login();

    $this
        ->delete(route('stars.destroy'), ['ids' => $badData])
        ->assertInvalid($errors);
})->with([
    [[], 'ids'],
    [null, 'ids'],
    ['not-an-array', 'ids'],
    [1234, 'ids'],
    [['not-an-int'], 'ids.0'],
]);
