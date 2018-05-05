<?php

namespace Tests\Feature;

use Astral\Models\Star;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddsNotesToStarTest extends TestCase
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
    public function notes_can_be_added_to_a_star()
    {
        $response = $this->postJson('/api/star/notes', [
            'id'    => $this->star->repo_id,
            'notes' => 'A fancy note.',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'repo_id' => $this->star->repo_id,
            'notes'    => 'A fancy note.',
        ]);

        $this->assertEquals('A fancy note.', $this->star->fresh()->notes);
    }

    /** @test */
    public function a_new_star_is_persisted_if_it_didnt_already_exist()
    {
        $this->assertCount(1, Star::all());

        $response = $this->postJson('/api/star/notes', [
            'id'    => 'abc123',
            'notes' => 'A fancy note.',
        ]);

        $this->assertCount(2, Star::all());
    }
}
