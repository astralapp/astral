<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\User;
use Illuminate\Support\Collection;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\CamelCaseMapper;

#[MapOutputName(CamelCaseMapper::class)]
class DashboardData extends Data
{
    public function __construct(
        /** @var Collection<int, TagData> */
        public Collection $tags,
        /** @var Collection<int, StarData> */
        public Collection $stars,
        /** @var Collection<int, SmartFilterData> */
        public Collection $smart_filters,
    ) {
    }

    public static function fromModel(User $user): self
    {
        return new self(
            TagData::collect($user->tags()->withStarCount()->get()),
            StarData::collect($user->stars()->with('tags')->get()),
            SmartFilterData::collect($user->smartFilters),
        );
    }
}
