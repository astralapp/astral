<?php

namespace Astral\Http\Controllers;

use Illuminate\Http\Request;

class PredicatesSortOrderController extends Controller
{
    public function update(Request $request)
    {
        $predicates = $request->input('predicates');

        $this->validate($request, [
            'predicates'              => 'required|array',
            'predicates.*.id'         => 'required|integer|exists:predicates,id',
            'predicates.*.sort_order' => 'required|integer',
        ]);

        foreach ($predicates as $predicate) {
            $userPredicate = auth()->user()->predicates()->find($predicate['id']);
            $userPredicate->sort_order = $predicate['sort_order'];
            $userPredicate->save();
        }

        return auth()->user()->predicates()->get();
    }
}
