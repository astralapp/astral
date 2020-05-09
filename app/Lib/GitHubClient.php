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

    public function unstarStar($nodeId)
    {
        $token = decrypt(auth()->user()->access_token);
        $query = <<<GQL
    mutation UnstarStar {
        removeStar(input:{starrableId:"{$nodeId}"}) {
            starrable {
                id
            }
        }
    }
GQL;
        $response = Http::withToken($token)->post($this->endpoint, [
            'query'     => $query,
            'variables' => '',
        ]);

        if ($response->getStatusCode() == 401) {
            throw new InvalidAccessTokenException();
        }

        return $response->json()['data'];
    }

    public function revokeApplicationGrant()
    {
        $token = auth()->user()->access_token;
        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');

        $response = Http::withBasicAuth($clientId, $clientSecret)->delete("https://api.github.com/applications/{$clientId}/grants/{$token}");

        if ($response->getStatusCode() == 404) {
            throw new InvalidAccessTokenException();
        }

        return true;
    }
}
