<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UnstarsGitHubStarsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_user_unstars_through_github_before_local_state_is_removed()
    {
        $this->login();
        $user = auth()->user();
        $user->access_token = encrypt('synthetic-token');
        $user->scope = 'public_repo';
        $user->save();

        $databaseId = 12345;
        $nodeId = 'synthetic-repo-node-id';
        $star = create('Astral\\Models\\Star', ['repo_id' => $databaseId, 'user_id' => $user->id]);
        Cache::put($user->starsCacheKey(), [
            'edges' => [['node' => ['databaseId' => $databaseId, 'id' => $nodeId]]],
            'pageInfo' => ['endCursor' => 'synthetic-cursor', 'hasNextPage' => false],
            'totalCount' => 1,
        ], 7200);

        Http::fake([
            'https://api.github.com/graphql' => Http::response([
                'data' => ['removeStar' => ['starrable' => ['id' => $nodeId]]],
            ], 200),
        ]);

        $this->deleteJson('/api/stars/github/unstar', [
            'databaseId' => $databaseId,
            'nodeId' => $nodeId,
        ])->assertOk();

        Http::assertSent(function (HttpRequest $request) use ($nodeId) {
            return $request->url() === 'https://api.github.com/graphql'
                && $request->method() === 'POST'
                && $request['variables'] === ['starrableId' => $nodeId]
                && str_contains($request['query'], 'mutation UnstarStar($starrableId: ID!)');
        });

        $this->assertDatabaseMissing('stars', ['id' => $star->id]);
        $this->assertFalse(Cache::has($user->starsCacheKey()));
    }

    /** @test */
    public function a_github_graphql_error_does_not_remove_local_state()
    {
        $this->login();
        $user = auth()->user();
        $user->access_token = encrypt('synthetic-token');
        $user->save();

        $databaseId = 12345;
        $nodeId = 'synthetic-repo-node-id';
        $star = create('Astral\\Models\\Star', ['repo_id' => $databaseId, 'user_id' => $user->id]);
        $cachedStars = [
            'edges' => [['node' => ['databaseId' => $databaseId, 'id' => $nodeId]]],
            'pageInfo' => ['endCursor' => 'synthetic-cursor', 'hasNextPage' => false],
            'totalCount' => 1,
        ];
        Cache::put($user->starsCacheKey(), $cachedStars, 7200);

        Http::fake([
            'https://api.github.com/graphql' => Http::response([
                'errors' => [['message' => 'synthetic rejection']],
            ], 200),
        ]);

        $this->deleteJson('/api/stars/github/unstar', [
            'databaseId' => $databaseId,
            'nodeId' => $nodeId,
        ])->assertServerError();

        $this->assertDatabaseHas('stars', ['id' => $star->id]);
        $this->assertSame($cachedStars, Cache::get($user->starsCacheKey()));
    }
}
