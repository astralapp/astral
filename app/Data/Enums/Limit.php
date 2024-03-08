<?php

declare(strict_types=1);

namespace App\Data\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum Limit: string
{
    case MAX_TAGS = 'max_tags';
}
