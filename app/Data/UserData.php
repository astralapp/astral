<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\CamelCaseMapper;

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
        public readonly UserSettingsData $settings,
        #[DataCollectionOf(UserFlagData::class)]
        public readonly DataCollection $flags,
    ) {
    }
}
