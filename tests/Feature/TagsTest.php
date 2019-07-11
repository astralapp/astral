<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagsTest extends TestCase
{
    use RefreshDatabase;

    protected $tags;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();

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
            ->assertStatus(201)
            ->assertJson(['name' => 'Laravel']);
    }

    /** @test */
    public function a_new_tag_must_include_a_name()
    {
        $this->postJson('/api/tags', ['name' => ''])->assertStatus(422);
    }

    /** @test */
    public function tag_names_must_be_unique_per_user()
    {
        $this->postJson('/api/tags', ['name' => $this->tags[1]->name])->assertStatus(422);

        $this->patchJson("/api/tags/{$this->tags[0]->id}", [
            'name' => $this->tags[2]->name,
        ])->assertStatus(422);
    }

    /** @test */
    public function tag_name_unique_rule_ignores_the_tag_being_updated()
    {
        $this->patchJson("/api/tags/{$this->tags[0]->id}", [
            'name' => strtolower($this->tags[0]->name),
        ])->assertStatus(200);
    }

    /** @test */
    public function tags_can_be_reordered()
    {
        // Shuffle the tags
        $i = 0;
        $tags = $this->tags->shuffle()->map(function ($tag) use (&$i) {
            $tag->sort_order = $i;
            $i++;

            return [
                'name'       => $tag->name,
                'id'         => $tag->id,
                'sort_order' => $tag->sort_order,
            ];
        })->toArray();

        $this->putJson('/api/tags/reorder', ['tags' => $tags])
            ->assertJson($tags)
            ->assertStatus(200);
    }

    /** @test */
    public function reordering_tags_requires_an_id()
    {
        $tags = $this->tags->map(function ($tag) {
            $tag->id = null;

            return $tag;
        })->toArray();

        $this->putJson('/api/tags/reorder', ['tags' => $tags])->assertStatus(422);
    }

    /** @test */
    public function ids_passed_for_reordering_must_exist_in_the_db()
    {
        $tags = $this->tags->map(function ($tag) {
            $tag->id = 1337;

            return $tag;
        })->toArray();

        $this->putJson('/api/tags/reorder', ['tags' => $tags])->assertStatus(422);
    }

    /** @test */
    public function reordering_tags_requires_a_sort_order()
    {
        $tags = $this->tags->map(function ($tag) {
            $tag->sort_order = null;

            return $tag;
        })->toArray();

        $this->putJson('/api/tags/reorder', ['tags' => $tags])->assertStatus(422);
    }

    /** @test */
    public function a_user_can_delete_their_tags()
    {
        $id = auth()->user()->tags()->first()->id;

        $this->deleteJson("/api/tags/{$id}")->assertStatus(204);
        $this->assertNull(auth()->user()->tags()->find($id));
    }

    /** @test */
    public function a_user_can_rename_their_tags()
    {
        $this->withExceptionHandling();

        $tag = auth()->user()->tags()->first();
        $id = $tag->id;

        $req = $this->patchJson("/api/tags/{$id}", [
            'name' => 'New Tag',
        ])->assertStatus(200)
            ->assertJson([
                'id'   => $id,
                'name' => 'New Tag',
            ]);
        $this->assertEquals('New Tag', $tag->fresh()->name);
    }
}
