<?php

namespace Tests\Unit;

use Tests\TestCase;
use Astral\Lib\StarsJanitor;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StarsJanitorTest extends TestCase
{
    use RefreshDatabase;

    protected $janitor;

    protected function setUp()
    {
        parent::setUp();

        $this->login();

        $this->janitor = new StarsJanitor(auth()->user());


    }

    /** @test */
    public function it_deletes_db_stars_that_no_longer_exist_in_users_github_stars_list()
    {
        $sampleStars = json_decode(file_get_contents(__DIR__ . '/../Blobs/stars.json'), true);

        $star1 = create('Astral\Models\Star', ['relay_id' => $sampleStars['edges'][0]['node']['id'], 'user_id' => auth()->id()]);
        $star2 = create('Astral\Models\Star', ['relay_id' => $sampleStars['edges'][1]['node']['id'], 'user_id' => auth()->id()]);
        $star3 = create('Astral\Models\Star', ['relay_id' => 'abc123', 'user_id' => auth()->id()]);

        $this->assertCount(3, auth()->user()->stars);

        Cache::shouldReceive('get')->with(auth()->user()->starsCacheKey())->andReturn($sampleStars);

        $this->janitor->deleteUnstarredStars();

        $this->assertCount(2, auth()->user()->fresh()->stars);
        $this->assertNull(auth()->user()->stars()->find($star3->id));

    }

    /** @test */
    public function it_deletes_db_stars_that_have_no_tags_or_notes()
    {
        $tag = create('Astral\Models\Tag', ['user_id' => auth()->id()]);
        $star1 = create('Astral\Models\Star', ['user_id' => auth()->id()]);
        $star1->syncTags([['name' => $tag->name]]);
        $star2 = create('Astral\Models\Star', ['notes' => null, 'user_id' => auth()->id()]);
        $star3 = create('Astral\Models\Star', ['user_id' => auth()->id()]);

        $this->janitor->deleteEmptyStars();

        $this->assertCount(2, auth()->user()->stars);
        $this->assertNotNull(auth()->user()->stars()->find($star1->id));
        $this->assertNotNull(auth()->user()->stars()->find($star3->id));
        $this->assertNull(auth()->user()->stars()->find($star2->id));
    }

}
