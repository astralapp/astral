<?php

declare(strict_types=1);

namespace App\Requests;

use App\Models\User;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Data;

class UpdateUserSettingsRequest extends Data
{
    public function __construct(
        #[In(User::AVAILABLE_SETTINGS)]
        public readonly string $key,
        public readonly bool $enabled, // TODO: Consider changing to value
    ) {
    }
}
