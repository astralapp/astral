<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagsStarsTest extends TestCase
{
    use RefreshDatabase;

    protected $star;

    protected function setUp()
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function an_existing_tag_can_be_pushed_to_a_stars_tags()
    {
        $tag = create('Astral\Models\Tag', ['user_id' => auth()->id()]);
        $star = create('Astral\Models\Star', ['user_id' => auth()->id()]);

        $response = $this->postJson('/api/star/tags', [
            'starIds' => [$star->repo_id],
            'tag'     => $tag,
        ]);

        $response->assertStatus(200)->assertJson([
            'tags' => [$tag->toArray()],
        ]);

        $this->assertEquals(1, $star->tags()->count());
        $this->assertEquals($tag->name, $star->tags->first()->name);
    }

    /** @test */
    public function one_or_more_tags_can_be_synced_to_a_star()
    {
        $tags = [
            ['name' => 'Laravel'],
            ['name' => 'VueJS'],
            ['name' => 'GraphQL'],
        ];

        $star = create('Astral\Models\Star', ['user_id' => auth()->id()]);

        $response = $this->putJson('/api/star/tags', [
            'id' => $star->repo_id,
            'tags'    => $tags,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'star' => $star->toArray(),
            'tags' => $tags,
        ]);

        $this->assertEquals(3, $star->tags()->count());
    }
}
