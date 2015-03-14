<?php

class TagController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$query = Input::get('query');
		if(empty($query)){
			return Tag::with('stars.tags')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
		}
		else {
			// We're probz fetching tags for the tag input autocomplete
			$tagList = Tag::where('user_id', Auth::user()->id)->where('name', 'LIKE', '%'.$query.'%')->orderBy('sort_order', 'asc')->get();
			if(!is_null($tagList)){
				return $tagList;
			}
		}
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
		$tag = new Tag();
		if($tag->save()){
			return $tag;
		}
	}

	/**
	 * Reorder the resources.
	 *
	 * @return Response
	 */
	public function reorder() {
		$sortHash = Input::get('sortHash');
		for($row = 0; $row < count($sortHash); $row++){
			foreach($sortHash[$row] as $key => $value){
				$tag = Tag::find((int)$key);
				$tag->sort_order = (int)$value;
				$tag->save();
			}
		}
		return Tag::with('stars')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return Tag::find($id);
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
		$t = Input::all();
		$tag = Tag::where('id', $id)->where('user_id', Auth::user()->id)->first();
		$tag->name = $t['name'];
		$tag->save();
		return Tag::with('stars.tags')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		Tag::where('id', $id)->where('user_id', Auth::user()->id)->delete();
		return Tag::with('stars.tags')->where('user_id', Auth::user()->id)->orderBy('sort_order', 'asc')->get();
	}

}