<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class UserFlagData extends Data
{
    public function __construct(
        public readonly string $key,
        public readonly bool $value,
    ) {
    }
}
