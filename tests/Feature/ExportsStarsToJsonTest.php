<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportsStarsToJsonTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function it_can_export_users_stars_to_json()
    {
        $tag = create('Astral\Models\Tag', ['user_id' => auth()->id()]);
        $star = create('Astral\Models\Star', ['user_id' => auth()->id()]);
        $star->tags()->attach($tag);
        auth()->user()->stars = [$star];

        $response = $this->getJson('/api/stars/export')
            ->assertStatus(200);
        $path = storage_path('app/public/'.auth()->user()->username.'_astral_data.json');
        $fileOutput = file_get_contents($path);

        $this->assertTrue($fileOutput === auth()->user()->stars()->with('tags')->get()->reverse()->toJson());

        unlink($path);
    }
}
