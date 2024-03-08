<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\User;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\CamelCaseMapper;

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
    ) {
    }

    public static function fromModel(User $user): self
    {
        return new self(
            TagData::collection($user->tags()->withStarCount()->get()),
            StarData::collection($user->stars()->with('tags')->get()),
            SmartFilterData::collection($user->smartFilters),
        );
    }
}
