<?php

namespace Astral\Http\Controllers;

use Astral\Models\Star;
use Illuminate\Http\Request;

class StarNotesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function store(Request $request)
    {
        $id = $request->input('id');
        $notes = $request->input('notes');
        $star = auth()->user()->stars()->withRepoId($id)->first();

        if (!$star) {
            $star = new Star();
            $star->repo_id = $id;
            $star->user_id = auth()->id();
        }

        $star->notes = $notes;
        $star->save();

        return $star;
    }
}
