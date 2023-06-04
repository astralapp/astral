<?php

namespace App\Http\Controllers;

use App\Lib\Sponsorship;
use App\Lib\StarsJanitor;

class CleanupController extends Controller
{
    protected $janitor;

    protected $sponsorship;

    public function __construct(StarsJanitor $janitor, Sponsorship $sponsorship)
    {
        $this->janitor = $janitor;
        $this->sponsorship = $sponsorship;
    }

    public function index()
    {
        $this->janitor->deleteEmptyStars();

        // TODO: We should potentially move this check to run once when the user signs up, and then provide a singular route to re-check through some UI action in the Settings dialog. ( Fire confetti if true :D )
        if (config('app.check_for_sponsorship')) {
            $this->sponsorship->updateUserSponsorshipStatus();
        }

        return redirect()->route('dashboard.index');
    }
}
