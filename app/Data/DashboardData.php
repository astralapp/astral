<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\User;
use Hybridly\Support\Deferred;
use Illuminate\Support\Collection;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\CamelCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;

use function Hybridly\deferred;

#[MapOutputName(CamelCaseMapper::class)]
class DashboardData extends Data
{
    public function __construct(
        /** @var Collection<int, TagData> */
        public Collection $tags,
        #[LiteralTypeScriptType('Array<App.Data.StarData>')]
        /** @var Collection<int, StarData> */
        public Deferred $stars,
        /** @var Collection<int, SmartFilterData> */
        public Collection $smart_filters,
    ) {
    }

    public static function fromModel(User $user): self
    {
        return new self(
            tags: TagData::collect($user->tags()->withStarCount()->get()),
            stars: deferred(fn () => StarData::collect($user->stars()->with('tags')->get())),
            smart_filters: SmartFilterData::collect($user->smartFilters),
        );
    }
}
