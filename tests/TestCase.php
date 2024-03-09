<?php

declare(strict_types=1);

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        Http::preventStrayRequests();
    }

    protected function login(User $user = null)
    {
        $user ??= User::factory()->create()->first();

        $this->actingAs($user);

        return $this;
    }
}
