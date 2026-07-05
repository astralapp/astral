<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Http\UploadedFile;

it('streams a downloadable json export', function () {
    $user = User::factory()->create();
    test()->actingAs($user);
    $user->tags()->create(['name' => 'rust']);

    $response = test()->get(route('data.export'));

    $response->assertOk();
    $response->assertDownload();

    $payload = json_decode($response->streamedContent(), true);
    expect($payload['version'])->toBe(1);
    expect($payload['tags'])->toBe([['name' => 'rust', 'sort_order' => 1]]);
});

it('imports an uploaded export file and flashes a summary', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $json = json_encode([
        'version' => 1,
        'tags' => [['name' => 'rust', 'sort_order' => 1]],
        'stars' => [],
        'smart_filters' => [],
    ]);

    $file = UploadedFile::fake()->createWithContent('astral-export.json', $json);

    test()->post(route('data.import'), ['file' => $file])
        ->assertRedirect(route('dashboard.show'))
        ->assertSessionHas('success');

    expect($user->tags()->pluck('name')->all())->toBe(['rust']);
});

it('rejects an incompatible export version without touching the account', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $file = UploadedFile::fake()->createWithContent('bad.json', json_encode(['version' => 999]));

    test()->post(route('data.import'), ['file' => $file])
        ->assertSessionHasErrors('version');

    expect($user->tags()->count())->toBe(0);
});

it('rejects a file that is not valid json', function () {
    $user = User::factory()->create();
    test()->actingAs($user);

    $file = UploadedFile::fake()->createWithContent('bad.json', 'not json at all');

    test()->post(route('data.import'), ['file' => $file])
        ->assertSessionHasErrors('file');
});

it('requires authentication', function () {
    test()->get(route('data.export'))->assertRedirect();
    test()->post(route('data.import'))->assertRedirect();
});
