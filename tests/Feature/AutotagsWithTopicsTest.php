<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AutotagsWithTopicsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();

        $user = create('Astral\Models\User', ['autotag_topics' => true]);
        $this->login($user);
    }

    /** @test */
    public function it_autotags_stars_with_their_topics()
    {
        $sampleStars = json_decode(file_get_contents(__DIR__.'/../Blobs/stars.json'), true);

        $star = auth()->user()->stars()->create([
            'repo_id' => $sampleStars['edges'][0]['node']['databaseId'],
        ]);

        $star->syncTags([['name' => 'foo'], ['name' => 'bar'], ['name' => 'javascript']]);

        Cache::shouldReceive('get')->with(auth()->user()->starsCacheKey())->andReturn($sampleStars);

        $this->putJson('/api/stars/autotag')->assertStatus(200);

        $this->assertCount(5, auth()->user()->stars);
        $this->assertEquals(
            auth()->user()->stars()->with('tags')->first()->tags->map->name->toArray(),
            ['foo', 'bar', 'javascript', 'drag-and-drop', 'draggable', 'es6']
        );
    }
}
