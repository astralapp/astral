<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TagPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    public function create(User $user)
    {
        if ($user->isSponsor()) {
            return true;
        }

        // Creating adds exactly one tag, so the current count must be below the cap.
        return $user->tags()->count() < config('limits.max_tags');
    }

    public function sync(User $user)
    {
        if ($user->isSponsor()) {
            return true;
        }

        // Checked after a star's tags are synced (which may create tags): the
        // resulting total must not exceed the cap.
        return $user->tags()->count() <= config('limits.max_tags');
    }
}
