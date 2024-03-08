<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Data\SecurityData;
use App\Data\SharedData;
use App\Data\UserData;
use Hybridly\Http\Middleware;

class HandleHybridRequests extends Middleware
{
    protected array $persistent = [
        'security.user',
    ];

    /**
     * Defines the properties that are shared to all requests.
     */
    public function share(): SharedData
    {
        return SharedData::from([
            'security' => SecurityData::from([
                'user' => UserData::optional(auth()->user()),
            ]),
        ]);
    }
}
