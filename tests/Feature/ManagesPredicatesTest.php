<?php

namespace Tests\Feature;

use Tests\TestCase;
use Astral\Models\Predicate;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ManagesPredicatesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->login();
    }

    /** @test */
    public function a_user_can_create_a_new_predicate()
    {
        $predicate = make(Predicate::class, ['user_id' => auth()->id()]);
        $response = $this->postJson('/api/predicates', $predicate->toArray());
        $response->assertStatus(201)
        ->assertJson($predicate->toArray());


        $this->assertDatabaseHas('predicates', ['name' => $predicate->name]);

    }

    /** @test */
    public function a_predicate_requires_a_valid_name()
    {
        $predicateA = make(Predicate::class, ['user_id' => auth()->id(), 'name' => null]);
        $predicateB = make(Predicate::class, ['user_id' => auth()->id()]);
        $predicateC = make(Predicate::class, ['user_id' => auth()->id(), 'body' => null]);

        // Try and create predicate with empty name
        $this->postJson('/api/predicates', $predicateA->toArray())->assertStatus(422);

        // Create valid predicate
        $this->postJson('/api/predicates', $predicateB->toArray());

        // Try and create predicate with duplicate name
        $this->postJson('/api/predicates', $predicateB->toArray())->assertStatus(422);

        // Try and create predicate with empty body
        $this->postJson('/api/predicates', $predicateC->toArray())->assertStatus(422);

    }
}
