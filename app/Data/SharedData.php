<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class SharedData extends Data
{
    public function __construct(
        public readonly SecurityData $security,
    ) {
    }
}
