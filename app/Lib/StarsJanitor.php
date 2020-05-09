<?php

namespace Astral\Lib;

class StarsJanitor
{
    public function deleteEmptyStars()
    {
        auth()->user()->stars()->doesntHave('tags')->whereNull('notes')->get()->each->delete();

        return $this;
    }
}
