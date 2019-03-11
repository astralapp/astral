<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FetchesStarsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function it_can_fetch_the_users_persisted_stars()
    {
        $this->getJson('/api/stars')
            ->assertStatus(200)
            ->assertJson(auth()->user()->stars->toArray());
    }
}
