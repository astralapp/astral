<?php

namespace Tests\Unit;

use Tests\TestCase;
use Astral\Models\Star;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StarTest extends TestCase
{
    use RefreshDatabase;

    protected $star;

    public function setUp()
    {
        parent::setUp();

        createLoggedInUser();

        $this->star = create('Astral\Models\Star');
    }

    /** @test */
    public function it_has_an_associated_user()
    {
        $this->assertInstanceOf('Astral\Models\User', $this->star->user);
    }

    /** @test */
    public function it_can_have_associated_tags()
    {
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $this->star->tags);
    }

    /** @test */
    public function it_can_fetch_a_repo_by_relay_id()
    {
        create('Astral\Models\Star', ['user_id' => auth()->id()], 5);

        $firstId = Star::all()->first()->relay_id;
        $star = Star::withRepoId($firstId)->first();

        $this->assertEquals($firstId, $star->first()->relay_id);
    }

    /** @test */
    public function it_can_sync_a_list_of_tags()
    {
        $tags = $this->attachSampleTagsToStars();

        $this->assertCount(5, $this->star->tags);
    }

    /** @test */
    public function it_removes_all_tags_if_sync_tags_is_passed_an_empty_array()
    {
        $tags = $this->attachSampleTagsToStars();

        $this->star->syncTags([]);

        $this->assertCount(0, $this->star->tags);

    }

    private function attachSampleTagsToStars($count = 5)
    {
        $tags = create('Astral\Models\Tag', ['user_id' => auth()->id()], $count);

        $tagNames = $tags->map(function ($tag) {
            return ['name' => $tag->name];
        });

        $this->star->syncTags($tagNames);

        return $tags;
    }

}