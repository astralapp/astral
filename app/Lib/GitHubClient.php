<?php
namespace Astral\Lib;

use Zttp\Zttp;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class GitHubClient
{
  protected $endpoint;
  protected $token;

  public function __construct($token)
  {
    $this->endpoint = 'https://api.github.com/graphql';
    $this->token = $token;
  }

  public function fetchStars($cursor = null)
  {
    $cursorString = $cursor ? 'after:"' . $cursor . '"' : 'after: null';
    $query = <<<GQL
    query {
      viewer {
        starredRepositories(first: 100, orderBy: {field: STARRED_AT, direction: DESC},  {$cursorString}) {
          totalCount
          edges {
            node {
              id
              nameWithOwner
              description
              databaseId
              primaryLanguage {
                name
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

    return Zttp::withHeaders([
      'Authorization' => 'Bearer ' . $this->token,
      'Content-Type' => 'application/json',
    ])->post($this->endpoint, [
      'query' => $query,
      'variables' => '',
    ])->json()['data']['viewer']['starredRepositories'];
  }
}