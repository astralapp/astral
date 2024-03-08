<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\DashboardData;

class DashboardController extends Controller
{
    public function show()
    {
        return hybridly('dashboard', DashboardData::fromModel(auth()->user()));
    }
}
