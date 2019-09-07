<?php

namespace Tests\Unit;

use Astral\Exceptions\InvalidAccessTokenException;
use Astral\Lib\GitHubClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GitHubClientTest extends TestCase
{
    use RefreshDatabase;

    protected $client;
    protected $sampleStars;

    protected function setUp(): void
    {
        parent::setUp();
        $this->login();
        $user = auth()->user();
        $user->access_token = encrypt(env('GITHUB_TEST_ACCESS_TOKEN'));
        $user->save();

        $this->client = new GitHubClient();
        $this->sampleStars = json_decode(file_get_contents(__DIR__.'/../Blobs/stars_with_cursor.json'), true);
    }

    /** @test */
    public function it_fetches_stars_from_the_github_api()
    {
        $stars = $this->client->fetchStars(null, 100);

        $this->assertArrayHasKey('edges', $stars);
    }

    /** @test */
    public function it_can_limit_the_stars_per_page()
    {
        $stars = $this->client->fetchStars(null, 2);

        $this->assertCount(2, $stars['edges']);
    }

    /** @test */
    public function it_can_pass_a_cursor_to_fetch_a_certain_page_of_stars()
    {
        $cursor = $this->sampleStars['edges'][0]['cursor'];

        $stars = $this->client->fetchStars($cursor, 1);

        $this->assertEquals($this->sampleStars['edges'][1]['node']['databaseId'], $stars['edges'][0]['node']['databaseId']);
    }

    /** @test */
    public function it_throws_an_exception_if_no_token_is_provided()
    {
        $stars = [];

        try {
            $user = auth()->user();
            $user->access_token = encrypt('foobar');
            $user->save();

            $client = new GitHubClient();
            $stars = $client->fetchStars(null, 100);
        } catch (InvalidAccessTokenException $e) {
            $this->assertCount(0, $stars);

            return;
        }

        $this->fail('Stars were fetched even though an invalid access token was passed');
    }
}
