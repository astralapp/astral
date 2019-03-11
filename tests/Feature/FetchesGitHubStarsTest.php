<?php

namespace Tests\Feature;

use Astral\Lib\GitHubClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

class FetchesGitHubStarsTest extends TestCase
{
    use RefreshDatabase;

    protected $sampleStars;
    protected $clientMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();

        $this->sampleStars = json_decode(file_get_contents(__DIR__ . '/../Blobs/stars.json'), true);

        $this->clientMock = Mockery::mock(GitHubClient::class, [auth()->user()->access_token]);

        $this->app->instance(GitHubClient::class, $this->clientMock);
    }

    protected function tearDown(): void
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

        $this->getJson('/api/stars/github')
            ->assertStatus(200)
            ->assertJson($this->sampleStars);
    }

    /** @test */
    public function a_user_can_request_a_refresh_of_their_stars()
    {
        $this->withoutExceptionHandling();

        $cacheKey = auth()->user()->starsCacheKey();

        Cache::spy();

        $this->clientMock->shouldReceive('fetchStars')->with(null)->andReturn($this->sampleStars);

        $this->getJson('/api/stars/github?refresh=true')
            ->assertStatus(200)
            ->assertJson($this->sampleStars);

        Cache::shouldHaveReceived('forget')->with($cacheKey)->once();
    }
}
