<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\CamelCaseMapper;

class StarData extends Data
{
    #[MapOutputName(CamelCaseMapper::class)]
    public function __construct(
        public int $id,
        public int $user_id,
        public int $repo_id,
        public ?string $notes,
        public ?array $meta,
        #[DataCollectionOf(TagData::class)]
        public readonly DataCollection $tags,
    ) {
    }
}
