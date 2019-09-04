<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetsUserSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function it_can_set_the_show_language_tags_setting()
    {
        $this->putJson('/api/user/show-language-tags', ['flag' => false])->assertStatus(201);
        $this->assertEquals(false, auth()->user()->show_language_tags);

        $this->putJson('/api/user/show-language-tags', ['flag' => true])->assertStatus(201);
        $this->assertEquals(true, auth()->user()->show_language_tags);
    }

    /** @test */
    public function it_can_set_the_autosave_notes_setting()
    {
        $this->putJson('/api/user/autosave-notes', ['flag' => false])->assertStatus(201);
        $this->assertEquals(false, auth()->user()->autosave_notes);

        $this->putJson('/api/user/autosave-notes', ['flag' => true])->assertStatus(201);
        $this->assertEquals(true, auth()->user()->autosave_notes);
    }
}
