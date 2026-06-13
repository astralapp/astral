<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\User;
use GitHub;

class Sponsorship
{
    public function updateUserSponsorshipStatus(User $user): void
    {
        $sponsoree = config('app.github_sponsoree_login');

        $query = '{user(login: "' . $sponsoree . '") { isSponsoredBy(accountLogin: "' . $user->username . '") }}';

        $client = GitHub::getFactory()->make([
            'token' => $user->access_token,
            'method' => 'token',
        ]);

        $result = $client->api('graphql')->execute($query);

        $user->setSponsorshipStatus((bool) $result['data']['user']['isSponsoredBy']);
    }
}
