<?php

namespace App\Http\Controllers;

use App\Lib\Abilities;
use App\Models\SmartFilter;
use App\Models\Star;
use App\Models\Tag;

class DashboardController extends Controller
{
    public function show()
    {
        return hybridly('dashboard', [
            'limits'    => auth()->user()->limits(),
            'abilities' => [
                Abilities::CREATE_TAG          => auth()->user()->can('create', Tag::class),
                Abilities::CREATE_SMART_FILTER => auth()->user()->can('create', SmartFilter::class),
                Abilities::ADD_NOTES           => auth()->user()->can('addNotes', Star::class),
            ],
            'tags'         => auth()->user()->tags()->withStarCount()->get(),
            'stars'        => auth()->user()->stars()->with('tags')->get(),
            'smartFilters' => auth()->user()->smartFilters()->get(),
        ]);
    }
}
