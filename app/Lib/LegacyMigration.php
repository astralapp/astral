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

    public function hasLegacyAccount(User $user): bool
    {
        return DB::connection('legacy')
            ->table('users')
            ->where('github_id', $user->github_id)
            ->exists();
    }

    public function markAsMigratedUnlessLegacy(User $user): void
    {
        if ($this->isEnabled() && $this->hasLegacyAccount($user)) {
            return;
        }

        $user->markAsMigrated();
    }
}
