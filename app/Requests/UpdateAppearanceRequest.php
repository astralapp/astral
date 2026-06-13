<?php

declare(strict_types=1);

namespace App\Requests;

use App\Data\Enums\Appearance;
use Spatie\LaravelData\Data;

class UpdateAppearanceRequest extends Data
{
    public function __construct(
        public readonly Appearance $appearance,
    ) {}
}
