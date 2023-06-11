<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SmartFiltersSortOrderController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->validate($request, [
            'smartFilters'              => 'required|array',
            'smartFilters.*.id'         => 'required|integer|exists:smart_filters,id',
            'smartFilters.*.sort_order' => 'required|integer',
        ]);

        $filters = $request->input('smartFilters');
        collect($filters)->each(function ($filter) {
            auth()->user()->smartFilters()->find($filter['id'])->update(['sort_order' => $filter['sort_order']]);
        });

        return redirect()->route('dashboard.index');
    }
}
