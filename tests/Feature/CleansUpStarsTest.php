<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Astral\Exceptions\NotAllGitHubStarsFetchedException;

class CleansUpStarsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();

        createLoggedInUser();
    }

    /** @test */
    public function it_deletes_db_stars_that_no_longer_exist_in_users_github_stars_list()
    {
        $sampleStars = json_decode(file_get_contents(__DIR__ . '/../Blobs/stars.json'), true);

        $star1 = create('Astral\Models\Star', ['relay_id' => $sampleStars['edges'][0]['node']['id']]);
        $star2 = create('Astral\Models\Star', ['relay_id' => $sampleStars['edges'][1]['node']['id']]);
        $star3 = create('Astral\Models\Star', ['relay_id' => 'abc123']);

        $this->assertCount(3, auth()->user()->stars);

        Cache::shouldReceive('get')->with(auth()->user()->starsCacheKey())->andReturn($sampleStars);

        $response = $this->deleteJson('/api/stars/cleanup')
            ->assertStatus(200)
            ->assertJson([
                $star1->toArray(),
                $star2->toArray()
            ]);

        $this->assertCount(2, auth()->user()->fresh()->stars);
        $this->assertNull(auth()->user()->stars()->find($star3->id));

    }

    /** @test */
    public function it_throws_an_exception_if_an_incomplete_list_of_github_stars_has_not_been_cached()
    {
        $this->withoutExceptionHandling();

        $sampleStars = json_decode(file_get_contents(__DIR__ . '/../Blobs/stars.json'), true);
        $sampleStars['pageInfo']['hasNextPage'] = true;

        $star1 = create('Astral\Models\Star', ['relay_id' => $sampleStars['edges'][0]['node']['id']]);
        $star2 = create('Astral\Models\Star', ['relay_id' => $sampleStars['edges'][1]['node']['id']]);
        $star3 = create('Astral\Models\Star', ['relay_id' => 'abc123']);

        Cache::shouldReceive('get')->with(auth()->user()->starsCacheKey())->andReturn($sampleStars);

        try {
            $this->deleteJson('/api/stars/cleanup');
        } catch (NotAllGitHubStarsFetchedException $e) {
            $this->assertCount(3, auth()->user()->stars);
            return;
        }
        $this->fail('Stars were deleted even though not all of user\'s GitHub Stars were fetched and cached');
    }

    /** @test */
    public function it_throws_an_exception_if_no_github_stars_have_been_cached()
    {
        $this->withoutExceptionHandling();

        $star1 = create('Astral\Models\Star');
        $star2 = create('Astral\Models\Star');
        $star3 = create('Astral\Models\Star');

        Cache::shouldReceive('get')->with(auth()->user()->starsCacheKey())->andReturn(null);

        try {
            $this->deleteJson('/api/stars/cleanup');
        } catch (NotAllGitHubStarsFetchedException $e) {
            $this->assertCount(3, auth()->user()->stars);
            return;
        }
        $this->fail('Stars were deleted even though none of the user\'s GitHub Stars were fetched and cached');
    }

}
