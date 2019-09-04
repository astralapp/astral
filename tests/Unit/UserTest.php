<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Stubs\GitHubUser;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = create('Astral\Models\User', ['access_token' => null]);
    }

    /** @test */
    public function it_has_associated_stars()
    {
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $this->user->stars);
    }

    /** @test */
    public function it_has_associated_tags()
    {
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $this->user->tags);
    }

    /** @test */
    public function it_can_map_a_github_user_object()
    {
        $githubUser = new GitHubUser();

        $this->user->mapGitHubUserData($githubUser);

        $this->assertEquals(
            $githubUser->getNickname(),
            $this->user->username
        );

        $this->assertEquals(
            $githubUser->getId(),
            $this->user->github_id
        );

        $this->assertEquals(
            $githubUser->getName(),
            $this->user->name
        );

        $this->assertEquals(
            $githubUser->getAvatar(),
            $this->user->avatar_url
        );
    }

    /** @test */
    public function it_can_set_the_show_language_tags_setting()
    {
        $this->user->setShowLanguageTags(false);
        $this->assertEquals(false, $this->user->show_language_tags);

        $this->user->setShowLanguageTags(true);
        $this->assertEquals(true, $this->user->show_language_tags);
    }

    /** @test */
    public function it_can_fetch_the_user_specific_cache_key_for_stars()
    {
        $id = $this->user->id;

        $this->assertEquals(
            "user_{$id}.github_stars",
            $this->user->starsCacheKey()
        );
    }
}
