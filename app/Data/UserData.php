<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\CamelCaseMapper;
use Spatie\LaravelData\Attributes\MapOutputName;

#[MapOutputName(CamelCaseMapper::class)]
class UserData extends Data
{
    public function __construct(
        public readonly int $id,
        public readonly int $github_id,
        public readonly string $username,
        public readonly ?string $name,
        public readonly ?string $access_token,
        public readonly ?string $scope,
        public readonly ?string $avatar,
        public readonly ?bool $is_sponsor,
    ) {
    }
}
