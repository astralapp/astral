<?php

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

        return $user->tags()->count() < config('limits.max_tags');
    }

    public function sync(User $user)
    {
        if ($user->isSponsor()) {
            return true;
        }

        return $user->tags()->count() <= config('limits.max_tags');
    }
}
