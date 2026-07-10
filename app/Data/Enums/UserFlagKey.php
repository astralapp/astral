<?php

declare(strict_types=1);

namespace App\Data\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum UserFlagKey: string
{
    // Persisted in the user_flags.key column; changing the value orphans existing rows.
    //
    // Convention: a flag records a completed milestone. A set/true flag means the
    // user has done the thing; an absent or false flag means they have not yet.
    // Name each key for the achieved state ("...-completed"/"migrated"), never a
    // pending one, and gate on the absence of completion rather than the presence
    // of a pending marker.
    case MIGRATION = 'legacy-migration';
    case WELCOME = 'welcome-completed';
    case TOUR = 'app-tour-completed';
}
