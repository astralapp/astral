<?php

namespace Tests\Unit;

use Astral\Lib\Autotagger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutotaggerTest extends TestCase
{
    use RefreshDatabase;

    protected $autotagger;

    protected function setUp()
    {
        parent::setUp();

        $this->login();

        $this->autotagger = new Autotagger(auth()->user());
    }

    /** @test */
    public function it_autotags_stars_with_their_topics()
    {
        $sampleStars = json_decode(file_get_contents(__DIR__.'/../Blobs/stars.json'), true);

        $star = auth()->user()->stars()->create([
            'repo_id' => $sampleStars['edges'][0]['node']['databaseId'],
        ]);

        $star->syncTags([['name' => 'foo'], ['name' => 'bar'], ['name' => 'javascript']]);

        $this->autotagger->tagByTopic($sampleStars);

        $this->assertCount(5, auth()->user()->stars);
        $this->assertEquals(
            auth()->user()->stars()->with('tags')->first()->tags->map->name->toArray(),
            ['foo', 'bar', 'javascript', 'drag-and-drop', 'draggable', 'es6']
        );
    }
}
