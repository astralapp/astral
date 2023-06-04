<?php

namespace App\Lib;

use App\Models\User;

class StarsJanitor
{
    public function __construct(public User $user)
    {
    }

    public function deleteEmptyStars()
    {
        throw_unless($this->user);

        $this->user->stars()->doesntHave('tags')->whereNull('notes')->get()->each->delete();

        return $this;
    }
}
