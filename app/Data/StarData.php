<?php

declare(strict_types=1);

namespace App\Data;

use Illuminate\Support\Collection;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
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
        /** @var Collection<int, TagData> */
        public readonly Collection $tags,
    ) {
    }
}
