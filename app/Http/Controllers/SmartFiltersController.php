<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Enums\Ability;
use App\Models\SmartFilter;
use Illuminate\Http\Request;

class SmartFiltersController extends Controller
{
    public function store(Request $request)
    {
        if (auth()->user()->cannot('create', SmartFilter::class)) {
            return redirect()->back()->withErrors([
                'sponsorship_required' => [Ability::CREATE_SMART_FILTER],
            ]);
        }

        $request->validate([
            'name' => 'bail|required|unique:smart_filters,name,NULL,id,user_id,' . auth()->id(),
            'body' => 'required',
        ], [
            'required' => 'You must provide a name for your smart filter.',
            'unique' => 'You already have a smart filter with that name.',
        ]);

        auth()->user()->smartFilters()->create($request->only(['name', 'body']));

        return redirect()->route('dashboard.show');
    }

    public function update(Request $request, SmartFilter $smartFilter)
    {
        $request->validate([
            'name' => 'bail|required|unique:smart_filters,name,' . $smartFilter->id . ',id,user_id,' . auth()->id(),
            'body' => 'required',
        ], [
            'required' => 'You must provide a name for your smart filter.',
            'unique' => 'You already have a smart filter with that name.',
        ]);

        $smartFilter->update($request->only(['name', 'body']));

        return redirect()->route('dashboard.show');
    }

    public function destroy(SmartFilter $smartFilter)
    {
        $smartFilter->delete();

        return redirect()->route('dashboard.show');
    }
}
