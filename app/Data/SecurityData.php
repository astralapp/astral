<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class SecurityData extends Data
{
    public function __construct(
        public readonly ?UserData $user
    ) {
    }
}
