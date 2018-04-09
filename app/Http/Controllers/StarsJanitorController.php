<?php

namespace Astral\Http\Controllers;

use Astral\Lib\StarsJanitor;

class StarsJanitorController extends Controller
{
    protected $janitor;

    public function __construct(StarsJanitor $janitor)
    {
        $this->middleware('auth:api');
        $this->janitor = $janitor;
    }

    public function destroy()
    {
        $this->janitor->deleteEmptyStars()->deleteUnstarredStars();

        return auth()->user()->stars()->with('tags')->get();
    }
}
