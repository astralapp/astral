<?php

declare(strict_types=1);

namespace App\Data\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum Appearance: string
{
    case LIGHT = 'light';

    case DARK = 'dark';

    case SYSTEM = 'system';
}
