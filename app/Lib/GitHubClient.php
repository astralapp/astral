<?php

namespace Astral\Lib;

use Astral\Exceptions\InvalidAccessTokenException;
use Zttp\Zttp;

class GitHubClient
{
    protected $endpoint;
    protected $token;

    public function __construct($token)
    {
        $this->endpoint = 'https://api.github.com/graphql';
        $this->token = $token;
    }

    public function fetchStars($cursor = null, $perPage = 100)
    {
        $cursorString = $cursor ? 'after:"'.$cursor.'"' : 'after: null';
        $query = <<<GQL
    query {
        viewer {
        starredRepositories(first: {$perPage}, orderBy: {field: STARRED_AT, direction: DESC},  {$cursorString}) {
            totalCount
            edges {
            node {
                id
                nameWithOwner
                description
                url
                databaseId
                defaultBranchRef {
                name
          	    }
                primaryLanguage {
                name
                }
                stargazers {
                totalCount
                }
                forkCount,
                repositoryTopics(first: 5) {
                edges {
                    node {
                    topic {
                        name
                    }
                    }
                }
                }
            }
            cursor
            }
            pageInfo {
            endCursor
            hasNextPage
            }
        }
        }
    }
GQL;

        $response = Zttp::withHeaders([
            'Authorization' => 'Bearer '.$this->token,
            'Content-Type'  => 'application/json',
        ])->post($this->endpoint, [
            'query'     => $query,
            'variables' => '',
        ]);

        if ($response->getStatusCode() == 401) {
            throw new InvalidAccessTokenException();
        }

        return $response->json()['data']['viewer']['starredRepositories'];
    }

    public function revokeApplicationGrant()
    {
        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');

        $response = Zttp::withBasicAuth($clientId, $clientSecret)->delete("https://api.github.com/applications/{$clientId}/grants/{$this->token}");

        if ($response->getStatusCode() == 404) {
            throw new InvalidAccessTokenException();
        }

        return true;
    }
}
