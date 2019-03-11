<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CleansUpStarsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function it_deletes_db_stars_that_no_longer_exist_in_users_github_stars_list()
    {
        $sampleStars = json_decode(file_get_contents(__DIR__.'/../Blobs/stars.json'), true);

        $validStar = create('Astral\Models\Star', ['repo_id' => $sampleStars['edges'][0]['node']['databaseId'], 'user_id' => auth()->id()]);
        $validStar->syncTags([['name' => 'Testo']]);

        $unstarredStar = create('Astral\Models\Star', ['repo_id' => 'abc123', 'user_id' => auth()->id()]);

        $emptyStar = create('Astral\Models\Star', ['repo_id' => $sampleStars['edges'][0]['node']['databaseId'], 'user_id' => auth()->id(), 'notes' => null]);

        $this->assertCount(3, auth()->user()->stars);

        Cache::shouldReceive('get')->with(auth()->user()->starsCacheKey())->andReturn($sampleStars);

        $response = $this->deleteJson('/api/stars/cleanup')
            ->assertStatus(200)
            ->assertJson([$validStar->toArray()]);

        $this->assertCount(1, auth()->user()->fresh()->stars);
        $this->assertNull(auth()->user()->stars()->find($unstarredStar->id));
        $this->assertNull(auth()->user()->stars()->find($emptyStar->id));
    }
}
