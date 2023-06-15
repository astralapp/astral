<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class FlashBagData extends Data
{
    public function __construct(
        public readonly ?string $success,
        public readonly ?string $error,
    ) {
    }
}
