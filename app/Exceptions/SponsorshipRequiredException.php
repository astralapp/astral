<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Data\Enums\Ability;
use Illuminate\Http\Request;
use RuntimeException;

/**
 * Thrown when a non-sponsor attempts a gated action. Renders itself so callers
 * never have to translate it: the web client reads the `sponsorship_required`
 * error and opens the sponsorship dialog, the extension API gets a 403.
 */
class SponsorshipRequiredException extends RuntimeException
{
    public function __construct(public readonly Ability $ability, string $message = 'An active sponsorship is required.')
    {
        parent::__construct($message);
    }

    public function render(Request $request)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $this->getMessage(),
                'sponsorshipRequired' => $this->ability->value,
            ], 403);
        }

        return back()->withErrors(['sponsorship_required' => $this->ability->value]);
    }
}
