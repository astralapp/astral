<?php

namespace App\Data;

use App\Data\Enums\Ability;
use App\Data\Enums\Limit;
use App\Models\User;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\CamelCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\RecordTypeScriptType;

#[MapOutputName(CamelCaseMapper::class)]
class UserData extends Data
{
    public function __construct(
        public readonly int $id,
        public readonly int $github_id,
        public readonly string $username,
        public readonly ?string $name,
        public readonly ?string $access_token,
        public readonly ?string $scope,
        public readonly ?string $avatar,
        public readonly ?bool $is_sponsor,
        public readonly UserSettingsData $settings,
        #[DataCollectionOf(UserFlagData::class)]
        public readonly DataCollection $flags,
        #[RecordTypeScriptType(Limit::class, 'int')]
        public readonly array $limits,
        #[RecordTypeScriptType(Ability::class, 'bool')]
        public readonly array $abilities,
    ) {
    }

    public static function fromModel(User $user): self
    {
        return new self(
            $user->id,
            $user->github_id,
            $user->username,
            $user->name,
            $user->access_token,
            $user->scope,
            $user->avatar,
            $user->is_sponsor,
            UserSettingsData::from($user->settings),
            UserFlagData::collection($user->flags),
            $user->limits(),
            [
                'create_tag'          => $user->can('create', Tag::class),
                'create_smart_filter' => $user->can('create', SmartFilter::class),
                'add_notes'           => $user->can('addNotes', Star::class),
            ]
        );
    }
}
