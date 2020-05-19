<?php

namespace Astral\Lib;

use Astral\Exceptions\InvalidAccessTokenException;
use Illuminate\Support\Facades\Http;

class GitHubClient
{
    protected $endpoint;

    public function __construct()
    {
        $this->endpoint = 'https://api.github.com/graphql';
    }

    public function revokeApplicationGrant()
    {
        $token = auth()->user()->access_token;
        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');

        $response = Http::withBasicAuth($clientId, $clientSecret)->delete("https://api.github.com/applications/{$clientId}/grants/{$token}");

        if ($response->getStatusCode() == 404) {
            auth()->user()->update(['access_token' => null]);
            throw new InvalidAccessTokenException();
        }

        return true;
    }
}
