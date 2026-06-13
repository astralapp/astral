<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\User;

class StarsJanitor
{
    public function deleteEmptyStars(User $user): static
    {
        $user
            ->stars()
            ->doesntHave('tags')
            ->whereNull('notes')
            ->get()
            ->each
            ->delete();

        return $this;
    }
}
