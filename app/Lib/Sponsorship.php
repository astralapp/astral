<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\User;
use GrahamCampbell\GitHub\Facades\GitHub;

class Sponsorship
{
    public function updateUserSponsorshipStatus(User $user): void
    {
        $query = <<<'GRAPHQL'
        query ($sponsoree: String!, $sponsor: String!) {
          user(login: $sponsoree) {
            isSponsoredBy(accountLogin: $sponsor)
          }
        }
        GRAPHQL;

        $client = GitHub::getFactory()->make([
            'token' => $user->access_token,
            'method' => 'token',
        ]);

        $result = $client->api('graphql')->execute($query, [
            'sponsoree' => config('app.github_sponsoree_login'),
            'sponsor' => $user->username,
        ]);

        $user->setSponsorshipStatus((bool) $result['data']['user']['isSponsoredBy']);
    }
}
