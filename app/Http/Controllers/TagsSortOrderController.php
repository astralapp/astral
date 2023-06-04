<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TagsSortOrderController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->validate($request, [
            'tags'              => 'required|array',
            'tags.*.id'         => 'required|integer|exists:tags,id',
            'tags.*.sort_order' => 'required|integer',
        ]);

        $tags = $request->input('tags');

        collect($tags)->each(function ($tag) {
            auth()->user()->tags()->find($tag['id'])->update(['sort_order' => $tag['sort_order']]);
        });

        return redirect()->route('dashboard.index');
    }
}
