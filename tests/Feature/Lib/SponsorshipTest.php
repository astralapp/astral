<?php

declare(strict_types=1);

use App\Lib\Sponsorship;
use App\Models\User;
use Github\Api\GraphQL;
use Github\Client;
use GrahamCampbell\GitHub\Facades\GitHub;
use GrahamCampbell\GitHub\GitHubFactory;

it('verifies sponsorship with GraphQL variables, not interpolation', function () {
    config(['app.github_sponsoree_login' => 'astralapp']);

    $user = User::factory()->create(['username' => 'octocat']);

    $graphql = Mockery::mock(GraphQL::class);
    $graphql->shouldReceive('execute')
        ->once()
        ->withArgs(function (string $query, array $variables) {
            expect($query)
                ->toContain('$sponsoree')
                ->toContain('$sponsor')
                ->not->toContain('octocat')
                ->not->toContain('astralapp');

            return $variables === ['sponsoree' => 'astralapp', 'sponsor' => 'octocat'];
        })
        ->andReturn(['data' => ['user' => ['isSponsoredBy' => true]]]);

    $client = Mockery::mock(Client::class);
    $client->shouldReceive('api')->with('graphql')->andReturn($graphql);

    $factory = Mockery::mock(GitHubFactory::class);
    $factory->shouldReceive('make')->andReturn($client);

    GitHub::shouldReceive('getFactory')->andReturn($factory);

    app(Sponsorship::class)->updateUserSponsorshipStatus($user);

    expect($user->fresh()->is_sponsor)->not->toBeNull();
});
