<?php

namespace Astral\Http\Controllers;

use Astral\Lib\Autotagger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AutotagController extends Controller
{
    protected $autotagger;

    public function __construct(Autotagger $autotagger)
    {
        $this->middleware('auth:api');
        $this->autotagger = $autotagger;
    }

    public function update(Request $request)
    {
        $stars = Cache::get(auth()->user()->starsCacheKey());

        $this->autotagger->tagByTopic($stars);

        return [
            'stars' => auth()->user()->stars()->with('tags')->get(),
            'tags'  => auth()->user()->tags()->withStarCount()->get(),
        ];
    }
}
