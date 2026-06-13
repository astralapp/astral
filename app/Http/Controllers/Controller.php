<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Enums\Ability;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Signal that an action is gated behind an active sponsorship. The client's
     * error hook reads `sponsorship_required` and opens the sponsorship dialog.
     */
    protected function sponsorshipRequired(Ability $ability): RedirectResponse
    {
        return back()->withErrors(['sponsorship_required' => $ability->value]);
    }
}
