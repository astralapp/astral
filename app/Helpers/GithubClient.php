<?php

use GuzzleHttp\ClientInterface;
use Cache;

class GithubClient
{

  private static $starsCacheExpiry = 30; //minutes
  private static $starsPerPage = 50;

  public static function getStars($page = 1)
  {
    $cacheKey = self::starsCacheKey();
    $cacheExpiry = self::$starsCacheExpiry;
    $starsArray = [];

    if($page == 1){
      // Theyre doing a fresh fetch so check to see if we've cached our stars already
      if( Cache::has($cacheKey) ){
        // Get everything currently cached
        $cachedStars = Cache::get($cacheKey);
        $uniqueStars = array_map("unserialize", array_unique(array_map("serialize", $cachedStars['stars'])));
        $cachedStars['stars'] = $uniqueStars;
        // Add a "cached" key so we can check on the front-end whether we should paginate or not. We set it to the number of pages currently cached, so we fetch only what we need in subsequent reqeusts
        $cachedPages = count($cachedStars['stars']);
        $cachedStars['cached'] = (int)ceil($cachedPages / self::$starsPerPage);
        return $cachedStars;
      }
    }

    $token = self::getAccessToken();
    $starsUrl = 'https://api.github.com/user/starred?per_page='.self::$starsPerPage.'&page='.$page.'&access_token='.$token;
    $client = self::getClient();
    $res = $client->get(
        $starsUrl,
        []
    );
    $stars = json_decode($res->getBody(), true);
    $starsArray['stars'] = $stars;
    if ($page == 1) {
      $headerLink = $res->getHeader('link')[0];
      $pageCount = self::getTotalPages($headerLink);
      $starsArray['page_count'] = $pageCount;
      Cache::put($cacheKey, $starsArray, $cacheExpiry);
      return $starsArray;
    }
    else {
      $cachedStars = Cache::get($cacheKey);
      // Merge the new stars into the old ones
      $oldStars = $cachedStars['stars'];
      $newStars = $starsArray['stars'];
      $mergedStars = array_merge($oldStars, $newStars);
      $uniqueStars = array_map("unserialize", array_unique(array_map("serialize", $mergedStars)));
      // Add stars to the stars key
      $mergedStarsArray['stars'] = $uniqueStars;
      $mergedStarsArray['page_count'] = $cachedStars['page_count'];
      Cache::put($cacheKey, $mergedStarsArray, $cacheExpiry);
      return $mergedStarsArray;
    }

  }

  public static function getReadme($owner, $repo)
  {
    $token = self::getAccessToken();
    $readmeUrl = 'https://api.github.com/repos/'.$owner.'/'.$repo.'/readme?access_token='.$token;
    $client = self::getClient();
    $res = $client->get(
        $readmeUrl,
        []
    );
    $readmeHash = json_decode( $res->getBody(), true );
    $readme = ['readme' => \Markdown::convertToHtml( imap_base64($readmeHash['content']) )];
    return $readme;
  }

  private static function starsCacheKey()
  {
    return 'user_'.\Auth::user()->id.'.github_stars';
  }

  private static function getAccessToken()
  {
    return session('access_token');
  }

  private static function getTotalPages($link)
  {
    try {
      $linkArray = \HTTPHeadersHelper::rels($link);
      $lastRel = $linkArray["last"][0];
      $urlParts = parse_url($lastRel);
      $queryString = $urlParts["query"];
      $qsArray = array();
      parse_str($queryString, $qsArray);
      return (int)$qsArray["page"];
    }
    catch(Exception $e){
      return 1;
    }
  }

  private static function getClient()
  {
    return new \GuzzleHttp\Client;
  }
}
