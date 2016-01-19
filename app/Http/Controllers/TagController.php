<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Models\Tag;

use Auth;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct()
    {
      $this->middleware("jwt.auth");
    }

    public function index()
    {
        $tags = Tag::where( "user_id", Auth::id() )->orderBy('sort_order', 'asc')->get();
        return response()->json(compact('tags'), 200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
      $tag = Tag::create( $request->only("name", "description") );
      return response()->json(compact('tag'), 200);
    }

    public function reorder(Request $request){
      $sortMap = $request->only('sortMap')["sortMap"];
			foreach($sortMap as $row){
				$tag = Tag::find((int)$row["id"]);
				$tag->sort_order = $row["sort_order"];
				$tag->save();
			}
      $tags = Tag::where( "user_id", Auth::id() )->orderBy('sort_order', 'asc')->get();
      return response()->json(compact('tags'), 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
