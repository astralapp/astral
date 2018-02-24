<?php

namespace Tests\Feature;

use Mockery;
use Tests\TestCase;
use Astral\Lib\GitHubClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FetchesGitHubStarsTest extends TestCase
{
    use RefreshDatabase;

    protected $sampleStars;
    protected $clientMock;

    protected function setUp()
    {
        parent::setUp();

        createLoggedInUser();

        $this->sampleStars = json_decode(file_get_contents(__DIR__ . '/../Blobs/stars.json'), true);

        $this->clientMock = Mockery::mock(GitHubClient::class, [auth()->user()->access_token])->makePartial();

        $this->app->instance(GitHubClient::class, $this->clientMock);

    }

    protected function tearDown()
    {
        Mockery::close();

        parent::tearDown();
    }

    /** @test */
    public function a_user_can_fetch_their_github_stars()
    {

        $this->withoutExceptionHandling();

        $cacheKey = auth()->user()->starsCacheKey();

        Cache::shouldReceive('has')->with($cacheKey)->andReturn(false);
        Cache::shouldReceive('get')->with($cacheKey);
        Cache::shouldReceive('put')->with($cacheKey, $this->sampleStars, 120);

        $this->clientMock->shouldReceive('fetchStars')->with(null)->andReturn($this->sampleStars);

        $this->postJson('/api/stars/github', [])
            ->assertStatus(200)
            ->assertJson($this->sampleStars);

    }
}
