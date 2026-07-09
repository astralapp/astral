<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Enums\Ability;
use App\Exceptions\SponsorshipRequiredException;
use App\Lib\FeatureAccess;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Abort with a self-rendering sponsorship prompt unless the user may perform
     * the gated action. Keeps the check and its response shape in one place.
     */
    protected function ensureCan(User $user, Ability $ability): void
    {
        if (! app(FeatureAccess::class)->allows($user, $ability)) {
            throw new SponsorshipRequiredException($ability);
        }
    }
}
