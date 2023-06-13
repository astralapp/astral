<?php

namespace App\Data;

use App\Models\User;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\Validation\In;

class UpdateUserSettingsRequest extends Data
{
    public function __construct(
        #[In(User::AVAILABLE_SETTINGS)]
        public readonly string $key,
        public readonly bool $enabled, // TODO: Consider changing to value
    ) {
    }
}
