<?php

namespace Tests\Unit;

use Astral\Lib\StarsJanitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StarsJanitorTest extends TestCase
{
    use RefreshDatabase;

    protected $janitor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();

        $this->janitor = new StarsJanitor(auth()->user());
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
