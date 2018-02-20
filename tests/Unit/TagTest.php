<?php

namespace Tests\Unit;

use Tests\TestCase;
use Astral\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    protected $star;

    protected function setUp()
    {
        parent::setUp();

        createLoggedInUser();

        $this->tag = create('Astral\Models\Tag');
    }

    /** @test */
    public function it_has_an_associated_user()
    {
        $this->assertInstanceOf('Astral\Models\User', $this->tag->user);
    }

    /** @test */
    public function it_can_have_associated_stars()
    {
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $this->tag->stars);
    }

    /** @test */
    public function it_can_fetch_a_tag_by_name()
    {
        create('Astral\Models\Star', ['user_id' => auth()->id()], 5);

        $name = Tag::all()->first()->name;
        $tag = Tag::whereName($name)->first();

        $this->assertEquals($name, $tag->first()->name);
    }

    /** @test */
    public function it_can_get_the_star_counts_for_tags()
    {
        $star = create('Astral\Models\Star', ['user_id' => auth()->id()]);

        $star->syncTags([
            ['name' => $this->tag->name],
            ['name' => 'Routing'],
            ['name' => 'Vue'],
            ['name' => 'Laravel'],
            ['name' => 'SPA'],
        ]);

        $counts = Tag::withStarCount()->get()->map->stars_count->toArray();

        $this->assertEquals(
            ['1', '1', '1', '1', '1'],
            $counts
        );
    }
}
