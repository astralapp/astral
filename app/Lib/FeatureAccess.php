<?php

declare(strict_types=1);

namespace App\Lib;

use App\Data\Enums\Ability;
use App\Models\User;

/**
 * Single source of truth for sponsorship-gated entitlements. Policies, the
 * shared UserData payload, and controller checks all resolve through here, so a
 * new gated feature is one Ability case plus one match arm — the exhaustive
 * match makes a missing arm fail loudly instead of silently allowing access.
 */
class FeatureAccess
{
    public function allows(User $user, Ability $ability): bool
    {
        return match ($ability) {
            Ability::CREATE_TAG => $user->isSponsor() || $user->tags()->count() < config('limits.max_tags'),
            Ability::CREATE_SMART_FILTER => $user->isSponsor(),
            Ability::ADD_NOTES => $user->isSponsor(),
        };
    }

    /**
     * Whether the user is within the tag cap after a sync that may have created
     * tags. Checked post-write, so the cap is inclusive (<=), unlike CREATE_TAG.
     */
    public function canSyncTags(User $user): bool
    {
        return $user->isSponsor() || $user->tags()->count() <= config('limits.max_tags');
    }

    /**
     * The ability map shared with the client, derived from the enum so the
     * frontend stays in sync without a hand-maintained list.
     *
     * @return array<string, bool>
     */
    public function map(User $user): array
    {
        return collect(Ability::cases())
            ->mapWithKeys(fn (Ability $ability): array => [$ability->value => $this->allows($user, $ability)])
            ->all();
    }
}
