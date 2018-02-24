<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FetchesStarsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();

        createLoggedInUser();
    }

    /** @test */
    public function it_can_fetch_the_users_persisted_stars()
    {
        $this->getJson('/api/stars')
            ->assertStatus(200)
            ->assertJson(auth()->user()->stars->toArray());
    }
}
