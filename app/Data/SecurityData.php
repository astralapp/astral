<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class SecurityData extends Data
{
    public function __construct(
        public readonly ?UserData $user
    ) {
    }
}
