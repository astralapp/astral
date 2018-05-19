<?php

namespace Tests\Feature;

use Mockery;
use Tests\TestCase;
use Astral\Lib\GitHubClient;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AutotagsWithTopicsTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp()
    {
        parent::setUp();
     
        $user = create('Astral\Models\User', ['autotag_topics' => true]);
        $this->login($user);
        
        $this->sampleStars = json_decode(file_get_contents(__DIR__.'/../Blobs/stars.json'), true);
        $this->clientMock = Mockery::mock(GitHubClient::class, [auth()->user()->access_token]);
        $this->app->instance(GitHubClient::class, $this->clientMock);
        
        
    }

    protected function tearDown()
    {
        Mockery::close();

        parent::tearDown();
    }

    /** @test */
    public function it_autotags_stars_with_their_topics()
    {
        $star = auth()->user()->stars()->create([
            'repo_id' => $this->sampleStars['edges'][0]['node']['databaseId'],
        ]);

        $star->syncTags([['name' => 'foo'], ['name' => 'bar'], ['name' => 'javascript']]);
        
        $this->clientMock->shouldReceive('fetchStars')->with(null)->andReturn($this->sampleStars);

        $this->getJson('/api/stars/github')->assertStatus(200);
        
        $this->assertCount(5, auth()->user()->stars);
        $this->assertEquals(
            auth()->user()->stars()->with('tags')->first()->tags->map->name->toArray(),
            ['foo', 'bar', 'javascript', 'drag-and-drop', 'draggable', 'es6']
        );
            
    }
}
