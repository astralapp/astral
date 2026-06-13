<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Lib\Sponsorship;
use Illuminate\Http\Request;

class SponsorshipController extends Controller
{
    public function __invoke(Request $request, Sponsorship $sponsorship)
    {
        if (config('app.check_for_sponsorship')) {
            $sponsorship->updateUserSponsorshipStatus($request->user());
        }

        return redirect()->route('dashboard.show');
    }
}
