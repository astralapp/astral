<?php

namespace App\Lib;

use App\Models\User;
use GitHub;

class Sponsorship
{
    public function __construct(public User $user)
    {
    }

    public function updateUserSponsorshipStatus()
    {
        throw_unless($this->user);

        $query = '{user(login: "syropian") { isSponsoredBy(accountLogin: "'.$this->user->username.'") }}';

        $client = GitHub::getFactory()->make([
            'token' => $this->user->access_token,
            'method' => 'token',
        ]);

        $result = $client->api('graphql')->execute($query);

        $this->user->setSponsorshipStatus((bool) $result['data']['user']['isSponsoredBy']);
    }
}
