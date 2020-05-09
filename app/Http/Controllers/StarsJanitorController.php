<?php

namespace Astral\Http\Controllers;

use Astral\Lib\StarsJanitor;

class StarsJanitorController extends Controller
{
    protected $janitor;

    public function __construct(StarsJanitor $janitor)
    {
        $this->janitor = $janitor;
    }

    public function destroy()
    {
        $this->janitor->deleteEmptyStars();

        return auth()->user()->stars()->with('tags')->get();
    }
}
