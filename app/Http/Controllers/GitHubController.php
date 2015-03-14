<?php

class GitHubController extends BaseController {
  public function stars() {
    $page = Input::get('page');
    if(empty( $page )) {
      $page = 1;
    }
    $gh = OAuth::consumer( 'GitHub');
    $req = $gh->request( '/user/starred?per_page=50&page='.$page );
    $stars = json_decode( $req, true );
    if( $page == 1 ){
      $headers = $req->getHeaders();
      $paginationIndex = 1;
      for($i = 0; $i <= count($headers) - 1; $i++){
        $e = explode(":", $headers[$i]);
        if( strtolower($e[0]) == "link" ){
          $paginationIndex = $i;
          break;
        }
      }
      $paginationHeader = $headers[$paginationIndex];
      try {
        $linkArray = Helpers::http_rels($paginationHeader);
        $lastRel = $linkArray["last"][0];
        $urlParts = parse_url($lastRel);
        $queryString = $urlParts["query"];
        $qsArray = array();
        parse_str($queryString, $qsArray);
        $pageCount = (int)$qsArray["page"];
      }
      catch(Exception $e){
        $pageCount = 1;
      }
      $stars = array_merge($stars, ["page_count" => $pageCount]);
    }

    return Response::json($stars, 200);
  }

  public function readme($owner, $repo) {
    $gh = OAuth::consumer( 'GitHub');
    $req = '/repos/'.$owner.'/'.$repo.'/readme';
    $res = json_decode( $gh->request( $req ), true );
    $readme = ['readme' => Markdown::parse( imap_base64($res['content']) )];
    return Response::json($readme, 200);
  }

  public function unstar(){
    $star = Input::all();
    $repoOwner = $star['owner']['login'];
    $repoName = $star['name'];

    $userStar = Star::where('repo_id', $star['id'])->where('user_id', Auth::user()->id)->first();
    if( !is_null($userStar) ){
      $userStar->delete();
    }
    $gh = OAuth::consumer( 'GitHub');
    $reqString = '/user/starred/'.$repoOwner.'/'.$repoName;
    $req = $gh->request( $reqString, 'DELETE', null, []);
    return Star::where('user_id', Auth::user()->id)->get();
  }
}