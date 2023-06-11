<?php

namespace App\Data;

use App\Data\Enums\Limit;
use App\Models\User;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\CamelCaseMapper;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\TypeScriptTransformer\Attributes\RecordTypeScriptType;

#[MapOutputName(CamelCaseMapper::class)]
class DashboardData extends Data
{
    public function __construct(
        #[DataCollectionOf(TagData::class)]
        public DataCollection $tags,
        #[DataCollectionOf(StarData::class)]
        public DataCollection $stars,
        #[DataCollectionOf(SmartFilterData::class)]
        public DataCollection $smart_filters,
        #[RecordTypeScriptType(Limit::class, 'int')]
        public readonly array $limits,
    ) {
    }

    public static function fromModel(User $user): self
    {
        return new self(
            TagData::collection($user->tags()->withStarCount()->get()),
            StarData::collection($user->stars()->with('tags')->get()),
            SmartFilterData::collection($user->smartFilters),
            $user->limits()
        );
    }
}
