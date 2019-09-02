<?php

namespace Tests\Feature;

use Astral\Models\Predicate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

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

    /** @test */
    public function predicates_can_be_reordered()
    {
        $predicates = create(Predicate::class, ['user_id' => auth()->id()], 4);
        $i = 0;
        $shuffledPredicates = $predicates->shuffle()->map(function ($predicate) use (&$i) {
            $predicate->sort_order = $i;
            $i++;

            return [
                'name'       => $predicate->name,
                'id'         => $predicate->id,
                'sort_order' => $predicate->sort_order,
            ];
        })->toArray();

        $this->putJson('/api/predicates/reorder', ['predicates' => $shuffledPredicates])
            ->assertJson($shuffledPredicates)
            ->assertStatus(200);
    }

    /** @test */
    public function reordering_predicates_requires_an_id()
    {
        $predicates = create(Predicate::class, ['user_id' => auth()->id()], 4);

        $predicatesWithoutIds = $predicates->map(function ($predicate) {
            $predicate->id = null;

            return $predicate;
        })->toArray();

        $this->putJson('/api/predicates/reorder', ['predicates' => $predicates])->assertStatus(422);
    }

    /** @test */
    public function ids_passed_for_reordering_must_exist_in_the_db()
    {
        $predicates = create(Predicate::class, ['user_id' => auth()->id()], 4);

        $invalidPredicates = $predicates->map(function ($predicate) {
            $predicate->id = 1337;

            return $predicate;
        })->toArray();

        $this->putJson('/api/predicates/reorder', ['predicates' => $invalidPredicates])->assertStatus(422);
    }

    /** @test */
    public function reordering_tags_requires_a_sort_order()
    {
        $predicates = create(Predicate::class, ['user_id' => auth()->id()], 4);

        $invalidPredicates = $predicates->map(function ($predicate) {
            $predicate->sort_order = null;

            return $predicate;
        })->toArray();

        $this->putJson('/api/predicates/reorder', ['predicates' => $invalidPredicates])->assertStatus(422);
    }

    /** @test */
    public function a_user_can_delete_their_predicates()
    {
        $predicate = create(Predicate::class, ['user_id' => auth()->id()]);

        $id = $predicate->id;

        $this->deleteJson("/api/predicates/{$id}")->assertStatus(204);
        $this->assertNull(auth()->user()->predicates()->find($id));
    }
}
