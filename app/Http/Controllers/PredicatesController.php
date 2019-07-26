<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;

class PredicatesController extends Controller
{
    public function index()
    {
        return auth()->user()->predicates;
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'bail|required|unique:predicates,name,NULL,id,user_id,'.auth()->id(),
            'body' => 'required',
        ]);

        return auth()->user()->predicates()->create($request->only('name', 'body'));
    }
}
