<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetsUserSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function it_can_set_the_show_language_tags_setting()
    {
        $this->putJson('/api/user/show-language-tags', ['show' => false])->assertStatus(200);
        $this->assertEquals(false, auth()->user()->show_language_tags);

        $this->putJson('/api/user/show-language-tags', ['show' => true])->assertStatus(200);
        $this->assertEquals(true, auth()->user()->show_language_tags);
    }
}
