<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\CamelCaseMapper;
use Spatie\LaravelData\Attributes\MapOutputName;

class SmartFilterData extends Data
{
    #[MapOutputName(CamelCaseMapper::class)]
    public function __construct(
        public int $id,
        public string $name,
        public string $body,
        public int $user_id,
        public int $sort_order,
    ) {
    }
}
