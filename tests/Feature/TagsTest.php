<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TagsTest extends TestCase
{
    use RefreshDatabase;

    protected $tags;

    public function setUp()
    {
        parent::setUp();

        createLoggedInUser();

        $this->tags = create('Astral\Models\Tag', ['user_id' => auth()->id()], 5);
    }

    /** @test */
    public function it_can_fetch_a_users_tags()
    {
        $this->getJson('/api/tags')
            ->assertStatus(200)
            ->assertJson($this->tags->toArray());
    }

    /** @test */
    public function a_user_can_add_a_new_tag()
    {
        $response = $this->postJson('/api/tags', ['name' => 'Laravel'])
            ->assertStatus(200)
            ->assertJson(['name' => 'Laravel']);
    }

    /** @test */
    public function a_tag_must_include_a_name()
    {
        $this->postJson('/api/tags', ['name' => ''])->assertStatus(422);

    }
}
