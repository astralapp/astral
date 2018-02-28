<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TagsStarsTest extends TestCase
{
    use RefreshDatabase;

    protected $star;

    protected function setUp()
    {
        parent::setUp();

        $this->login();

        $this->star = create('Astral\Models\Star', ['user_id' => auth()->id()]);
    }

    /** @test */
    public function an_existing_tag_can_be_pushed_to_a_stars_tags()
    {
        $tag = create('Astral\Models\Tag');

        $response = $this->postJson('/api/star/tags', [
            'relayId' => $this->star->relay_id,
            'tagId' => $tag->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'tags' => [$tag->toArray()]
        ]);

        $this->assertEquals(1, $this->star->tags()->count());
        $this->assertEquals($tag->name, $this->star->tags->first()->name);
    }

    /** @test */
    public function one_or_more_tags_can_be_synced_to_a_star()
    {
        $tags = [
            ['name' => 'Laravel'],
            ['name' => 'VueJS'],
            ['name' => 'GraphQL'],
        ];

        $response = $this->putJson('/api/star/tags', [
            'relayId' => $this->star->relay_id,
            'tags' => $tags,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'star' => $this->star->toArray(),
            'tags' => $tags
        ]);

        $this->assertEquals(3, $this->star->tags()->count());
    }
}
