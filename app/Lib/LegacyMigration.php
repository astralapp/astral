<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class LegacyMigration
{
    public function isEnabled(): bool
    {
        return (bool) config('app.check_for_migration');
    }

    public function legacyUserId(User $user): ?int
    {
        return DB::connection('legacy')
            ->table('users')
            ->where('github_id', $user->github_id)
            ->value('id');
    }

    public function hasLegacyAccount(User $user): bool
    {
        return $this->legacyUserId($user) !== null;
    }

    public function hasLegacyData(User $user): bool
    {
        $legacyId = $this->legacyUserId($user);

        if ($legacyId === null) {
            return false;
        }

        foreach (['stars', 'tags', 'predicates'] as $table) {
            if (DB::connection('legacy')->table($table)->where('user_id', $legacyId)->exists()) {
                return true;
            }
        }

        return false;
    }

    public function markAsMigratedUnlessLegacy(User $user): void
    {
        // Only gate users who actually have legacy data to bring over; a matching
        // GitHub id with no stars/tags/filters has nothing to migrate.
        if ($this->isEnabled() && $this->hasLegacyData($user)) {
            return;
        }

        $user->markAsMigrated();
    }
}
