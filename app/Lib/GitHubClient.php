<?php

namespace Astral\Lib;

use Astral\Exceptions\InvalidAccessTokenException;
use Zttp\Zttp;

class GitHubClient
{
    protected $endpoint;

    public function __construct()
    {
        $this->endpoint = 'https://api.github.com/graphql';
    }

    public function fetchStars($cursor = null, $perPage = 100)
    {
        $token = decrypt(auth()->user()->access_token);
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
                isArchived
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
                releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                    edges{
                        node {
                            tagName
                        }
                    }
                }
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
            'Authorization' => "Bearer {$token}",
            'Content-Type'  => 'application/json',
        ])->post($this->endpoint, [
            'query'     => $query,
            'variables' => '',
        ]);

        if ($response->getStatusCode() == 401) {
            throw new InvalidAccessTokenException();
        }

        if (!array_key_exists('data', $response->json())) {
            info('Stars fetch failed.', ['response' => $response->json()]);
        }

        return $response->json()['data']['viewer']['starredRepositories'];
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
        $response = Zttp::withHeaders([
            'Authorization' => "Bearer {$token}",
            'Content-Type'  => 'application/json',
        ])->post($this->endpoint, [
            'query'     => $query,
            'variables' => '',
        ]);

        if ($response->getStatusCode() == 401) {
            throw new InvalidAccessTokenException();
        }

        return $response->json()['data'];
    }

    public function fetchReadme($repo)
    {
        $token = decrypt(auth()->user()->access_token);
        $url = "https://api.github.com/repos/{$repo}/readme?access_token={$token}";
        $response = Zttp::accept('application/vnd.github.v3.html')->get($url);

        if ($response->getStatusCode() == 401) {
            throw new InvalidAccessTokenException();
        }

        return $response->body();
    }

    public function revokeApplicationGrant()
    {
        $token = decrypt(auth()->user()->access_token);
        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');

        $response = Zttp::withBasicAuth($clientId, $clientSecret)->delete("https://api.github.com/applications/{$clientId}/grants/{$token}");

        if ($response->getStatusCode() == 404) {
            throw new InvalidAccessTokenException();
        }

        return true;
    }
}
