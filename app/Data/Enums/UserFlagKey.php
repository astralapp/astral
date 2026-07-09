<?php

declare(strict_types=1);

namespace App\Data\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum UserFlagKey: string
{
    // Persisted in the user_flags.key column; changing the value orphans existing rows.
    case MIGRATION = 'legacy-migration';
    case WELCOME = 'pending-welcome';
}
