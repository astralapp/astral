<?php

namespace Tests\Feature;

use Astral\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use JWTAuth;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class AuthenticatesUsersTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown()
    {
        Mockery::close();

        parent::tearDown();
    }

    /** @test */
    public function it_redirects_to_github()
    {
        $response = $this->get('/auth/github');

        $this->assertContains('github.com/login/oauth', $response->getTargetUrl());
    }

    /** @test */
    public function it_receives_the_github_response_and_creates_a_new_user()
    {
        $this->mockSocialiteFacade();

        JWTAuth::shouldReceive('fromUser')->withAnyArgs()->andReturn('12345');

        $response = $this->get('/auth/github/callback');

        $user = User::first();
        $token = JWTAuth::fromUser($user);
        $expiry = auth()->factory()->getTTL() * 60;

        $githubUser = Socialite::driver('github')->user();

        $this->assertEquals($githubUser->getNickname(), $user->username);

        $response->assertRedirect("/auth?token={$token}&token_expiry={$expiry}");
    }

    public function mockSocialiteFacade()
    {
        $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')
            ->andReturn(1234567890)
            ->shouldReceive('getNickname')
            ->andReturn('JaneDoe')
            ->shouldReceive('getName')
            ->andReturn('Jane Doe')
            ->shouldReceive('getAvatar')
            ->andReturn('https://en.gravatar.com/userimage');
        $abstractUser->token = 'abcde12345';

        $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andReturn($abstractUser);

        Socialite::shouldReceive('driver')->with('github')->andReturn($provider);
    }

    /** @test */
    public function it_can_fetch_the_currently_authenticated_user()
    {
        $this->login();

        $this->getJson('/api/auth/me')
            ->assertStatus(200)
            ->assertJson(auth()->user()->toArray());
    }

    /** @test */
    public function it_can_fetch_a_refresh_token()
    {
        $this->login();

        $this->getJson('/api/auth/refresh')
            ->assertStatus(200)
            ->assertJsonStructure(['access_token', 'token_type', 'expires_in']);
    }

    /** @test */
    public function a_user_can_logout()
    {
        $this->login();

        $this->assertAuthenticated();

        $this->getJson('/api/auth/logout')
            ->assertStatus(205);

        $this->assertGuest();
    }

    /** @test */
    public function a_user_can_be_removed()
    {
        $this->login();
        $this->assertAuthenticated();

        $id = auth()->user()->id;
        create('Astral\Models\Tag', ['user_id' => $id], 5);
        create('Astral\Models\Star', ['user_id' => $id], 5);

        $response = $this->deleteJson('/api/auth/delete', ['id' => $id])
                        ->assertStatus(204);

        $this->assertDatabaseMissing('users', ['id' => $id]);
        $this->assertDatabaseMissing('tags', ['user_id' => $id]);
        $this->assertDatabaseMissing('stars', ['user_id' => $id]);
    }
}
