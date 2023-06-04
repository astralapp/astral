<?php

namespace App\Data;

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
}
