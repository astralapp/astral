<?php

namespace App\Data\Enums;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
enum Ability: string
{
    case CREATE_TAG = 'create_tag';

    case CREATE_SMART_FILTER = 'create_smart_filter';

    case ADD_NOTES = 'add_notes';
}
