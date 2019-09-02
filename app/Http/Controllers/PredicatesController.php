<?php

namespace Astral\Http\Controllers;

use Astral\Models\Predicate;
use Illuminate\Http\Request;

class PredicatesController extends Controller
{
    public function index()
    {
        return auth()->user()->predicates()->get();
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'bail|required|unique:predicates,name,NULL,id,user_id,'.auth()->id(),
            'body' => 'required',
        ]);

        return auth()->user()->predicates()->create($request->only('name', 'body'));
    }

    public function update(Request $request)
    {
        $predicate = auth()->user()->predicates()->findOrFail($request->input('id'));

        $this->validate($request, [
            'name' => 'bail|required|unique:predicates,name,'.$predicate->id.',id,user_id,'.auth()->id(),
            'body' => 'required',
        ]);

        $predicate->update([
            'name' => $request->input('name'),
            'body' => $request->input('body'),
        ]);

        return $predicate;
    }

    public function destroy(Request $request, Predicate $predicate)
    {
        auth()->user()->predicates()->findOrFail($predicate->id)->delete();

        return response()->json([], 204);
    }
}
