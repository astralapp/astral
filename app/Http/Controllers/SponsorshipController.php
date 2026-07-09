<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\Sponsorship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class SponsorshipController extends Controller
{
    public function __invoke(Request $request, Sponsorship $sponsorship)
    {
        if (config('app.check_for_sponsorship')) {
            try {
                $sponsorship->updateUserSponsorshipStatus($request->user());
            } catch (Throwable $e) {
                // A GitHub lookup failure on a manual recheck must degrade to a toast,
                // not a 500. Login handles the same failure the same way.
                Log::warning('Manual sponsorship recheck failed', ['user_id' => $request->user()->id, 'exception' => $e]);

                return back()->with('error', "We couldn't verify your sponsorship right now. Please try again in a moment.");
            }
        }

        return redirect()->route('dashboard.show');
    }
}
