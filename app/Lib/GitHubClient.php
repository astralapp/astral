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

    public function fetchStars($cursor = null, $perPage = 100)
    {
        $token = auth()->user()->access_token;
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
                pushedAt
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

        $response = Http::withToken($token)->post($this->endpoint, [
            'query'     => $query,
            'variables' => '',
        ]);

        if ($response->getStatusCode() == 401) {
            auth()->user()->update(['access_token' => null]);

            throw new InvalidAccessTokenException();
        }

        if (!array_key_exists('data', $response->json())) {
            info('Stars fetch failed.', ['response' => $response->json()]);
        }

        return $response->json()['data']['viewer']['starredRepositories'];
    }

    public function unstarStar($nodeId)
    {
        $token = auth()->user()->access_token;
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
            auth()->user()->update(['access_token' => null]);

            throw new InvalidAccessTokenException();
        }

        return $response->json()['data'];
    }

    public function fetchReadme($repo)
    {
        $token = auth()->user()->access_token;
        $url = "https://api.github.com/repos/{$repo}/readme";
        $response = Http::accept('application/vnd.github.v3.html')->withToken($token)->get($url);

        if ($response->getStatusCode() == 401) {
            auth()->user()->update(['access_token' => null]);

            throw new InvalidAccessTokenException();
        }

        return $response->body();
    }

    public function revokeApplicationGrant()
    {
        $token = auth()->user()->access_token;
        $clientId = config('services.github.client_id');
        $clientSecret = config('services.github.client_secret');

        $response = Http::withBasicAuth($clientId, $clientSecret)->delete("https://api.github.com/applications/{$clientId}/grant", ['access_token' => $token]);

        if ($response->getStatusCode() == 404) {
            auth()->user()->update(['access_token' => null]);

            throw new InvalidAccessTokenException();
        }

        return true;
    }
}
