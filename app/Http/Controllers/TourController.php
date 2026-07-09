<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class TourController extends Controller
{
    /**
     * Record that the user has seen the app tour. Fired whether they finish or skip.
     * Idempotent: replaying the tour re-posts here and simply re-sets the flag.
     */
    public function complete(): JsonResponse
    {
        auth()->user()->markTourCompleted();

        return response()->json(['done' => true]);
    }
}
