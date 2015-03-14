<?php

class StarController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		return Star::with('tags')->where('user_id', Auth::user()->id)->get();
	}


	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		//
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		//
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		//
	}


	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}

	public function autoTag() {
		$starsList = Input::all();
		if( count($starsList) > 0 ){
			foreach($starsList as $s){
				$star_id = $s['repo_id'];
				$star_name = $s['repo_name'];
		    $tag_id = $s['tag_id'];
		    $star = Star::where('repo_id', $star_id)->where('user_id', Auth::user()->id)->first();
		    if(!is_null($star)){
		      $star->tags()->sync([$tag_id], false);
		      $star->save();
		    }
		    else {
		      $star = new Star();
		      $star->repo_id = $star_id;
		      $star->repo_name = $star_name;
		      $star->save();
		      $star->tags()->attach($tag_id);
		    }
			}
		}
		return Star::with('tags')->where('user_id', Auth::user()->id)->get();
	}
	public function tag() {
		$star_id = Input::get('repo_id');
		$star_name = Input::get('repo_name');
    $tag_id = Input::get('tag_id');
    $star = Star::where('repo_id', $star_id)->where('user_id', Auth::user()->id)->first();
    if(!is_null($star)){
      $star->tags()->sync([$tag_id], false);
      $star->save();
    }
    else {
      $star = new Star();
      $star->repo_id = $star_id;
      $star->repo_name = $star_name;
      $star->save();
      $star->tags()->attach($tag_id);
    }
    return Tag::with('stars')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
	}

	public function syncTags() {
		$ghStar = Input::get('star');
		$starTags = Input::get('tags');
		$star = Star::where('repo_id', (int)$ghStar['id'])->where('user_id', Auth::user()->id)->first();
		if(is_null($star)) {
			$star = new Star();
      $star->repo_id = $ghStar['id'];
      $star->repo_name = $ghStar['name'];
      $star->save();
		}
		$tagIds = array();
		if( empty($starTags) ) {
			$star->tags()->sync(array());
		}
		else {
			foreach($starTags as $t){
				$tagName = strtolower($t['name']);
				$tag = Tag::where('name', $tagName)->where('user_id', Auth::user()->id)->first();
				if( is_null($tag) ){
					$tag = new Tag();
					$tag->name = $t['name'];
					$tag->save();
				}
				array_push($tagIds, $tag->id);
				$star->tags()->sync($tagIds);
			}
		}
		return Star::with('tags')->where('user_id', Auth::user()->id)->get();
	}

	public function getOccurencesOfTagForStar() {
		$stars = Input::get("stars");
		$tagList = array();
		foreach($stars as $repo){
			$commonTags = DB::table("star_tag")
					->select(DB::raw("tags.name, COUNT(tags.name) AS occurences"))
					->join("stars", "star_tag.star_id", "=", "stars.id")
					->join("tags", "star_tag.tag_id", "=", "tags.id")
					->where("stars.repo_id", $repo["id"])
					->groupBy("tags.name")
					->having("occurences", ">=", 5)
					->orderBy("occurences", "DESC")->lists("tag.name");
      if( count($commonTags) > 0 ){
      	array_push( $tagList, array("id" => $repo["id"], "name" => $repo["name"], "tags" => $commonTags ) );
    	}
		}

		if ( count($tagList) > 0 ) {
			foreach ($tagList as $tagMap) {
				$tagIdsToSync = array();
				$userStar = Star::with('tags')->where('user_id', Auth::user()->id)->where('repo_id', $tagMap["id"])->first();
				if( is_null($userStar) ) {
					$userStar = new Star();
					$userStar->repo_id = $tagMap["id"];
					$userStar->repo_name = $tagMap["name"];
					$userStar->save();
				}
				foreach($tagMap["tags"] as $tag) {
					$tagQuery = Tag::where('name', $tag)->where('user_id', Auth::user()->id)->first();
					if( is_null($tagQuery) ){
						$tagQuery = new Tag();
						$tagQuery->name = $tag;
						$tagQuery->save();
					}
					array_push($tagIdsToSync, $tagQuery->id);
				}
				$userStar->tags()->sync($tagIdsToSync, false);
			}
		}
		return Star::with('tags')->where('user_id', Auth::user()->id)->get();
	}


}
